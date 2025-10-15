"use client";

import { Badge } from "@/components/ui/badge";
import { formatConcertDateTime } from "../lib/dto";
import { CONCERT_STATUS_BADGE } from "../constants";
import type { ConcertDetailResponse } from "../lib/dto";

interface ConcertHeroProps {
  concert: ConcertDetailResponse["concert"];
  isReservable: boolean;
  isEnded: boolean;
  totalAvailableSeats: number;
}

export function ConcertHero({
  concert,
  isReservable,
  isEnded,
  totalAvailableSeats,
}: ConcertHeroProps) {
  const posterUrl =
    concert.posterUrl || `https://picsum.photos/seed/${concert.id}/960/540`;

  const getBadgeVariant = () => {
    if (isEnded) return "secondary";
    if (totalAvailableSeats === 0) return "secondary";
    if (!concert.isActive) return "secondary";
    if (isReservable) return "default";
    return "secondary";
  };

  const getBadgeText = () => {
    if (isEnded) return CONCERT_STATUS_BADGE.ENDED;
    if (totalAvailableSeats === 0) return CONCERT_STATUS_BADGE.SOLD_OUT;
    if (!concert.isActive) return CONCERT_STATUS_BADGE.INACTIVE;
    if (isReservable) return CONCERT_STATUS_BADGE.ACTIVE;
    return CONCERT_STATUS_BADGE.INACTIVE;
  };

  return (
    <div className="w-full">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
        <img
          src={posterUrl}
          alt={concert.title}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold">{concert.title}</h1>
          <Badge variant={getBadgeVariant()}>{getBadgeText()}</Badge>
        </div>

        <div className="space-y-2 text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-medium">일시</span>
            <span>{formatConcertDateTime(concert.startAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">장소</span>
            <span>{concert.venueName}</span>
          </div>
        </div>

        {concert.description && (
          <div className="mt-4 rounded-lg bg-muted p-4">
            <p className="whitespace-pre-wrap text-sm">{concert.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

