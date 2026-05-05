import type { Result } from '../result';
import type { ReferenceData } from '../../referenceData/application/useCases/GetReferenceDataUseCase.dto';

export interface IGetReferenceDataUseCase {
  execute(input: { userId: string }): Promise<Result<ReferenceData, Error>>;
}
