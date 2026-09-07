import { apiUnavailable } from '@/lib/api-unavailable';

export async function POST() {
  return apiUnavailable();
}
