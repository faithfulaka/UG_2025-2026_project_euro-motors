// src/app/admin/dashboard/page.tsx
'use client';

import { redirect } from 'next/navigation';

export default function DisabledDashboard() {
  redirect('/admin');
  return null;
}