'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ConcertCardModel } from '@/features/concerts/lib/dto';
import { cn } from '@/lib/utils';

interface ConcertCardProps {
  concert: ConcertCardModel;
  onClick?: () => void;
}

export const ConcertCard = ({ concert, onClick }: ConcertCardProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-200 hover:shadow-lg',
        onClick && 'cursor-pointer',
        !concert.isActive && 'opacity-60',
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={`${concert.title} 상세보기`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        <img
          src={concert.posterUrl}
          alt={concert.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {concert.isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <Badge variant="destructive" className="text-lg px-4 py-2">
              예약 마감
            </Badge>
          </div>
        )}
        {!concert.isActive && !concert.isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              판매 중지
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-2">
        <h3 className="font-bold text-lg line-clamp-2 min-h-[3.5rem]">
          {concert.title}
        </h3>

        <div className="space-y-1 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <span className="font-medium">일시</span>
            <span>{concert.formattedDate}</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="font-medium">시간</span>
            <span>{concert.formattedTime}</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="font-medium">장소</span>
            <span className="line-clamp-1">{concert.venueName}</span>
          </p>
        </div>

        {concert.isActive && !concert.isSoldOut && (
          <div className="pt-2 border-t">
            <p className="text-sm text-primary font-medium">
              잔여석: {concert.totalAvailableSeats.toLocaleString()}석
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

