import { httpService } from '../api/httpService';
import { API } from '../api/endpoints';
import { unwrap } from '../api/unwrap';
import type { ReferenceData } from '../types/referenceData.types';

export const referenceDataService = {
  async getReferenceData(): Promise<ReferenceData> {
    return httpService
      .get<ReferenceData>(API.referenceData.get)
      .then(unwrap);
  },
};
