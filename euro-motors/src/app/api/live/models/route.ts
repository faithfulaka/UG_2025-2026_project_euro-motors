import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const make = url.searchParams.get('make') || '';
  if (!make) return NextResponse.json({ models: [] });
  try {
    const resp = await fetch(`http://localhost:4001/models?make=${encodeURIComponent(make)}`);
    if (!resp.ok) throw new Error('Failed to fetch models from scraper backend');
    const { models } = await resp.json();
    return NextResponse.json({ models });
  } catch (error) {
    console.error('[API/live/models] Error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
