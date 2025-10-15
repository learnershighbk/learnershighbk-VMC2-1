import { useQuery } from "@tanstack/react-query";
import { apiClient, isAxiosError } from "@/lib/remote/api-client";
import type { ConcertDetailResponse } from "../lib/dto";
import { ConcertDetailResponseSchema } from "../lib/dto";

export function useConcertDetailQuery(concertId: string) {
  return useQuery({
    queryKey: ["concertDetail", concertId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/concerts/${concertId}`);

      const parsed = ConcertDetailResponseSchema.safeParse(response.data);

      if (!parsed.success) {
        console.error("스키마 검증 실패:", parsed.error.format());
        console.error("실제 응답 데이터:", response.data);
        throw new Error("응답 데이터 형식이 올바르지 않습니다.");
      }

      return parsed.data as ConcertDetailResponse;
    },
    retry: (failureCount, error) => {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 404 || status === 410) {
          return false;
        }
      }
      return failureCount < 1;
    },
    staleTime: 1000 * 60 * 5,
  });
}

