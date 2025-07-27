// src/app/api/spa/search/route.ts
import type { NextRequest }          from "next/server";
import { NextResponse }              from "next/server";
import type { SPASearchParams }      from "@/types/spa";
import type { ComprehensiveSPAData } from "@/types/spa";

const EMPTY_SOURCES = {
  database:     false,
  carQuery:     false,
  manufacturer: false,
  market:       false,
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as SPASearchParams;
  const { make, model, year, dataSource } = body;

  const result: ComprehensiveSPAData = {
    make,
    model,
    year:       year ?? new Date().getFullYear(),
    dataSource,
    basicSpecifications: undefined,
    performanceData:     undefined,
    pricingData:         undefined,
    manufacturerData:    undefined,
    marketData:          undefined,
    popularOptions:      [],
    dataSources:         EMPTY_SOURCES,
    searchQuery:         body,
    timestamp:           new Date().toISOString(),
    cacheExpiry:         undefined,
  };

  return NextResponse.json({
    success: true,
    data:    result,
  });
}