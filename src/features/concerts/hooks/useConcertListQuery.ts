'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { ConcertListResponseSchema } from '@/features/concerts/backend/schema';
import { mapConcertSummaryToCardModel } from '@/features/concerts/lib/dto';
import type { ConcertListQueryParams } from '@/features/concerts/lib/query-params';

export const useConcertListQuery = (params: ConcertListQueryParams) => {
  return useQuery({
    queryKey: ['concerts', 'list', params],
    queryFn: async () => {
      const response = await apiClient.get('/api/concerts', {
        params: {
          sort: params.sort,
          isActive: params.isActive !== undefined ? String(params.isActive) : undefined,
          page: params.page,
          pageSize: params.pageSize,
        },
      });

      const parsed = ConcertListResponseSchema.safeParse(response.data);

      if (!parsed.success) {
        throw new Error('Invalid concert list response format.');
      }

      const concerts = parsed.data.concerts.map(mapConcertSummaryToCardModel);

      return {
        concerts,
        pagination: parsed.data.pagination,
      };
    },
    retry: 2,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });
};

export const extractConcertErrorMessage = extractApiErrorMessage;

