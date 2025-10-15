import { z } from 'zod';
import { PHONE_REGEX, PASSWORD_REGEX, VALIDATION_MESSAGES } from '../constants/validation-rules';

export const PurchaserFormSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, VALIDATION_MESSAGES.phoneRequired)
    .regex(PHONE_REGEX, VALIDATION_MESSAGES.phoneInvalid),
  password: z
    .string()
    .min(1, VALIDATION_MESSAGES.passwordRequired)
    .regex(PASSWORD_REGEX, VALIDATION_MESSAGES.passwordInvalid),
  terms: z
    .boolean()
    .refine((val) => val === true, VALIDATION_MESSAGES.termsRequired),
});

export type PurchaserFormData = z.infer<typeof PurchaserFormSchema>;

