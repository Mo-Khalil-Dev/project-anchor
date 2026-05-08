import { z } from 'zod';

export const LinkUserToCustomerSchema = z.object({
  utilityType: z.enum(['Electricity', 'Gas', 'Water'], {
    errorMap: () => ({ message: 'Utility type must be Electricity, Gas, or Water' }),
  }),
  postcode: z
    .string()
    .min(6, 'Postcode must be at least 6 characters')
    .max(8, 'Postcode must be at most 8 characters')
    .regex(/^[A-Za-z0-9\s]+$/, 'Postcode contains invalid characters'),
  accountReference: z
    .string()
    .min(1, 'Account reference is required')
    .max(50, 'Account reference must be at most 50 characters'),
});

export type LinkUserToCustomerInput = z.infer<typeof LinkUserToCustomerSchema>;

export interface LinkUserToCustomerOutput {
  id: string;
  email: string;
  utilityType: string | null;
  postcode: string | null;
  utilityAccountNo: string | null;
  createdAt: Date;
}
