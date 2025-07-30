import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { carQueryService } from '@/lib/services';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || undefined;
  const source = (searchParams.get('source') as 'database' | 'webbase' | 'combined') ?? 'combined';

  let makes: string[] = [];
  if (source === 'database' || source === 'combined') {
    const rows = await prisma.buyCar.findMany({
      distinct: ['make'],
      select: { make: true }
    });
    makes = rows.map(r => r.make);
  }

  if (source === 'webbase' || source === 'combined') {
    const apiMakes = await carQueryService.getMakes(search);
    makes = [...makes, ...apiMakes];
  }

  makes = Array.from(new Set(makes)).sort();
  return NextResponse.json({ makes });
}