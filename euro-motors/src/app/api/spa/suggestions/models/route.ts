import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const make = url.searchParams.get('make') || '';
  if (!make) return NextResponse.json({ models: [] });
  try {
    const resp = await fetch(`http://localhost:4001/models?make=${encodeURIComponent(make)}`);
    if (!resp.ok) {
      return NextResponse.json({ error: 'Failed to fetch models from scraper backend' }, { status: 503 });
    }
    const data = await resp.json();
    if (!data.models || !Array.isArray(data.models)) {
      return NextResponse.json({ error: 'Invalid models data from scraper backend' }, { status: 500 });
    }
    return NextResponse.json({ models: data.models });
  } catch (error) {
    console.error('[API/models] Critical error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
