// Re-export from assessment module for backward compatibility
// SelectPlanUseCase has been moved to the assessment module as it operates on the Assessment aggregate
export { SelectPlanUseCase } from '@/features/assessment/application/useCases/SelectPlanUseCase';
export type { SelectPlanInput, SelectPlanOutput } from '@/features/assessment/application/dtos/SelectPlanUseCase.dto';
