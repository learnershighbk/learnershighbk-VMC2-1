'use client';

import { ConcertCard } from '@/features/concerts/components/concert-card';
import { Button } from '@/components/ui/button';
import type { ConcertCardModel } from '@/features/concerts/lib/dto';
import { useRouter } from 'next/navigation';

interface ConcertGridProps {
  concerts: ConcertCardModel[];
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

const ConcertCardSkeleton = () => (
  <div className="overflow-hidden rounded-lg border bg-card">
    <div className="relative aspect-square w-full bg-muted animate-pulse" />
    <div className="p-4 space-y-3">
      <div className="h-6 bg-muted animate-pulse rounded" />
      <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
      <div className="space-y-2">
        <div className="h-4 bg-muted animate-pulse rounded w-full" />
        <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
        <div className="h-4 bg-muted animate-pulse rounded w-4/6" />
      </div>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
    <div className="text-center space-y-3">
      <p className="text-lg font-medium text-muted-foreground">
        공연 목록이 없습니다
      </p>
      <p className="text-sm text-muted-foreground">
        조건을 변경하거나 나중에 다시 시도해주세요.
      </p>
    </div>
  </div>
);

const ErrorState = ({ error, onRetry }: { error?: Error | null; onRetry?: () => void }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
    <div className="text-center space-y-4 max-w-md">
      <p className="text-lg font-medium text-destructive">
        공연 목록을 불러오지 못했습니다
      </p>
      {error?.message && (
        <p className="text-sm text-muted-foreground">{error.message}</p>
      )}
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          다시 시도
        </Button>
      )}
    </div>
  </div>
);

export const ConcertGrid = ({
  concerts,
  isLoading,
  isError,
  error,
  onRetry,
}: ConcertGridProps) => {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <ConcertCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="grid grid-cols-1">
        <ErrorState error={error} onRetry={onRetry} />
      </div>
    );
  }

  if (concerts.length === 0) {
    return (
      <div className="grid grid-cols-1">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {concerts.map((concert) => (
        <ConcertCard
          key={concert.id}
          concert={concert}
          onClick={() => router.push(`/concerts/${concert.id}`)}
        />
      ))}
    </div>
  );
};

