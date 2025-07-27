// src/app/api/spa/search/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse }     from 'next/server';

import type {
  SPASearchParams,
  SPASearchResponse,
  ComprehensiveSPAData,
  MarketData,
  ManufacturerData
} from '@/types/spa';

// 🔑 Make sure this path matches your file system:
import { carQueryClient }             from '@/lib/services/carquery';
import { autotraderScraper }          from '@/lib/scrapers/autotrader';
import { porscheConfiguratorScraper } from '@/lib/scrapers/porsche';

export async function POST(request: NextRequest) {
  const params = (await request.json()) as SPASearchParams;
  const { make, model, year, dataSource } = params;
  const start = Date.now();

  try {
    //
    // 1) Get basic specs from CarQuery
    //
    const basicSpecs = await carQueryClient.getTrims(
      make,
      model,
      year ?? new Date().getFullYear()
    );

    //
    // 2) If “Manufacturer” source, scrape Porsche configurator
    //
    const porscheRes = await porscheConfiguratorScraper.getCarPricing(
      `${make} ${model}`
    );

    // Map Porsche result into your ManufacturerData shape
    const manufacturerData: ManufacturerData | undefined =
      !porscheRes.error && porscheRes.basePrice
        ? {
            make,
            model,
            year: year ?? new Date().getFullYear(),
            trim: undefined,
            bodyType: undefined,
            pricing: {
              basePrice:  parseFloat(porscheRes.basePrice),
              currency:   'GBP',
              totalPrice: porscheRes.totalPrice
                ? parseFloat(porscheRes.totalPrice)
                : undefined,
              options: (porscheRes.options ?? []).map(o => ({
                id:           undefined,
                name:         o.name,
                description:  undefined,
                price:        parseFloat(o.price),
                currency:     'GBP',
                isPopular:    false,
                availability: 'optional'
              })),
              packages:     [],
              deliveryTime: undefined,
              availability: 'available'
            },
            specifications: basicSpecs?.basicSpecifications,
            colors:         [],
            dataSource:     porscheRes.dataSource ?? 'manufacturer',
            configuratorUrl: undefined,
            lastUpdated:    new Date().toISOString()
          }
        : undefined;

    //
    // 3) Always scrape the live market data via Autotrader
    //
    const atRes = await autotraderScraper.searchCars(make, model, year);

    // Carve out only the min/max/median so it matches your MarketData type
    const rawDist = atRes.data?.priceDistribution;
    const dist =
      rawDist && rawDist.min != null
        ? { min: rawDist.min, max: rawDist.max, median: rawDist.median }
        : undefined;

    const marketData: MarketData = {
      listings:           atRes.data?.listings           ?? [],
      averagePrice:       atRes.data?.averagePrice       ?? 0,
      priceRange:         atRes.data?.priceRange         ?? '',
      inventoryCount:     atRes.data?.inventoryCount     ?? 0,
      priceDistribution:  dist,
      dataSource:         atRes.data?.dataSource         ?? 'Autotrader',
      searchParams:       { make, model, year },
      timestamp:          atRes.data?.timestamp          ?? new Date().toISOString()
    };

    //
    // 4) Stitch together the full ComprehensiveSPAData
    //
    const fullData: ComprehensiveSPAData = {
      make,
      model,
      year:                year ?? new Date().getFullYear(),
      trim:                undefined,
      bodyType:            undefined,
      basicSpecifications: basicSpecs?.basicSpecifications,
      performanceData:     basicSpecs?.performanceData,
      pricingData:         basicSpecs?.pricingData,
      manufacturerData,
      marketData,
      popularOptions: manufacturerData
        ? manufacturerData.pricing.options.map(o => ({
            name: o.name,
            source: 'manufacturer',
            frequency: undefined
          }))
        : [],
      dataSources: {
        database:     false,
        carQuery:     !!basicSpecs,
        manufacturer: !!manufacturerData,
        market:       atRes.success
      },
      dataSource,
      searchQuery:        params,
      timestamp:          new Date().toISOString(),
      cacheExpiry:        undefined
    };

    // Build your API response
    const response: SPASearchResponse = {
      success: true,
      data:    fullData,
      meta: {
        searchQuery:   params,
        executionTime: Date.now() - start,
        timestamp:     new Date().toISOString(),
        version:       '1.0.0'
      }
    };

    return NextResponse.json(response);

  } catch (err: unknown) {
    console.error('❌ SPA Search Error:', err);

    const response: SPASearchResponse = {
      success: false,
      error: {
        code:    'SEARCH_FAILED',
        message: err instanceof Error ? err.message : 'Unknown error'
      },
      meta: {
        searchQuery:   params,
        executionTime: Date.now() - start,
        timestamp:     new Date().toISOString(),
        version:       '1.0.0'
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}