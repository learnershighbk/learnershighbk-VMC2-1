import type { Seat, SeatClass } from '../backend/schema';

export const formatSeatLabel = (seat: Seat): string => 
  `${seat.rowLabel}열 ${seat.seatNumber}번`;

export const formatSeatWithClass = (seat: Seat, seatClass: SeatClass): string => 
  `${seatClass.name} - ${formatSeatLabel(seat)}`;

export const formatSeatWithSection = (seat: Seat): string => {
  const sectionPart = seat.sectionLabel ? `${seat.sectionLabel} ` : '';
  return `${sectionPart}${seat.rowLabel}열 ${seat.seatNumber}번`;
};

