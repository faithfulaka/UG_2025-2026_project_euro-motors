import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
// Only import scrapers that exist. Comment out broken or missing ones.

// import { carQueryService } from '@/lib/services'; // Not implemented or not needed
// import { porscheConfiguratorScraper } from '@/lib/scrapers/porsche'; // Not implemented
// import { McLarenScraper } from '@/lib/scrapers/mclaren'; // Not implemented

import type { SPASearchParams, SPASearchResponse, ComprehensiveSPAData } from '@/types/spa';

import type { MarketData } from '@/types/spa';

export async function POST(req: NextRequest) {
  const params = (await req.json()) as SPASearchParams;

  // Use robust multi-source scraping for market data
  type MarketScraperResponse = { success: boolean; data: MarketData | undefined };
  let marketR: MarketScraperResponse = { success: false, data: undefined };
  try {
    const { marketScraperService } = await import('@/lib/scrapers/market-scrapers');
    const response = await marketScraperService.scrapeAllMarketData(params.make, params.model, params.year);
    // response.data is MarketData[] | undefined
    const firstMarketData = Array.isArray(response.data) && response.data.length > 0 ? response.data[0] : undefined;
    marketR = { success: response.success, data: firstMarketData };
  } catch (err) {
    console.error('[API/search] Error fetching market data:', err);
  }

  // Compose the result using only available data
  const result: ComprehensiveSPAData = {
    make:                params.make,
    model:               params.model,
    year:                params.year ?? 0,
    basicSpecifications: undefined,
    performanceData:     undefined,
    pricingData:         undefined,
    manufacturerData:    undefined,
    marketData:          marketR.data || undefined,
    popularOptions:      [],
    auctionHistory:      undefined,
    depreciationData:    undefined,
    ownershipCosts:      undefined,
    dataSource:          'comprehensive',
    searchQuery:         params,
    timestamp:           new Date().toISOString(),
    dataSources: {
      database: false,
      carQuery: false,
      manufacturer: false,
      market: true
    }
  };

  const body: SPASearchResponse = {
    success: marketR.success ?? false,
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