import { NextRequest, NextResponse } from 'next/server';
import { carQueryService } from '@/lib/services';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const make = searchParams.get('make');
  const model = searchParams.get('model');

  if (!make || !model) {
    return NextResponse.json({ error: 'Make and model are required' }, { status: 400 });
  }

  try {
    const years = await carQueryService.getYears(make, model);
    return NextResponse.json({ years });
  } catch (error) {
    console.error('Error fetching years:', error);
    return NextResponse.json({ error: 'Failed to fetch years' }, { status: 500 });
  }
}