// src/lib/services/marketcheck-api.ts
import fetch from 'node-fetch';

const MARKETCHECK_API_KEY = process.env.MARKETCHECK_API_KEY!;

export interface DealerPricing {
  priceRange: [number, number];
  averagePrice: number;
  inventoryCount: number;
  trend24h?: number;
}

export async function getDealerPricing(
  make: string,
  model: string,
  year: string | number
): Promise<DealerPricing | null> {
  const url = `https://marketcheck-prod.apigee.net/v1/search?api_key=${MARKETCHECK_API_KEY}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}&rows=50`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();

    const prices: number[] = data.listings
      ?.map((l: any) => l.price)
      .filter((p: number) => typeof p === 'number');

    if (!prices || prices.length === 0) return null;

    const avgPrice = prices.reduce((sum: number, p: number) => sum + p, 0) / prices.length;
    const range: [number, number] = [Math.min(...prices), Math.max(...prices)];

    return {
      priceRange: range,
      averagePrice: avgPrice,
      inventoryCount: prices.length
    };
  } catch (err) {
    console.error('MarketCheck API error:', err);
    return null;
  }
}