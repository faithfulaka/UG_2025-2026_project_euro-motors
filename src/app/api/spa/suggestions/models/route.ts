import { getModels as getCarQueryModels } from '@/lib/services/carquery-api';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Accepts source: 'database', 'webbase', or 'combined'
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get('source') || 'combined';
  const make = searchParams.get('make')?.toLowerCase() || '';
  const search = searchParams.get('search')?.toLowerCase() || '';

  let models: string[] = [];

  try {
    if (source === 'database') {
      const dbResults = await prisma.buyCar.findMany({
        where: {
          make: { equals: make },
          model: { contains: search },
        },
        select: { model: true },
        distinct: ['model'],
        take: 50,
      });
      models = dbResults.map((car) => car.model);
    } else if (source === 'webbase') {
      if (make) {
        const apiModels = await getCarQueryModels(make);
        models = apiModels.filter((m) => m.toLowerCase().includes(search));
      } else {
        models = [];
      }
    } else if (source === 'combined') {
      const dbResults = await prisma.buyCar.findMany({
        where: {
          make: { equals: make },
          model: { contains: search },
        },
        select: { model: true },
        distinct: ['model'],
        take: 50,
      });
      const dbModels = dbResults.map((car) => car.model);
      let apiModels: string[] = [];
      if (make) {
        apiModels = await getCarQueryModels(make);
        apiModels = apiModels.filter((m) => m.toLowerCase().includes(search));
      }
      models = [...dbModels, ...apiModels];
    } else {
      models = [];
    }
    // Dedupe and limit to 50
    const uniqueModels = Array.from(new Set(models)).slice(0, 50);
    return NextResponse.json({ models: uniqueModels });
  } catch (error) {
    console.error('Failed to fetch models:', error);
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
}