import { NextResponse } from 'next/server';


export async function GET() {
  try {
    const resp = await fetch('http://localhost:4001/makes');
    if (!resp.ok) throw new Error('Failed to fetch makes from scraper backend');
    const { makes } = await resp.json();
    return NextResponse.json({ makes });
  } catch (error) {
    console.error('[API/live/makes] Error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
