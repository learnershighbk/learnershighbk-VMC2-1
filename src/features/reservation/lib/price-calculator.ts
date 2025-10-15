import type { SeatClass } from '../backend/schema';

export interface SelectedSeat {
  id: string;
  seatClassId: string;
  rowLabel: string;
  seatNumber: number;
  sectionLabel: string | null;
}

export interface SeatClassSummary {
  name: string;
  price: number;
  count: number;
  subtotal: number;
}

export interface PricingSummary {
  totalAmount: number;
  breakdown: Record<string, SeatClassSummary>;
}

export const calculatePricingSummary = (
  selectedSeats: Record<string, SelectedSeat>,
  seatClasses: SeatClass[]
): PricingSummary => {
  const breakdown: Record<string, SeatClassSummary> = {};
  let totalAmount = 0;

  Object.values(selectedSeats).forEach((seat) => {
    const seatClass = seatClasses.find((sc) => sc.id === seat.seatClassId);
    if (!seatClass) return;

    if (!breakdown[seatClass.id]) {
      breakdown[seatClass.id] = {
        name: seatClass.name,
        price: seatClass.price,
        count: 0,
        subtotal: 0,
      };
    }

    breakdown[seatClass.id].count += 1;
    breakdown[seatClass.id].subtotal += seatClass.price;
    totalAmount += seatClass.price;
  });

  return { totalAmount, breakdown };
};

