import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { ConcertSummary, SeatClassSummary } from '@/features/concerts/backend/schema';

export type { ConcertSummary, SeatClassSummary };

export interface ConcertCardModel {
  id: string;
  title: string;
  description: string | null;
  startAt: string;
  formattedDate: string;
  formattedTime: string;
  venueName: string;
  posterUrl: string;
  isActive: boolean;
  totalAvailableSeats: number;
  isSoldOut: boolean;
  seatClasses: SeatClassSummary[];
}

const DEFAULT_POSTER_SEED = 'concert';

export const mapConcertSummaryToCardModel = (
  concert: ConcertSummary,
): ConcertCardModel => {
  const startDate = new Date(concert.startAt);
  const formattedDate = format(startDate, 'yyyy년 MM월 dd일 (EEE)', { locale: ko });
  const formattedTime = format(startDate, 'HH:mm');

  const totalAvailableSeats = concert.seatClasses.reduce(
    (sum, sc) => sum + sc.availableSeats,
    0,
  );

  const isSoldOut = totalAvailableSeats === 0;

  const posterUrl =
    concert.posterUrl ??
    `https://picsum.photos/seed/${encodeURIComponent(concert.id ?? DEFAULT_POSTER_SEED)}/400/600`;

  return {
    id: concert.id,
    title: concert.title,
    description: concert.description,
    startAt: concert.startAt,
    formattedDate,
    formattedTime,
    venueName: concert.venueName,
    posterUrl,
    isActive: concert.isActive,
    totalAvailableSeats,
    isSoldOut,
    seatClasses: concert.seatClasses,
  };
};

