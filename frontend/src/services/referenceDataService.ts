import { httpService } from '../api/httpService';
import { API } from '../api/endpoints';
import { unwrap } from '../api/unwrap';
import type { ReferenceData } from '../types/referenceData.types';
import type { ApiResponse } from '../types';

export const referenceDataService = {
  async getReferenceData(): Promise<ReferenceData> {
    const response = await httpService.get<ApiResponse<ReferenceData>>(API.referenceData.get);
    return unwrap(response);
  },
};
