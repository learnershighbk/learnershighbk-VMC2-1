'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ReservationDetail } from '../lib/dto';
import { 
  formatConcertDateTime, 
  formatReservationDate, 
  formatPrice,
  formatSeatsSummary,
  canCancelReservation,
} from '../lib/formatters';
import { CancelConfirmModal } from './CancelConfirmModal';
import { useCancelReservation } from '../hooks/useCancelReservation';

interface ReservationCardProps {
  reservation: ReservationDetail;
  onCancelSuccess?: () => void;
}

export const ReservationCard = ({ reservation, onCancelSuccess }: ReservationCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cancelMutation = useCancelReservation();

  const isReserved = reservation.status === 'reserved';
  const canCancel = isReserved && canCancelReservation(reservation.concertStartAt);

  const handleCancelClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    await cancelMutation.mutateAsync(reservation.id);
    setIsModalOpen(false);
    onCancelSuccess?.();
  };

  return (
    <>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">{reservation.concertTitle}</h3>
                <Badge variant={isReserved ? 'default' : 'secondary'}>
                  {isReserved ? '예약 중' : '취소됨'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{reservation.venueName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4 border-y">
            <div>
              <p className="text-xs text-gray-500 mb-1">공연 일시</p>
              <p className="text-sm font-medium">
                {formatConcertDateTime(reservation.concertStartAt)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">예약 일시</p>
              <p className="text-sm font-medium">
                {formatReservationDate(reservation.reservedAt)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">예약번호</span>
              <span className="font-mono font-medium">{reservation.reservationCode}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">좌석</span>
              <span className="font-medium">{formatSeatsSummary(reservation.seats)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">총 금액</span>
              <span className="text-lg font-bold">{formatPrice(reservation.totalPrice)}</span>
            </div>
          </div>

          {reservation.status === 'canceled' && reservation.canceledAt && (
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500">
                취소 일시: {formatReservationDate(reservation.canceledAt)}
              </p>
            </div>
          )}

          {canCancel && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleCancelClick}
              disabled={cancelMutation.isPending}
            >
              예약 취소
            </Button>
          )}

          {isReserved && !canCancel && (
            <p className="text-xs text-center text-gray-500">
              공연 시작 후에는 취소할 수 없습니다
            </p>
          )}
        </div>
      </Card>

      <CancelConfirmModal
        reservation={reservation}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmCancel}
        isLoading={cancelMutation.isPending}
      />
    </>
  );
};

