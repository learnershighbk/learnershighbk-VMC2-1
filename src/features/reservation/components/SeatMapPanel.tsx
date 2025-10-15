'use client';

import { useSeatSelection } from '../hooks/useSeatSelection';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const SeatMapPanel = () => {
  const { state, dispatch } = useSeatSelection();

  const getSeatsByRow = () => {
    const rowMap = new Map<string, typeof state.seats>();
    
    state.seats.forEach((seat) => {
      const key = `${seat.seatClassId}-${seat.rowLabel}`;
      if (!rowMap.has(key)) {
        rowMap.set(key, []);
      }
      rowMap.get(key)?.push(seat);
    });

    return Array.from(rowMap.entries()).map(([key, seats]) => ({
      key,
      seats: seats.sort((a, b) => a.seatNumber - b.seatNumber),
    }));
  };

  const groupedByClass = state.seatClasses.map((seatClass) => {
    const classSeats = getSeatsByRow().filter(
      (row) => row.seats[0]?.seatClassId === seatClass.id
    );
    return {
      seatClass,
      rows: classSeats,
    };
  });

  const getSeatStatus = (seatId: string, isReserved: boolean) => {
    if (isReserved) return 'reserved';
    if (state.selectedSeats[seatId]) return 'selected';
    return 'available';
  };

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'selected':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'reserved':
        return 'bg-gray-300 cursor-not-allowed text-gray-500';
      case 'available':
      default:
        return 'bg-white hover:bg-blue-100 border-2 border-gray-300';
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="bg-gray-800 text-white text-center py-4 rounded-lg mb-8">
          <span className="text-lg font-semibold">STAGE</span>
        </div>

        <div className="flex gap-4 justify-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded" />
            <span className="text-sm">선택 가능</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded" />
            <span className="text-sm">선택됨</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-300 rounded" />
            <span className="text-sm">예약됨</span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {groupedByClass.map(({ seatClass, rows }) => (
          <div key={seatClass.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-base">
                  {seatClass.name}
                </Badge>
                <span className="text-sm text-gray-600">
                  {seatClass.price.toLocaleString()}원
                </span>
              </div>
              <span className="text-sm text-gray-600">
                잔여 {seatClass.availableSeats}/{seatClass.totalSeats}
              </span>
            </div>

            <div className="space-y-2">
              {rows.map(({ key, seats }) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-sm font-medium w-12 text-gray-600">
                    {seats[0]?.rowLabel}열
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {seats.map((seat) => {
                      const status = getSeatStatus(seat.id, seat.isReserved);
                      return (
                        <button
                          key={seat.id}
                          onClick={() => {
                            if (status !== 'reserved') {
                              dispatch({ type: 'TOGGLE_SEAT', payload: { seat } });
                            }
                          }}
                          disabled={status === 'reserved'}
                          className={cn(
                            'w-10 h-10 rounded text-xs font-medium transition-colors',
                            getSeatColor(status)
                          )}
                          title={`${seat.rowLabel}열 ${seat.seatNumber}번`}
                        >
                          {seat.seatNumber}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

