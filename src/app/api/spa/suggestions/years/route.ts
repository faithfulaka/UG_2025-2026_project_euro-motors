import { getYears as getCarQueryYears } from '@/lib/services/carquery-api';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Accepts source: 'database', 'webbase', or 'combined'
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const make = searchParams.get('make') || '';
  const model = searchParams.get('model') || '';
  const source = searchParams.get('source') || 'combined';

  let years: string[] = [];

  if (source === 'database') {
    if (make && model) {
      const dbYears = await prisma.buyCar.findMany({
        where: {
          make: { equals: make },
          model: { equals: model },
        },
        select: { year: true },
        distinct: ['year'],
      });
      years = dbYears.map((entry) => entry.year?.toString()).filter(Boolean);
    }
  } else if (source === 'webbase') {
    if (make && model) {
      const apiYears = await getCarQueryYears(make, model);
      years = apiYears.map((y) => String(y));
    }
  } else if (source === 'combined') {
    let dbYears: { year: number }[] = [];
    if (make && model) {
      dbYears = await prisma.buyCar.findMany({
        where: {
          make: { equals: make },
          model: { equals: model },
        },
        select: { year: true },
        distinct: ['year'],
      });
    }
    let apiYears: number[] = [];
    if (make && model) {
      apiYears = await getCarQueryYears(make, model);
    }
    years = [
      ...dbYears.map((entry) => entry.year?.toString()).filter(Boolean),
      ...apiYears.map((y) => String(y))
    ];
  }
  // Dedupe and sort descending
  const uniqueYears = Array.from(new Set(years)).sort((a, b) => Number(b) - Number(a));
  return NextResponse.json({ years: uniqueYears });
}