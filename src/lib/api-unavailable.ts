import { NextResponse } from 'next/server';

// P00: reconnect each operation only after its API-POLICY and budget gates pass.
export function apiUnavailable() {
  return NextResponse.json(
    { error: 'This feature is temporarily unavailable.', code: 'FEATURE_UNAVAILABLE' },
    { status: 503, headers: { 'Cache-Control': 'no-store' } },
  );
}
