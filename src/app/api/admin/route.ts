import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Admin API root',
    availableRoutes: [
      '/api/admin/cars',
      '/api/admin/rentals',
      '/api/admin/reports',
      '/api/admin/trade-ins',
      '/api/admin/users'
    ]
  });
}
