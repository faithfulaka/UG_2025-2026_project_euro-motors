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
    // Map all listings to canonical MarketListing interface
    const canonicalizeListing = (listing: Record<string, unknown>): import('@/types/spa').MarketListing => ({
      title: typeof listing.title === 'string' ? listing.title : '',
      price: typeof listing.price === 'string' ? listing.price : (typeof listing.price === 'number' ? `£${listing.price.toLocaleString()}` : ''),
      priceNumeric: typeof listing.priceNumeric === 'number' ? listing.priceNumeric : (typeof listing.price === 'number' ? listing.price : 0),
      mileage: typeof listing.mileage === 'string' ? listing.mileage : (listing.mileage ? String(listing.mileage) : undefined),
      year: typeof listing.year === 'number' ? listing.year : undefined,
      location: typeof listing.location === 'string' ? listing.location : '',
      dealer: typeof listing.dealer === 'string' ? listing.dealer : (typeof listing.dealerName === 'string' ? listing.dealerName : ''),
      specs: typeof listing.specs === 'string' ? listing.specs : '',
      url: typeof listing.url === 'string' ? listing.url : (typeof listing.listingUrl === 'string' ? listing.listingUrl : ''),
      imageUrl: typeof listing.imageUrl === 'string' ? listing.imageUrl : (Array.isArray(listing.images) && typeof listing.images[0] === 'string' ? listing.images[0] : undefined),
      datePosted: typeof listing.datePosted === 'string' ? listing.datePosted : undefined
    });
    const firstMarketData = Array.isArray(response.data) && response.data.length > 0
      ? {
          ...response.data[0],
          listings: Array.isArray(response.data[0].listings)
            ? response.data[0].listings.map(canonicalizeListing)
            : [],
          priceDistribution: {
            min: response.data[0].priceDistribution?.min ?? 0,
            max: response.data[0].priceDistribution?.max ?? 0,
            median: response.data[0].priceDistribution?.median ?? 0,
            q1: response.data[0].priceDistribution?.q1 ?? 0,
            q3: response.data[0].priceDistribution?.q3 ?? 0
          }
        }
      : undefined;
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