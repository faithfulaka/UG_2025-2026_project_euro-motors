import { NextResponse } from 'next/server';

export async function POST() {
  // With localStorage approach, we don't need to do anything server-side
  // The client will handle token removal
  return NextResponse.json({ message: 'Logged out successfully' });
}