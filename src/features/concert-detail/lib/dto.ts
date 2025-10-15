import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { ConcertDetailResponse, SeatClass } from "../backend/schema";
import { ConcertDetailResponseSchema } from "../backend/schema";

export type { ConcertDetailResponse, SeatClass };
export { ConcertDetailResponseSchema };

export function formatWon(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount);
}

export function formatConcertDateTime(dateString: string): string {
  const date = new Date(dateString);
  return format(date, "yyyy년 M월 d일 (EEE) HH:mm", { locale: ko });
}

export function formatConcertDate(dateString: string): string {
  const date = new Date(dateString);
  return format(date, "yyyy년 M월 d일 (EEE)", { locale: ko });
}

export function formatConcertTime(dateString: string): string {
  const date = new Date(dateString);
  return format(date, "HH:mm", { locale: ko });
}

