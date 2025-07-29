import { NextRequest, NextResponse } from 'next/server';
import { carQueryService } from '@/lib/services';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const make = searchParams.get('make');
  const search = searchParams.get('search') || undefined;

  if (!make) return NextResponse.json({ models: [] }, { status: 400 });

  const models = await carQueryService.getModels(make, search);
  return NextResponse.json({ models });
}