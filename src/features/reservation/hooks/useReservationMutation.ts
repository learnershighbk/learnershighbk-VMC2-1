'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { CreateReservationResponseSchema, type CreateReservationRequest } from '../lib/dto';

export const useReservationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateReservationRequest) => {
      try {
        const response = await apiClient.post('/api/reservations', request);
        const parsed = CreateReservationResponseSchema.safeParse(response.data);
        
        if (!parsed.success) {
          throw new Error('서버 응답 형식이 올바르지 않습니다');
        }
        
        return parsed.data;
      } catch (error) {
        const message = extractApiErrorMessage(error, '예약 중 오류가 발생했습니다');
        throw new Error(message);
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['seatData', variables.concertId] });
    },
  });
};

