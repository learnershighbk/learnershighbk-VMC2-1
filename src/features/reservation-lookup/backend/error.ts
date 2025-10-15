export const reservationLookupErrorCodes = {
  authenticationFailed: 'AUTHENTICATION_FAILED',
  noReservationsFound: 'NO_RESERVATIONS_FOUND',
  searchFailed: 'RESERVATION_SEARCH_FAILED',
  reservationNotFound: 'RESERVATION_NOT_FOUND',
  alreadyCanceled: 'ALREADY_CANCELED',
  cancelNotAllowed: 'CANCEL_NOT_ALLOWED',
  cancelFailed: 'RESERVATION_CANCEL_FAILED',
  validationError: 'VALIDATION_ERROR',
} as const;

export type ReservationLookupServiceError = 
  (typeof reservationLookupErrorCodes)[keyof typeof reservationLookupErrorCodes];

