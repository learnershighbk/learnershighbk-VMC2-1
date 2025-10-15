'use client';

import { useSeatSelection } from '../hooks/useSeatSelection';
import { selectSeatCount, selectTotalAmount } from '../state/selectors';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export const SummaryPanel = () => {
  const { state } = useSeatSelection();
  const seatCount = selectSeatCount(state);
  const totalAmount = selectTotalAmount(state);

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">선택 내역</h2>

      {seatCount === 0 ? (
        <p className="text-gray-500 text-sm">좌석을 선택해주세요</p>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            {Object.entries(state.pricingSummary.breakdown).map(([classId, summary]) => (
              <div key={classId} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {summary.name} x {summary.count}
                </span>
                <span className="font-medium">{summary.subtotal.toLocaleString()}원</span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">선택 좌석</span>
              <span className="font-medium">{seatCount}개</span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">총 결제금액</span>
            <span className="text-2xl font-bold text-blue-600">
              {totalAmount.toLocaleString()}원
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">선택한 좌석</h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {Object.values(state.selectedSeats).map((seat) => {
                const seatClass = state.seatClasses.find(
                  (sc) => sc.id === seat.seatClassId
                );
                return (
                  <div key={seat.id} className="text-xs text-gray-600">
                    {seatClass?.name} {seat.rowLabel}열 {seat.seatNumber}번
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

