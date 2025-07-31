import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { manufacturerScraperService } from '@/lib/services/manufacturer-scrapers';
import type { ManufacturerData, SPAServiceResponse, SPAError } from '@/types/spa';

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const make = url.searchParams.get('make')?.trim() ?? '';
  const model = url.searchParams.get('model')?.trim() ?? '';
  const yearParam = url.searchParams.get('year');
  const year = yearParam ? parseInt(yearParam, 10) : undefined;
  const start = Date.now();

  if (!make || !model) {
    const resp: SPAServiceResponse<ManufacturerData> = {
      success: false,
      error: { code: 'INVALID_PARAMS', message: 'make and model are required' },
      processingTime: 0,
      cached: false,
    };
    return NextResponse.json(resp, { status: 400 });
  }

  try {
    const data = await manufacturerScraperService.scrapeManufacturerData(
      make,
      model,
      year
    );
    const resp: SPAServiceResponse<ManufacturerData> = {
      success: true,
      data,
      processingTime: Date.now() - start,
      cached: false,
    };
    return NextResponse.json(resp);
  } catch (err: unknown) {
    const error: SPAError = {
      code: 'SCRAPE_ERROR',
      message: err instanceof Error ? err.message : String(err),
    };
    const resp: SPAServiceResponse<ManufacturerData> = {
      success: false,
      error,
      processingTime: Date.now() - start,
      cached: false,
    };
    return NextResponse.json(resp, { status: 500 });
  }
}