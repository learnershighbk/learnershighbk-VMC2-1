import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { policyDocumentKeys } from '../lib/dto';
import type { PolicyDocumentPayload } from '../lib/dto';

type ApiResponse = {
  success: boolean;
  data?: PolicyDocumentPayload;
  error?: {
    code: string;
    message: string;
  };
};

export function usePolicyDocumentQuery(slug: string) {
  return useQuery<PolicyDocumentPayload>({
    queryKey: policyDocumentKeys.detail(slug),
    queryFn: async () => {
      const response = await apiClient.get(`/api/docs/${slug}`);
      return response.data as PolicyDocumentPayload;
    },
    staleTime: 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

