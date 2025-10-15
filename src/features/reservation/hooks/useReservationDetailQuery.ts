import { useQuery } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { ReservationDetailResponseSchema } from '../backend/schema';
import type { ReservationDetailResponse } from '../lib/dto';

export const useReservationDetailQuery = (reservationId: string | undefined) => {
  return useQuery({
    queryKey: ['reservation', 'detail', reservationId],
    queryFn: async () => {
      if (!reservationId) {
        throw new Error('예약 ID가 필요합니다');
      }

      try {
        const response = await apiClient.get(`/api/reservations/${reservationId}`);
        
        const parsed = ReservationDetailResponseSchema.safeParse(response.data);
        
        if (!parsed.success) {
          console.error('예약 정보 파싱 실패:', parsed.error);
          throw new Error('예약 정보 형식이 올바르지 않습니다');
        }

        return parsed.data;
      } catch (error) {
        const message = extractApiErrorMessage(error, '예약 정보를 불러올 수 없습니다');
        throw new Error(message);
      }
    },
    enabled: !!reservationId,
    retry: (failureCount, error) => {
      if (error.message.includes('찾을 수 없습니다')) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export type UseReservationDetailQueryResult = ReturnType<typeof useReservationDetailQuery>;

