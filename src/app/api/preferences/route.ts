import { apiUnavailable } from '@/lib/api-unavailable';

export const dynamic = 'force-dynamic';

export async function POST() {
  return apiUnavailable();
}

export async function GET() {
  return apiUnavailable();
}
