"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CONCERT_DETAIL_MESSAGES } from "../constants";

interface ReservationCtaCardProps {
  concertId: string;
  isReservable: boolean;
  isEnded: boolean;
  isActive: boolean;
  totalAvailableSeats: number;
}

export function ReservationCtaCard({
  concertId,
  isReservable,
  isEnded,
  isActive,
  totalAvailableSeats,
}: ReservationCtaCardProps) {
  const router = useRouter();

  const handleReservationClick = () => {
    router.push(`/concerts/${concertId}/seats`);
  };

  const getDisabledMessage = () => {
    if (isEnded) return CONCERT_DETAIL_MESSAGES.ENDED;
    if (totalAvailableSeats === 0) return CONCERT_DETAIL_MESSAGES.SOLD_OUT;
    if (!isActive) return CONCERT_DETAIL_MESSAGES.INACTIVE;
    return null;
  };

  const disabledMessage = getDisabledMessage();

  return (
    <Card className="sticky bottom-4 shadow-lg">
      <CardContent className="p-4">
        {disabledMessage ? (
          <div className="text-center">
            <p className="mb-2 text-sm text-muted-foreground">
              {disabledMessage}
            </p>
            <Button disabled className="w-full">
              예약할 수 없습니다
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleReservationClick}
            className="w-full"
            size="lg"
            disabled={!isReservable}
          >
            예약하기
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

