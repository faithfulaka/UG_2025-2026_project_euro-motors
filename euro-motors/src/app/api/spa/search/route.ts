import type { NextRequest }          from 'next/server';
import     { NextResponse }         from 'next/server';
// All scraping now proxied through scraper-backend
// import { autotraderScraper } from '@/lib/scrapers/autotrader';
// import { getBringATrailerAuctionHistory } from '@/lib/scrapers/bringatrailer';
// import { getParkersDepreciationAndOwnership } from '@/lib/scrapers/parkers';
// import { carQueryService } from '@/lib/services';
// import { porscheConfiguratorScraper } from '@/lib/scrapers/porsche';
// import { McLarenScraper } from '@/lib/scrapers/mclaren';
import type { SPASearchParams, SPASearchResponse, ComprehensiveSPAData, ManufacturerData, ManufacturerPricing } from '@/types/spa';

export async function POST(req: NextRequest) {
  const params = (await req.json()) as SPASearchParams;

  // --- Fetch live market data from scraper-backend ---
  let marketR: any = { success: false, data: null };
  try {
    const resp = await fetch('http://localhost:4001/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ make: params.make, model: params.model, year: params.year })
    });
    marketR = await resp.json();
  } catch (err) {
    console.error('[API/search] Error fetching market data:', err);
  }

  // Stubs for additional sources (to be implemented)
  const auctionHistory: any[] = [];
  const parkersData: any = null;
  const porscheData: any = null;
  const mclarenData: any = null;

  // Compose response (minimal, only market data for now)
  return NextResponse.json({
    success: marketR.success,
    data: {
      marketData: marketR.data,
      auctionHistory,
      parkersData,
      porscheData,
      mclarenData,
    }
  });
    params.make?.toLowerCase() === 'porsche' ? porscheConfiguratorScraper.getCarPricing(params.model) : Promise.resolve(undefined),
    params.make?.toLowerCase() === 'mclaren' ? (new McLarenScraper()).getConfig(params.make, params.model, params.year) : Promise.resolve(undefined),
  ]);

  // --- CarQuery API for specs (optional, can be replaced with real scraper later) ---
  const trimsResponse = await carQueryService.getTrims(params.make, params.model, params.year?.toString());
  const trim = trimsResponse.Trims?.[0];
  const basicSpecs = trim && {
    make:  trim.model_make_display,
    model: trim.model_name,
    year:  parseInt(trim.model_year, 10),
    bodyType: trim.model_body,
    engine:   `${trim.model_engine_cc}cc`,
    doors:    parseInt(trim.model_doors, 10),
    seats:    parseInt(trim.model_seats, 10)
  };
  const performanceData = trim && {
    engine:           trim.model_engine_type,
    horsePower:       `${trim.model_engine_power_ps} PS`,
    torque:           `${trim.model_engine_torque_nm} Nm`,
    acceleration060:  `${trim.model_0_to_100_kph}s`,
    topSpeed:         `${trim.model_top_speed_kph} kph`,
    transmission:     trim.model_transmission_type || 'N/A',
    driveType:        trim.model_drive || 'N/A',
    weight:           trim.model_weight_kg ? `${trim.model_weight_kg} kg` : 'N/A',
    fuelEconomy:      trim.model_lkm_mixed ? `${trim.model_lkm_mixed} L/100km` : undefined
  };

  // --- Merge and map all results to unified schema ---
  // Market data (Autotrader)
  // Auction history (Bring a Trailer)
  // Depreciation/ownership (Parkers)
  const { depreciation: depreciationData, ownership: ownershipCosts } = parkersData;

  // Merge configurator/manufacturer data
  let manufacturerData: ManufacturerData | undefined = undefined;
  let pricingData: ManufacturerPricing | undefined = undefined;

  // Porsche integration: only assign if shape matches ManufacturerData
  if (
    porscheData &&
    typeof porscheData === 'object' &&
    !('error' in porscheData) &&
    typeof porscheData.basePrice === 'string' &&
    typeof porscheData.totalPrice === 'string' &&
    Array.isArray(porscheData.options)
  ) {
    // Map only the fields that exist and match the type
    manufacturerData = {
      make: params.make,
      model: params.model,
      year: params.year ?? new Date().getFullYear(),
      pricing: {
        basePrice: parseFloat(porscheData.basePrice.replace(/[^\d.]/g, '')),
        currency: 'GBP',
        totalPrice: parseFloat(porscheData.totalPrice.replace(/[^\d.]/g, '')),
        options: porscheData.options.map(opt => ({
          name: opt.name,
          price: typeof opt.price === 'string' ? parseFloat(opt.price.replace(/[^\d.]/g, '')) : 0,
          currency: 'GBP',
        })),
      },
      dataSource: 'porsche-configurator',
      lastUpdated: new Date().toISOString(),
    };
    pricingData = manufacturerData.pricing;
  }
  // McLaren integration: only assign if shape matches ManufacturerData
  else if (
    mclarenData &&
    typeof mclarenData === 'object' &&
    !('error' in mclarenData) &&
    typeof mclarenData.make === 'string' &&
    typeof mclarenData.model === 'string' &&
    typeof mclarenData.year === 'number' &&
    typeof mclarenData.pricing === 'object'
  ) {
    manufacturerData = {
      make: mclarenData.make,
      model: mclarenData.model,
      year: mclarenData.year,
      pricing: mclarenData.pricing,
      dataSource: 'mclaren-configurator',
      lastUpdated: mclarenData.lastUpdated || new Date().toISOString(),
      configuratorUrl: mclarenData.configuratorUrl,
      specifications: mclarenData.specifications,
    };
    pricingData = mclarenData.pricing;
  }


  const result: ComprehensiveSPAData = {
    make:                params.make,
    model:               params.model,
    year:                params.year ?? 0,
    basicSpecifications: basicSpecs,
    performanceData,
    // Map ManufacturerPricing to PricingData if possible
    pricingData: pricingData
      ? {
          baseMSRP: pricingData.basePrice ?? 0,
          currentMarketRange: '', // Not available from configurators
          averageDealerPrice: 0,  // Not available from configurators
          dealerInventoryCount: 0, // Not available from configurators
          priceTrend: '', // Not available from configurators
        }
      : undefined,
    manufacturerData,
    marketData:          marketR.data!,
    popularOptions:      [],
    auctionHistory,
    depreciationData,
    ownershipCosts,
    dataSource:          'comprehensive',
    searchQuery:         params,
    timestamp:           new Date().toISOString(),
    dataSources: {
      database: false,
      carQuery: true,
      manufacturer: false,
      market: true
    }
  };

  const body: SPASearchResponse = {
    success: true,
    data:    result,
    meta: {
      searchQuery: params,
      executionTime: 0, // Set to 0 or actual execution time if available
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  };

  return NextResponse.json(body);
}