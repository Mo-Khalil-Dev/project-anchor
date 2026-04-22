import { API } from '@/api/endpoints';
import { httpService } from '@/api/httpService';
import { Assessment } from '@/journeys/Assessment/models/assessment';

export const assessmentService = {
  get: (assessmentId: string): Promise<Assessment> =>
    httpService.get<Assessment>(API.assessments.get(assessmentId)),
};
