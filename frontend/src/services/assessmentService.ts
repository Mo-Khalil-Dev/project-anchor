import { API } from '@/api/endpoints';
import { httpService } from '@/api/httpService';
import { unwrap } from '@/api/unwrap';
import { Assessment } from '@/journeys/Assessment/models/assessment';
import { ApiResponse, AssessmentDetailedDTO } from '@/types';

export const assessmentService = {
  get: (assessmentId: string): Promise<Assessment> =>
    httpService.get<ApiResponse<Assessment>>(API.assessments.get(assessmentId)).then(unwrap),

  getCurrent: (): Promise<AssessmentDetailedDTO> =>
    httpService.get<ApiResponse<AssessmentDetailedDTO>>(API.assessments.current).then(unwrap),
};
