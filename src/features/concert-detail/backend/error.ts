export const ConcertDetailErrorCode = {
  CONCERT_NOT_FOUND: "CONCERT_NOT_FOUND",
  CONCERT_INACTIVE: "CONCERT_INACTIVE",
  INVALID_CONCERT_ID: "INVALID_CONCERT_ID",
  SEAT_CLASS_NOT_FOUND: "SEAT_CLASS_NOT_FOUND",
} as const;

export type ConcertDetailErrorCode =
  (typeof ConcertDetailErrorCode)[keyof typeof ConcertDetailErrorCode];

