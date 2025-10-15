"use client";

import { useConcertDetailQuery } from "../hooks/useConcertDetailQuery";
import { ConcertHero } from "./ConcertHero";
import { SeatClassSummaryTable } from "./SeatClassSummaryTable";
import { ReservationCtaCard } from "./ReservationCtaCard";
import { CONCERT_DETAIL_MESSAGES } from "../constants";
import { Button } from "@/components/ui/button";

interface ConcertDetailPageShellProps {
  concertId: string;
}

export function ConcertDetailPageShell({
  concertId,
}: ConcertDetailPageShellProps) {
  const { data, isLoading, isError, error, refetch } =
    useConcertDetailQuery(concertId);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8">
        <div className="space-y-4">
          <div className="aspect-video w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
        </div>
        <SeatClassSummaryTable seatClasses={[]} isLoading={true} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <h2 className="mb-2 text-xl font-semibold text-destructive">
            {CONCERT_DETAIL_MESSAGES.ERROR_GENERIC}
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            {error?.message || CONCERT_DETAIL_MESSAGES.ERROR_NOT_FOUND}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8">
      <ConcertHero
        concert={data.concert}
        isReservable={data.isReservable}
        isEnded={data.isEnded}
        totalAvailableSeats={data.totalAvailableSeats}
      />

      <SeatClassSummaryTable seatClasses={data.seatClasses} />

      <ReservationCtaCard
        concertId={concertId}
        isReservable={data.isReservable}
        isEnded={data.isEnded}
        isActive={data.concert.isActive}
        totalAvailableSeats={data.totalAvailableSeats}
      />
    </div>
  );
}

