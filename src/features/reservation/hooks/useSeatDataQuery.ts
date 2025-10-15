'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { SeatDataResponseSchema } from '../lib/dto';

export const useSeatDataQuery = (concertId: string) =>
  useQuery({
    queryKey: ['seatData', concertId],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/api/concerts/${concertId}/seats`);
        const parsed = SeatDataResponseSchema.safeParse(response.data);
        
        if (!parsed.success) {
          console.error('좌석 데이터 파싱 실패:', parsed.error);
          throw new Error('좌석 정보 형식이 올바르지 않습니다');
        }
        
        return parsed.data;
      } catch (error) {
        const message = extractApiErrorMessage(error, '좌석 정보를 불러올 수 없습니다');
        throw new Error(message);
      }
    },
    enabled: Boolean(concertId),
    staleTime: 30 * 1000,
    refetchOnMount: true,
  });

