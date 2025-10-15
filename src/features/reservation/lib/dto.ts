import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { 
  ReservationDetailResponse, 
  ReservationSeat,
  ReservationStatus,
  CreateReservationRequest,
  CreateReservationResponse,
  SeatDataResponse,
  SeatClass,
  Seat,
  ConcertInfo,
} from '../backend/schema';
import {
  CreateReservationResponseSchema,
  SeatDataResponseSchema,
  CreateReservationRequestSchema,
} from '../backend/schema';

export type { 
  ReservationDetailResponse, 
  ReservationSeat,
  ReservationStatus,
  CreateReservationRequest,
  CreateReservationResponse,
  SeatDataResponse,
  SeatClass,
  Seat,
  ConcertInfo,
};

export {
  CreateReservationResponseSchema,
  SeatDataResponseSchema,
  CreateReservationRequestSchema,
};

export const buildSeatLabel = (params: {
  section?: string | null;
  row: string;
  number: number;
}): string => {
  const { section, row, number } = params;
  const sectionPart = section ? `${section} ` : '';
  return `${sectionPart}${row}열 ${number}번`;
};

export const formatReservationDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, 'yyyy년 MM월 dd일 (E) HH:mm', { locale: ko });
  } catch {
    return dateString;
  }
};

export const formatReservationPrice = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount);
};

export const formatReservationPriceSimple = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR').format(amount);
};
