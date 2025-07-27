// src/app/api/spa/years/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const current = new Date().getFullYear();
  const years   = Array.from({ length: 6 }, (_, i) => current - i);
  return NextResponse.json({ success: true, years });
}