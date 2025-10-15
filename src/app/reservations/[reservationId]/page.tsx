'use client';

import { use } from 'react';
import { ReservationCompletePageShell } from '@/features/reservation/components/ReservationCompletePageShell';

export default function ReservationDetailPage({
  params,
}: {
  params: Promise<{ reservationId: string }>;
}) {
  const { reservationId } = use(params);

  return <ReservationCompletePageShell reservationId={reservationId} />;
}

