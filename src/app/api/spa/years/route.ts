import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { SPAServiceResponse, SPAError } from '@/types/spa';

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const make = url.searchParams.get('make')?.trim();
  const model = url.searchParams.get('model')?.trim();

  if (!make || !model) {
    const resp: SPAServiceResponse<number[]> = {
      success: false,
      error: { code: 'MISSING_PARAMS', message: 'make and model required' },
      processingTime: 0,
      cached: false,
    };
    return NextResponse.json(resp, { status: 400 });
  }

  const start = Date.now();
  try {
    const rows = await prisma.buyCar.findMany({
      where: { make, model },
      distinct: ['year'],
      select: { year: true },
    });
    const years = rows
      .map((r) => r.year)
      .sort((a, b) => b - a);

    const resp: SPAServiceResponse<number[]> = {
      success: true,
      data: years,
      processingTime: Date.now() - start,
      cached: false,
    };
    return NextResponse.json(resp);
  } catch (err: unknown) {
    const error: SPAError = {
      code: 'YEARS_ERROR',
      message: err instanceof Error ? err.message : String(err),
    };
    const resp: SPAServiceResponse<number[]> = {
      success: false,
      error,
      processingTime: Date.now() - start,
      cached: false,
    };
    return NextResponse.json(resp, { status: 500 });
  }
}