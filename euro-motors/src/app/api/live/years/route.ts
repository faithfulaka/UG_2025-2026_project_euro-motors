import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const make = url.searchParams.get('make') || '';
  const model = url.searchParams.get('model') || '';
  if (!make || !model) return NextResponse.json({ years: [] });
  try {
    const resp = await fetch(`http://localhost:4001/years?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`);
    if (!resp.ok) throw new Error('Failed to fetch years from scraper backend');
    const { years } = await resp.json();
    return NextResponse.json({ years });
  } catch (error) {
    console.error('[API/live/years] Error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
