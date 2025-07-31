import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { carQueryService } from '@/lib/services/carquery-api';
import type { SPAMakesResponse, SPAError } from '@/types/spa';

const VALID_SOURCES = ['database', 'carquery', 'combined'] as const;
type Source = typeof VALID_SOURCES[number];

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const sourceParam = url.searchParams.get('source') ?? 'combined';
  const source: Source = (VALID_SOURCES.includes(sourceParam as any)
    ? sourceParam
    : 'combined') as Source;

  try {
    let makes: string[] = [];

    if (source === 'database' || source === 'combined') {
      const rows = await prisma.buyCar.findMany({
        distinct: ['make'],
        select: { make: true },
      });
      makes = rows.map((r) => r.make);
    }

    if (source === 'carquery' || source === 'combined') {
      const cq = await carQueryService.getMakes();
      makes =
        source === 'combined'
          ? Array.from(new Set([...makes, ...cq])).sort()
          : cq;
    }

    const response: SPAMakesResponse = {
      success: true,
      makes,
      source,
      cached: false,
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response);
  } catch (err: unknown) {
    const error: SPAError = {
      code: 'MAKES_ERROR',
      message: err instanceof Error ? err.message : String(err),
    };
    const response: SPAMakesResponse = {
      success: false,
      makes: [],
      source,
      cached: false,
      timestamp: new Date().toISOString(),
      error,
    };
    return NextResponse.json(response, { status: 500 });
  }
}