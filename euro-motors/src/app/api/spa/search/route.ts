import type { NextRequest }          from 'next/server';
import     { NextResponse }         from 'next/server';
import     { autotraderScraper }    from '@/lib/scrapers/autotrader';
import { getBringATrailerAuctionHistory } from '@/lib/scrapers/bringatrailer';
import { getParkersDepreciationAndOwnership } from '@/lib/scrapers/parkers';
import { carQueryAPI } from '@/lib/services';
import type { SPASearchParams, SPASearchResponse, ComprehensiveSPAData } from '@/types/spa';

export async function POST(req: NextRequest) {
  const params = (await req.json()) as SPASearchParams;

  // --- Scrape all sources in parallel ---
  const [marketR, auctionHistory, parkersData] = await Promise.all([
    autotraderScraper.searchCars(params.make, params.model, params.year),
    getBringATrailerAuctionHistory(params.make, params.model, params.year?.toString()),
    getParkersDepreciationAndOwnership(params.make, params.model, params.year?.toString()),
  ]);

  // --- CarQuery API for specs (optional, can be replaced with real scraper later) ---
  const trimsResponse = await carQueryAPI.getTrims(params.make, params.model, params.year?.toString());
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
  const marketData = marketR.success ? marketR.data : undefined;
  // Auction history (Bring a Trailer)
  // Depreciation/ownership (Parkers)
  const { depreciation: depreciationData, ownership: ownershipCosts } = parkersData;

  // TODO: If you add more scrapers, merge their results here

  const manufacturerData = undefined;

  const result: ComprehensiveSPAData = {
    make:                params.make,
    model:               params.model,
    year:                params.year ?? 0,
    basicSpecifications: basicSpecs,
    performanceData,
    pricingData:         undefined,
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