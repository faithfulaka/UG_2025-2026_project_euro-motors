// src/app/api/spa/search/route.ts

import { NextResponse } from 'next/server';
import { carQueryService } from '@/lib/services';
import getWikipediaSummary from '@/lib/services/wikipedia-api';

interface CarSearchResult {
  basicSpecs: {
    model_make_id: string;
    model_name: string;
    model_year: string;
    model_body?: string | null;
    model_engine_cc?: string | null;
    model_engine_type?: string | null;
  };
  pricingData: {
    baseMSRP?: number | null;
    marketRange?: string | null;
    averageDealerPrice?: number | null;
    dealerInventoryCount?: number | null;
  };
  ownershipCosts?: {
    annualTax?: number | null;
    insuranceGroup?: string | null;
    fuelCostPerYear?: number | null;
  };
  performance?: {
    depreciation?: unknown[];
    engine?: string | null;
  };
  auctionHistory?: unknown[];
  wikiSummary?: string;
  image?: string | null;
}

export async function POST(req: Request) {
  try {
    const { make, model, year } = await req.json();

    if (!make || !model || !year) {
      return NextResponse.json({ error: 'Missing make, model or year' }, { status: 400 });
    }

    // Fetch core car specs from CarQuery service
    const trims = await carQueryService.getCarData(make, model, year);
    const specs = trims[0] ?? {};

    // Wikipedia fallback
    const { summary: wikiSummary, image: wikiImage } = await getWikipediaSummary(make, model);

    const response: CarSearchResult = {
      basicSpecs: {
        model_make_id: make,
        model_name: model,
        model_year: String(year),
        model_body: specs.model_body ?? null,
        model_engine_cc: specs.model_engine_cc ?? null,
        model_engine_type: specs.model_engine_type ?? null,
      },
      pricingData: {
        baseMSRP: specs.model_engine_cc ? Number(specs.model_engine_cc) : null,
        marketRange: null,
        averageDealerPrice: null,
        dealerInventoryCount: null,
      },
      ownershipCosts: {
        annualTax: null,
        insuranceGroup: null,
        fuelCostPerYear: null,
      },
      performance: {
        depreciation: specs.model_0_to_100_kph ? [specs.model_0_to_100_kph] : [],
        engine: specs.model_engine_type ?? null,
      },
      auctionHistory: [],
      wikiSummary,
      image: wikiImage || null,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('[SPA search] Error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}