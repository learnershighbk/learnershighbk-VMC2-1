export const reservationErrorCodes = {
  concertNotFound: 'CONCERT_NOT_FOUND',
  concertInactive: 'CONCERT_INACTIVE',
  seatDataFetchError: 'SEAT_DATA_FETCH_ERROR',
  
  invalidSeatsSelection: 'INVALID_SEATS_SELECTION',
  seatsAlreadyReserved: 'SEATS_ALREADY_RESERVED',
  insufficientSeats: 'INSUFFICIENT_SEATS',
  priceMatchFailure: 'PRICE_MATCH_FAILURE',
  reservationCreateFailed: 'RESERVATION_CREATE_FAILED',
  
  invalidReservationId: 'INVALID_RESERVATION_ID',
  reservationNotFound: 'RESERVATION_NOT_FOUND',
  reservationNotActive: 'RESERVATION_NOT_ACTIVE',
  reservationFetchFailed: 'RESERVATION_FETCH_FAILED',
  
  validationError: 'VALIDATION_ERROR',
} as const;

export type ReservationErrorCode = typeof reservationErrorCodes[keyof typeof reservationErrorCodes];

