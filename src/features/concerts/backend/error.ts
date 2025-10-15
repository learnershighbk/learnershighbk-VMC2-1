export const concertErrorCodes = {
  fetchError: 'CONCERT_FETCH_ERROR',
  validationError: 'CONCERT_VALIDATION_ERROR',
  notFound: 'CONCERT_NOT_FOUND',
} as const;

export type ConcertServiceError =
  (typeof concertErrorCodes)[keyof typeof concertErrorCodes];

