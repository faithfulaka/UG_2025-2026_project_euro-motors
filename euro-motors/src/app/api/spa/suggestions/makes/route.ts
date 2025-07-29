import { NextRequest, NextResponse } from 'next/server';
import { carQueryService } from '@/lib/services';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || undefined;
  const makes = await carQueryService.getMakes(search);
  return NextResponse.json({ makes });
}