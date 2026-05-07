import { httpService } from '@/api/httpService';
import { unwrap } from '@/api/unwrap';
import type { ApiResponse } from '@/types';

export interface GetRedirectToJourneyResponse {
  nextPage: string;
  reason: string;
}

class RedirectService {
  async getRedirectToJourney(): Promise<GetRedirectToJourneyResponse> {
    const response = await httpService.get<ApiResponse<GetRedirectToJourneyResponse>>(
      '/auth/redirect-to-journey'
    );
    return unwrap(response);
  }
}

export const redirectService = new RedirectService();
