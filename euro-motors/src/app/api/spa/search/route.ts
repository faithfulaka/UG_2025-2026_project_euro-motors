// src/app/api/spa/search/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { carQueryService } from '@/lib/services';
import { getBaseMSRP } from '@/lib/services/nhtsa-api';
import { getDepreciation } from '@/lib/services/wikipedia-api';
import { getDealerPricing } from '@/lib/services/marketcheck-api';
import { getAuctionHistory } from '@/lib/services/ebay-api';
import { getOwnershipCosts } from '@/lib/services/dvla-api';

export async function POST(req: NextRequest) {
  const { make, model, year } = await req.json();
  if (!make || !model || !year) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const [
    specs,
    msrpInfo,
    depreciation,
    dealerPricing,
    auctions,
    ownership
  ] = await Promise.all([
    carQueryService.getVehicleInfo(make, model, String(year)),
    getBaseMSRP(make, model, Number(year)),
    getDepreciation(make, model, Number(year)),
    getDealerPricing(make, model, Number(year)),
    getAuctionHistory(make, model, Number(year)),
    getOwnershipCosts(make, model, Number(year))
  ]);

  return NextResponse.json({
    basicSpecs: specs,
    pricingData: {
      baseMSRP: msrpInfo?.msrp ?? null,
      marketRange: dealerPricing?.priceRange ?? null,
      averageDealerPrice: dealerPricing?.averagePrice ?? null,
      dealerInventoryCount: dealerPricing?.inventoryCount ?? null
    },
    performance: {
      depreciation,
      ...(specs
        ? { engine: `${(specs as any).model_engine_cc}cc ${(specs as any).model_engine_type}` }
        : {})
    },
    auctionHistory: auctions,
    ownershipCosts: ownership
  });
}