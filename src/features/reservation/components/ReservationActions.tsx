'use client';

import { useRouter } from 'next/navigation';
import { Home, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { reservationMessages } from '../constants/messages';
import { ReservationCopyButton } from './ReservationCopyButton';

interface ReservationActionsProps {
  reservationCode?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const ReservationActions = ({
  reservationCode,
  onRetry,
  showRetry = false,
}: ReservationActionsProps) => {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoToLookup = () => {
    router.push('/reservations/lookup');
  };

  return (
    <div className="flex flex-col gap-4">
      {reservationCode && (
        <div className="flex justify-center">
          <ReservationCopyButton
            text={reservationCode}
            label={reservationMessages.action.copyCode}
            variant="default"
            size="default"
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={handleGoHome}
          className="gap-2"
        >
          <Home className="h-4 w-4" />
          <span>{reservationMessages.action.goHome}</span>
        </Button>

        {showRetry && onRetry && (
          <Button
            type="button"
            variant="outline"
            onClick={onRetry}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{reservationMessages.action.retry}</span>
          </Button>
        )}
      </div>
    </div>
  );
};

