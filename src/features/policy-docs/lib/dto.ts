import { format } from 'date-fns';
import type { PolicyDocumentPayload } from '../backend/schema';

export type { PolicyDocumentPayload } from '../backend/schema';

export const policyDocumentKeys = {
  all: ['policy-documents'] as const,
  detail: (slug: string) => ['policy-documents', slug] as const,
};

export function formatEffectiveDate(dateString: string | null): string {
  if (!dateString) {
    return '-';
  }

  try {
    const date = new Date(dateString);
    return format(date, 'yyyy.MM.dd');
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return format(date, 'yyyy.MM.dd HH:mm');
  } catch {
    return dateString;
  }
}

