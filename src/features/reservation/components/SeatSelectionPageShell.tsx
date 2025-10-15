'use client';

import { useEffect } from 'react';
import { SeatSelectionProvider } from '../state/seat-selection-context';
import { useSeatDataQuery } from '../hooks/useSeatDataQuery';
import { useSeatSelection } from '../hooks/useSeatSelection';
import { SeatMapPanel } from './SeatMapPanel';
import { SummaryPanel } from './SummaryPanel';
import { PurchaserForm } from './PurchaserForm';
import { Card } from '@/components/ui/card';

interface SeatSelectionPageShellProps {
  concertId: string;
}

const SeatSelectionContent = ({ concertId }: { concertId: string }) => {
  const { data, isLoading, error } = useSeatDataQuery(concertId);
  const { dispatch } = useSeatSelection();

  useEffect(() => {
    if (data) {
      dispatch({
        type: 'HYDRATE_CONCERT',
        payload: {
          concertInfo: data.concertInfo,
          seatClasses: data.seatClasses,
          seats: data.seats,
        },
      });
    }
  }, [data, dispatch]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <div className="h-12 bg-gray-200 animate-pulse rounded" />
          <div className="h-96 bg-gray-200 animate-pulse rounded" />
          <div className="h-48 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">오류가 발생했습니다</h2>
            <p className="text-gray-600 mb-4">좌석 정보를 불러올 수 없습니다</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              다시 시도
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{data.concertInfo.title}</h1>
        <p className="text-gray-600">
          {new Date(data.concertInfo.startAt).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })} | {data.concertInfo.venueName}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SeatMapPanel />
        </div>
        <div className="space-y-6">
          <SummaryPanel />
          <PurchaserForm />
        </div>
      </div>
    </div>
  );
};

export const SeatSelectionPageShell = ({ concertId }: SeatSelectionPageShellProps) => {
  return (
    <SeatSelectionProvider concertId={concertId}>
      <SeatSelectionContent concertId={concertId} />
    </SeatSelectionProvider>
  );
};

