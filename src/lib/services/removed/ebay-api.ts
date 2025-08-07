// src/lib/services/ebay-api.ts
import fetch from 'node-fetch';

const EBAY_APP_ID = process.env.EBAY_APP_ID!;

export interface AuctionHistoryEntry {
  price: number;
  date: string;
  miles?: number;
}

export async function getAuctionHistory(
  make: string,
  model: string,
  year: string | number
): Promise<AuctionHistoryEntry[]> {
  const yearStr = typeof year === 'number' ? String(year) : year;
  const query = encodeURIComponent(`${yearStr} ${make} ${model}`);
  const url =
    `https://svcs.ebay.com/services/search/FindingService/v1` +
    `?OPERATION-NAME=findCompletedItems` +
    `&SERVICE-VERSION=1.0.0` +
    `&SECURITY-APPNAME=${EBAY_APP_ID}` +
    `&RESPONSE-DATA-FORMAT=JSON` +
    `&keywords=${query}` +
    `&itemFilter(0).name=SoldItemsOnly` +
    `&paginationInput.entriesPerPage=5`;

  const res = await fetch(url);
  const json = await res.json();
  const items = json.findCompletedItemsResponse?.[0]?.searchResult?.[0]?.item || [];

  interface EbayItem {
    sellingStatus: Array<{
      currentPrice: Array<{
        __value__: string;
      }>;
    }>;
    listingInfo: Array<{
      endTime: string[];
    }>;
  }
  
  return items.map((i: EbayItem) => ({
    price: parseFloat(i.sellingStatus[0].currentPrice[0].__value__),
    date: i.listingInfo[0].endTime[0],
    miles: undefined,
  }));
}