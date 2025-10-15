import { z } from 'zod';

export const PolicyDocumentParamsSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
});

export const PolicyDocumentResponseSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  contentMarkdown: z.string(),
  version: z.string(),
  effectiveFrom: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type PolicyDocumentParams = z.infer<typeof PolicyDocumentParamsSchema>;
export type PolicyDocumentPayload = z.infer<typeof PolicyDocumentResponseSchema>;

