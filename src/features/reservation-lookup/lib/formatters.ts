import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { ReservationSeatDetail } from './dto';

export const formatConcertDateTime = (isoDate: string): string => {
  return format(new Date(isoDate), 'yyyy년 M월 d일 (E) HH:mm', { locale: ko });
};

export const formatReservationDate = (isoDate: string): string => {
  return format(new Date(isoDate), 'yyyy.MM.dd HH:mm');
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(price);
};

export const formatSeatsSummary = (seats: ReservationSeatDetail[]): string => {
  const grouped = seats.reduce((acc, seat) => {
    const className = seat.seatLabelSnapshot.split(' ')[0];
    acc[className] = (acc[className] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(grouped)
    .map(([className, count]) => `${className} ${count}매`)
    .join(', ');
};

export const canCancelReservation = (concertStartAt: string): boolean => {
  const concertStartTime = new Date(concertStartAt);
  const now = new Date();
  return concertStartTime > now;
};

