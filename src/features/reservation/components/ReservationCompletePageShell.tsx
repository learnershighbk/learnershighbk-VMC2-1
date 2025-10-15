'use client';

import { useReservationDetailQuery } from '../hooks/useReservationDetailQuery';
import { ReservationStatusBanner } from './ReservationStatusBanner';
import { ReservationSummaryCard } from './ReservationSummaryCard';
import { ReservationActions } from './ReservationActions';
import { Card, CardContent } from '@/components/ui/card';

interface ReservationCompletePageShellProps {
  reservationId: string;
}

export const ReservationCompletePageShell = ({
  reservationId,
}: ReservationCompletePageShellProps) => {
  const { data, isLoading, isError, error, refetch } = useReservationDetailQuery(reservationId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6 animate-pulse">
          <div className="h-24 bg-muted rounded-lg" />
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="h-6 bg-muted rounded w-2/3" />
              <div className="h-6 bg-muted rounded w-1/2" />
              <div className="h-32 bg-muted rounded" />
            </CardContent>
          </Card>
          <div className="h-12 bg-muted rounded w-1/4 mx-auto" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <ReservationStatusBanner error />
          <ReservationActions
            onRetry={() => refetch()}
            showRetry
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <ReservationStatusBanner status={data.status} />
        <ReservationSummaryCard reservation={data} />
        <ReservationActions reservationCode={data.reservationCode} />
      </div>
    </div>
  );
};

