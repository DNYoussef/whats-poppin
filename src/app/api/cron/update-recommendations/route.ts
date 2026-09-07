import { NextRequest, NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'node:crypto';
import { apiUnavailable } from '@/lib/api-unavailable';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || !timingSafeEqual(
    createHash('sha256').update(authHeader ?? '').digest(),
    createHash('sha256').update(`Bearer ${cronSecret}`).digest(),
  )) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return apiUnavailable();
}
