import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const resp = await fetch('http://localhost:4001/makes');
    if (!resp.ok) {
      return NextResponse.json({ error: 'Failed to fetch makes from scraper backend' }, { status: 503 });
    }
    const data = await resp.json();
    if (!data.makes || !Array.isArray(data.makes)) {
      return NextResponse.json({ error: 'Invalid makes data from scraper backend' }, { status: 500 });
    }
    return NextResponse.json({ makes: data.makes });
  } catch (error) {
    console.error('[API/makes] Critical error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

