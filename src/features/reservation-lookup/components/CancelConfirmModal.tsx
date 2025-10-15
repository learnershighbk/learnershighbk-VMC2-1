'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { ReservationDetail } from '../lib/dto';
import { formatConcertDateTime, formatPrice } from '../lib/formatters';

interface CancelConfirmModalProps {
  reservation: ReservationDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export const CancelConfirmModal = ({
  reservation,
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: CancelConfirmModalProps) => {
  if (!reservation) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>예약 취소 확인</SheetTitle>
          <SheetDescription>
            정말로 이 예약을 취소하시겠습니까?
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700">공연명</p>
            <p className="text-base">{reservation.concertTitle}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700">공연 일시</p>
            <p className="text-base">{formatConcertDateTime(reservation.concertStartAt)}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700">예약번호</p>
            <p className="text-base font-mono">{reservation.reservationCode}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700">결제 금액</p>
            <p className="text-base font-semibold">{formatPrice(reservation.totalPrice)}</p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600">
              취소 후에는 되돌릴 수 없으며, 좌석은 즉시 다시 판매됩니다.
            </p>
          </div>
        </div>

        <SheetFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            돌아가기
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? '취소 중...' : '예약 취소'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

