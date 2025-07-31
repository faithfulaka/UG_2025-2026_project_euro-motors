import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { carQueryService } from '@/lib/services/carquery-api';
import type { SPAModelsResponse, SPAError } from '@/types/spa';

const VALID_SOURCES = ['database', 'carquery', 'combined'] as const;
type Source = typeof VALID_SOURCES[number];

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const make = url.searchParams.get('make')?.trim();
  const sourceParam = url.searchParams.get('source') ?? 'combined';
  const source: Source = (VALID_SOURCES.includes(sourceParam as any)
    ? sourceParam
    : 'combined') as Source;

  if (!make) {
    const error: SPAError = { code: 'MISSING_MAKE', message: 'make is required' };
    const resp: SPAModelsResponse = {
      success: false,
      models: [],
      make: '',
      source,
      cached: false,
      timestamp: new Date().toISOString(),
      error,
    };
    return NextResponse.json(resp, { status: 400 });
  }

  try {
    let models: string[] = [];

    if (source === 'database' || source === 'combined') {
      const rows = await prisma.buyCar.findMany({
        where: { make },
        distinct: ['model'],
        select: { model: true },
      });
      models = rows.map((r) => r.model);
    }

    if (source === 'carquery' || source === 'combined') {
      const cq = await carQueryService.getModels(make);
      models =
        source === 'combined'
          ? Array.from(new Set([...models, ...cq])).sort()
          : cq;
    }

    const response: SPAModelsResponse = {
      success: true,
      models,
      make,
      source,
      cached: false,
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response);
  } catch (err: unknown) {
    const error: SPAError = {
      code: 'MODELS_ERROR',
      message: err instanceof Error ? err.message : String(err),
    };
    const resp: SPAModelsResponse = {
      success: false,
      models: [],
      make,
      source,
      cached: false,
      timestamp: new Date().toISOString(),
      error,
    };
    return NextResponse.json(resp, { status: 500 });
  }
}