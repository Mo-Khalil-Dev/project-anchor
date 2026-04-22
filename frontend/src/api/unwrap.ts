import { ApiResponse } from '@/types';

export function unwrap<T>(res: ApiResponse<T>): T {
  if (!res.success || !res.data) throw new Error(res.error || 'Request failed');
  return res.data;
}
