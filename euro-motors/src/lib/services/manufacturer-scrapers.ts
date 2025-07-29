import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { manufacturerScraperService } from '@/lib/services/manufacturer-scrapers';
import type { ManufacturerData, SPAServiceResponse } from '@/types/spa';

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const make  = url.searchParams.get('make')?.trim() ?? '';
  const model = url.searchParams.get('model')?.trim() ?? '';
  const yearParam = url.searchParams.get('year');
  const year = yearParam ? parseInt(yearParam, 10) : undefined;

  if (!make || !model) {
    return NextResponse.json<SPAServiceResponse<ManufacturerData>>({
      success: false,
      error: { code: 'INVALID_PARAMS', message: 'make and model are required' },
      processingTime: 0,
      cached: false,
    });
  }

  const start = Date.now();
  const data = await manufacturerScraperService.scrapeManufacturerData(make, model, year);

  return NextResponse.json<SPAServiceResponse<ManufacturerData>>({
    success: true,
    data,
    processingTime: Date.now() - start,
    cached: false,
  });
}