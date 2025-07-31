import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { SPASuggestionResponse, SPASuggestion, SPAError } from '@/types/spa';

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const type = url.searchParams.get('type');
  const make = url.searchParams.get('make')?.trim() ?? '';
  const model = url.searchParams.get('model')?.trim() ?? '';

  if (type !== 'years') {
    const err: SPAError = { code: 'INVALID_TYPE', message: 'only "years" supported' };
    const resp: SPASuggestionResponse = {
      success: false,
      suggestions: [],
      source: 'none',
      cached: false,
      timestamp: new Date().toISOString(),
      // @ts-expect-error: error is optional
      error: err,
    };
    return NextResponse.json(resp, { status: 400 });
  }

  try {
    const rows = await prisma.buyCar.findMany({
      where: { make, model },
      distinct: ['year'],
      select: { year: true },
    });
    const suggestions: SPASuggestion[] = rows.map((r) => ({
      value: r.year.toString(),
      label: r.year.toString(),
      displayName: r.year.toString(),
      source: 'database',
      type: 'year',
      // count and popular optional
    }));

    const resp: SPASuggestionResponse = {
      success: true,
      suggestions,
      source: 'database',
      cached: false,
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(resp);
  } catch (err: unknown) {
    const error: SPAError = {
      code: 'SUGGESTIONS_ERROR',
      message: err instanceof Error ? err.message : String(err),
    };
    const resp: SPASuggestionResponse = {
      success: false,
      suggestions: [],
      source: 'database',
      cached: false,
      timestamp: new Date().toISOString(),
      // @ts-expect-error
      error,
    };
    return NextResponse.json(resp, { status: 500 });
  }
}