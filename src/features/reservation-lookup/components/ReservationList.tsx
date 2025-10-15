'use client';

import type { ReservationDetail } from '../lib/dto';
import { ReservationCard } from './ReservationCard';

interface ReservationListProps {
  reservations: ReservationDetail[];
  onUpdate?: () => void;
}

export const ReservationList = ({ reservations, onUpdate }: ReservationListProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">예약 내역</h2>
      <div className="space-y-4">
        {reservations.map((reservation) => (
          <ReservationCard
            key={reservation.id}
            reservation={reservation}
            onCancelSuccess={onUpdate}
          />
        ))}
      </div>
    </div>
  );
};

