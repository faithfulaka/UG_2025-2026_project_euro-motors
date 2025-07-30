import { NextRequest, NextResponse } from 'next/server';
import { carQueryService } from '@/lib/services';
import { getBaseMSRP } from '../../../../lib/services/nhtsa-api';
import { getDepreciation } from '@/lib/services/wikipedia-api';
import { getDealerPricing } from '@/lib/services/marketcheck-api';
import { getAuctionHistory } from '../../../../lib/services/ebay-api';
import { getOwnershipCosts } from '../../../../lib/services/dvla-api';

export async function POST(req: NextRequest) {
  const { make, model, year } = await req.json();

  if (!make || !model || !year) {
    return NextResponse.json(
      { error: 'Missing required fields: make, model, year' },
      { status: 400 }
    );
  }

  try {
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
      getDealerPricing(make, model, String(year)),
      getAuctionHistory(make, model, String(year)),
      getOwnershipCosts(make, model, Number(year))
    ]);

    return NextResponse.json({
      basicSpecs: specs,
      pricingData: {
        baseMSRP: msrpInfo?.msrp ?? null,
        marketRange: dealerPricing?.currentRange ?? null,
        averageDealerPrice: dealerPricing?.averageDealerPrice ?? null,
        dealerInventoryCount: dealerPricing?.inventoryCount ?? null
      },
      depreciation,
      auctionHistory: auctions,
      ownershipCosts: ownership
    });
  } catch (error) {
    console.error('Error in /api/spa/search:', error);
    return NextResponse.json(
      { error: 'Unable to fetch vehicle data' },
      { status: 500 }
    );
  }
}