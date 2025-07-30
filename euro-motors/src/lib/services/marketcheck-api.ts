//src/lib/services/marketcheck-api.ts
import fetch from 'node-fetch';
const MARKETCHECK_KEY = process.env.MARKETCHECK_API_KEY!

export async function getDealerPricing(make: string, model: string, year: string | number) {
  const res = await fetch(
    `https://marketcheck-prod.apigee.net/v2/search?api_key=${MARKETCHECK_KEY}` +
    `&make=${encodeURIComponent(make)}` +
    `&model=${encodeURIComponent(model)}` +
    `&year=${encodeURIComponent(year)}`
  );
  const json = await res.json();
  return {
    averageDealerPrice: json.average_price || null,
    currentRange: [json.min_price, json.max_price],
    inventoryCount: json.total_listings,
    priceTrend: json.price_trend // ±% over last 30 days
  };
}