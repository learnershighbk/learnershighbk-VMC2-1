'use client';

import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { reservationMessages } from '../constants/messages';
import type { ReservationStatus } from '../lib/dto';

interface ReservationStatusBannerProps {
  status?: ReservationStatus;
  error?: boolean;
}

export const ReservationStatusBanner = ({
  status,
  error,
}: ReservationStatusBannerProps) => {
  if (error) {
    return (
      <div
        className={cn(
          'rounded-lg border p-4 flex items-start gap-3',
          'bg-destructive/10 border-destructive/50 text-destructive'
        )}
        role="alert"
        aria-live="polite"
      >
        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h2 className="font-semibold text-lg">
            {reservationMessages.headline.error}
          </h2>
          <p className="text-sm mt-1 opacity-90">
            {reservationMessages.description.error}
          </p>
        </div>
      </div>
    );
  }

  if (status === 'reserved') {
    return (
      <div
        className={cn(
          'rounded-lg border p-4 flex items-start gap-3',
          'bg-green-50 border-green-200 text-green-800'
        )}
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h2 className="font-semibold text-lg">
            {reservationMessages.headline.reserved}
          </h2>
          <p className="text-sm mt-1 opacity-90">
            {reservationMessages.description.reserved}
          </p>
        </div>
      </div>
    );
  }

  if (status === 'canceled') {
    return (
      <div
        className={cn(
          'rounded-lg border p-4 flex items-start gap-3',
          'bg-gray-50 border-gray-200 text-gray-700'
        )}
        role="status"
        aria-live="polite"
      >
        <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h2 className="font-semibold text-lg">
            {reservationMessages.headline.canceled}
          </h2>
          <p className="text-sm mt-1 opacity-90">
            {reservationMessages.description.canceled}
          </p>
        </div>
      </div>
    );
  }

  return null;
};

