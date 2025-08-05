// src/app/api/spa/suggestions/models/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getModels as getCarQueryModels } from '@/lib/services/carquery-api';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const source = (url.searchParams.get('source') ?? 'webbase') as 'database' | 'webbase';
  const make = url.searchParams.get('make')?.trim() || '';
  const search = url.searchParams.get('search')?.trim().toLowerCase() || '';

  if (!make) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_INPUT', message: 'Make required' } },
      { status: 400 }
    );
  }

  let models: string[] = [];
  if (source === 'database') {
    const db = await prisma.buyCar.findMany({
      where: { make, model: { contains: search } },
      select: { model: true },
      distinct: ['model'],
      take: 50,
    });
    models = db.map(r => r.model);
    // Filter out category/list pages before deduplication and slicing
    models = models.filter(m => !/^(Category:|List of)/i.test(m));
  } else {
    const carqueryList = await getCarQueryModels(make);
    models = carqueryList
      .filter(m => m.toLowerCase().includes(search))
      .filter(m => !/^(Category:|List of)/i.test(m))
      .slice(0, 50);
  }

  models = Array.from(new Set(models)).slice(0, 50);

  const suggestions = models.map(model => ({
    value: model,
    label: model,
    displayName: model,
    source,
    type: 'model' as const,
  }));

  return NextResponse.json({
    success: true,
    suggestions,
    source,
    cached: false,
    timestamp: new Date().toISOString(),
  });
}