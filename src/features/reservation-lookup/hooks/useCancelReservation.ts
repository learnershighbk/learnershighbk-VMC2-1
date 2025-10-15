import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { CancelReservationResponseSchema } from '../lib/dto';
import { toast } from '@/hooks/use-toast';
import { MESSAGES } from '../constants/messages';

export const useCancelReservation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reservationId: string) => {
      try {
        const response = await apiClient.post(`/api/reservations/${reservationId}/cancel`);
        const parsed = CancelReservationResponseSchema.safeParse(response.data);
        
        if (!parsed.success) {
          console.error('취소 응답 파싱 실패:', parsed.error);
          throw new Error('취소 응답 형식이 올바르지 않습니다');
        }
        
        return parsed.data;
      } catch (error) {
        const message = extractApiErrorMessage(error, MESSAGES.cancelFailed);
        throw new Error(message);
      }
    },
    onSuccess: () => {
      toast({
        title: '취소 완료',
        description: MESSAGES.cancelSuccess,
      });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
    onError: (error: any) => {
      const errorMessage = error instanceof Error ? error.message : MESSAGES.cancelFailed;
      
      toast({
        title: '취소 실패',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

