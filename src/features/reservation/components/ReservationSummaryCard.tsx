'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  formatReservationDate, 
  formatReservationPrice,
  formatReservationPriceSimple,
} from '../lib/dto';
import { reservationMessages } from '../constants/messages';
import type { ReservationDetailResponse } from '../lib/dto';

interface ReservationSummaryCardProps {
  reservation: ReservationDetailResponse;
}

export const ReservationSummaryCard = ({
  reservation,
}: ReservationSummaryCardProps) => {
  const { concert, seats, totalPrice, reservationCode, reservedAt, canceledAt, status } = reservation;
  
  const activeSeatCount = seats.filter(seat => seat.isActive).length;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{reservationMessages.label.concertInfo}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-sm text-muted-foreground">
              {reservationMessages.label.reservationCode}
            </span>
            <span className="font-mono font-semibold text-lg">
              {reservationCode}
            </span>
          </div>

          <Separator />

          <div className="flex justify-between items-start">
            <span className="text-sm text-muted-foreground">
              {reservationMessages.label.concertTitle}
            </span>
            <span className="font-semibold text-right">
              {concert.title}
            </span>
          </div>

          <div className="flex justify-between items-start">
            <span className="text-sm text-muted-foreground">
              {reservationMessages.label.concertDate}
            </span>
            <span className="text-right">
              {formatReservationDate(concert.startAt)}
            </span>
          </div>

          <div className="flex justify-between items-start">
            <span className="text-sm text-muted-foreground">
              {reservationMessages.label.concertVenue}
            </span>
            <span className="text-right">
              {concert.venueName}
            </span>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="font-semibold">{reservationMessages.label.seatInfo}</h3>
          
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <ul className="space-y-2" role="list">
              {seats.map((seat) => (
                <li 
                  key={seat.id}
                  className="flex justify-between items-center text-sm"
                >
                  <span className={seat.isActive ? '' : 'line-through opacity-50'}>
                    {seat.seatLabelSnapshot}
                  </span>
                  <span className={seat.isActive ? 'font-medium' : 'line-through opacity-50'}>
                    {formatReservationPriceSimple(seat.unitPrice)}원
                  </span>
                </li>
              ))}
            </ul>

            <Separator className="my-3" />

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                {reservationMessages.label.seatCount}
              </span>
              <span className="font-medium">
                {activeSeatCount}석
              </span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">
              {reservationMessages.label.totalPrice}
            </span>
            <span className="text-2xl font-bold text-primary">
              {formatReservationPrice(totalPrice)}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>{reservationMessages.label.reservedAt}</span>
            <span>{formatReservationDate(reservedAt)}</span>
          </div>

          {status === 'canceled' && canceledAt && (
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>{reservationMessages.label.canceledAt}</span>
              <span>{formatReservationDate(canceledAt)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

