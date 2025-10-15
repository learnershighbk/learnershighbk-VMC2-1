'use client';

import { use } from 'react';
import { SeatSelectionPageShell } from '@/features/reservation/components/SeatSelectionPageShell';

export default function SeatSelectionPage({
  params,
}: {
  params: Promise<{ concertId: string }>;
}) {
  const { concertId } = use(params);

  return <SeatSelectionPageShell concertId={concertId} />;
}

