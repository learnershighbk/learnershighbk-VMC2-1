import { useMutation } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { 
  type SearchReservationsRequest, 
  SearchReservationsResponseSchema 
} from '../lib/dto';
import { toast } from '@/hooks/use-toast';
import { MESSAGES } from '../constants/messages';

export const useSearchReservations = () => {
  return useMutation({
    mutationFn: async (request: SearchReservationsRequest) => {
      try {
        const response = await apiClient.post('/api/reservations/search', request);
        const parsed = SearchReservationsResponseSchema.safeParse(response.data);
        
        if (!parsed.success) {
          console.error('예약 조회 응답 파싱 실패:', parsed.error);
          throw new Error('조회 응답 형식이 올바르지 않습니다');
        }
        
        return parsed.data;
      } catch (error) {
        const message = extractApiErrorMessage(error, MESSAGES.searchFailed);
        throw new Error(message);
      }
    },
    onError: (error: any) => {
      const errorMessage = error instanceof Error ? error.message : MESSAGES.searchFailed;
      
      toast({
        title: '조회 실패',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

