export const SEAT_LIMITS = {
  MAX_SELECTION: 4,
  MIN_SELECTION: 1,
} as const;

export enum SeatStatus {
  AVAILABLE = 'available',
  SELECTED = 'selected',
  RESERVED = 'reserved',
}

