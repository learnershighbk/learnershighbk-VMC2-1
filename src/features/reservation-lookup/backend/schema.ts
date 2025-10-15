import { z } from 'zod';

export const SearchReservationsRequestSchema = z.object({
  phoneNumber: z.string().regex(/^[0-9]{10,11}$/, '전화번호는 10-11자리 숫자여야 합니다'),
  password: z.string().regex(/^[0-9]{4}$/, '비밀번호는 숫자 4자리여야 합니다'),
});

export const ReservationSeatDetailSchema = z.object({
  seatLabelSnapshot: z.string(),
  unitPrice: z.number().int().nonnegative(),
});

export const ReservationDetailSchema = z.object({
  id: z.string().uuid(),
  concertId: z.string().uuid(),
  concertTitle: z.string(),
  concertStartAt: z.string(),
  venueName: z.string(),
  reservationCode: z.string(),
  status: z.enum(['reserved', 'canceled']),
  totalPrice: z.number().int().nonnegative(),
  reservedAt: z.string(),
  canceledAt: z.string().nullable(),
  seats: z.array(ReservationSeatDetailSchema),
});

export const SearchReservationsResponseSchema = z.object({
  reservations: z.array(ReservationDetailSchema),
});

export const CancelReservationParamsSchema = z.object({
  reservationId: z.string().uuid(),
});

export const CancelReservationResponseSchema = z.object({
  reservationId: z.string().uuid(),
  status: z.literal('canceled'),
  canceledAt: z.string(),
});

export type SearchReservationsRequest = z.infer<typeof SearchReservationsRequestSchema>;
export type ReservationSeatDetail = z.infer<typeof ReservationSeatDetailSchema>;
export type ReservationDetail = z.infer<typeof ReservationDetailSchema>;
export type SearchReservationsResponse = z.infer<typeof SearchReservationsResponseSchema>;
export type CancelReservationParams = z.infer<typeof CancelReservationParamsSchema>;
export type CancelReservationResponse = z.infer<typeof CancelReservationResponseSchema>;

