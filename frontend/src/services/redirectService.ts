import { httpService } from '../api/httpService';

export interface GetRedirectToJourneyResponse {
  nextPage: string;
  reason: string;
}

class RedirectService {
  async getRedirectToJourney(): Promise<GetRedirectToJourneyResponse> {
    const response = await httpService.post<GetRedirectToJourneyResponse>(
      '/auth/redirect-to-journey',
      {}
    );
    return response;
  }
}

export const redirectService = new RedirectService();
