export interface CreateInstalmentScheduleInput {
  mandateId: string;
  /** Total amount to repay across all instalments, in pence */
  totalAmountPence: number;
  /** Number of equal monthly instalments */
  installmentCount: number;
  /** Day of month for each payment (1-28) */
  dayOfMonth: number;
  /** Free-form name shown in GC dashboard */
  name: string;
}

export interface CreateInstalmentScheduleOutput {
  instalmentScheduleId: string;
}
