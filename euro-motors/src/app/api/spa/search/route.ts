import type { NextRequest }          from 'next/server';
import     { NextResponse }         from 'next/server';
import     { autotraderScraper }    from '@/lib/scrapers/autotrader';
import { getBringATrailerAuctionHistory } from '@/lib/scrapers/bringatrailer';
import { getParkersDepreciationAndOwnership } from '@/lib/scrapers/parkers';
import     { carQueryService }      from '@/lib/services';
import type { SPASearchParams, SPASearchResponse, ComprehensiveSPAData } from '@/types/spa';

export async function POST(req: NextRequest) {
  const params = (await req.json()) as SPASearchParams;

  // 1) Market data
  const marketR = await autotraderScraper.searchCars(params.make, params.model, params.year);
  if (!marketR.success) {
    return NextResponse.json({ success:false, error:{ message: marketR.error } } as SPASearchResponse, { status: 502 });
  }

  // 2) CarQuery trims → basic + performance
  const trims = await carQueryService.getTrims(params.make, params.model, params.year);
  const trim  = trims[0];
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
    topSpeed:         `${trim.model_top_speed_kph} kph`
  };

  // 3) Stub manufacturer data until real scraper wired up
  const manufacturerData = undefined;

  // 4) Package full result
  // Fetch auction history from Bring a Trailer using make, model, year
  const auctionHistory = await getBringATrailerAuctionHistory(params.make, params.model, params.year?.toString());

  // Fetch depreciation and ownership costs from Parkers
  const { depreciation: depreciationData, ownership: ownershipCosts } = await getParkersDepreciationAndOwnership(
    params.make,
    params.model,
    params.year?.toString()
  );

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