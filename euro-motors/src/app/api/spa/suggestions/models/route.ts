import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { carQueryService } from '@/lib/services';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const make = searchParams.get('make');
  const search = searchParams.get('search') || undefined;
  const source = (searchParams.get('source') as 'database' | 'webbase' | 'combined') ?? 'combined';
  if (!make) return NextResponse.json({ models: [] }, { status: 400 });

  let models: string[] = [];
  if (source === 'database' || source === 'combined') {
    const rows = await prisma.buyCar.findMany({
      where: { make },
      distinct: ['model'],
      select: { model: true }
    });
    models = rows.map(r => r.model);
  }

  if (source === 'webbase' || source === 'combined') {
    const apiModels = await carQueryService.getModels(make, search);
    models = [...models, ...apiModels];
  }

  models = Array.from(new Set(models)).sort();
  return NextResponse.json({ models });
}