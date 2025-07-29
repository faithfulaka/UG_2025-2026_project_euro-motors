import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const make = url.searchParams.get('make') || '';
  const model = url.searchParams.get('model') || '';
  if (!make || !model) return NextResponse.json({ years: [] });
  try {
    const resp = await fetch(`http://localhost:4001/years?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`);
    if (!resp.ok) {
      return NextResponse.json({ error: 'Failed to fetch years from scraper backend' }, { status: 503 });
    }
    const data = await resp.json();
    if (!data.years || !Array.isArray(data.years)) {
      return NextResponse.json({ error: 'Invalid years data from scraper backend' }, { status: 500 });
    }
    return NextResponse.json({ years: data.years });
  } catch (error) {
    console.error('[API/years] Critical error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
