import { z } from 'zod';

export const SeatDataParamsSchema = z.object({
  concertId: z.string().uuid(),
});

export const SeatClassSchema = z.object({
  id: z.string().uuid(),
  concertId: z.string().uuid(),
  name: z.string(),
  price: z.number().int().positive(),
  totalSeats: z.number().int().nonnegative(),
  availableSeats: z.number().int().nonnegative(),
  displayOrder: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const SeatSchema = z.object({
  id: z.string().uuid(),
  concertId: z.string().uuid(),
  seatClassId: z.string().uuid(),
  sectionLabel: z.string().nullable(),
  rowLabel: z.string(),
  seatNumber: z.number().int(),
  isReserved: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ConcertInfoSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  startAt: z.string(),
  venueName: z.string(),
  posterUrl: z.string().nullable(),
  isActive: z.boolean(),
});

export const SeatDataResponseSchema = z.object({
  seatClasses: z.array(SeatClassSchema),
  seats: z.array(SeatSchema),
  concertInfo: ConcertInfoSchema,
});

export const CreateReservationRequestSchema = z.object({
  concertId: z.string().uuid(),
  seatIds: z.array(z.string().uuid()).min(1).max(10),
  phoneNumber: z.string().regex(/^[0-9]{10,11}$/, '전화번호는 10-11자리 숫자여야 합니다'),
  password: z.string().regex(/^[0-9]{4}$/, '비밀번호는 숫자 4자리여야 합니다'),
  expectedTotal: z.number().int().nonnegative(),
});

export const CreateReservationResponseSchema = z.object({
  reservationId: z.string().uuid(),
  reservationCode: z.string(),
  totalPrice: z.number().int().nonnegative(),
});

export const ReservationParamsSchema = z.object({
  id: z.string().uuid(),
});

export const ReservationStatusSchema = z.enum(['reserved', 'canceled']);

export const ReservationSeatSchema = z.object({
  id: z.string().uuid(),
  seatId: z.string().uuid(),
  seatLabelSnapshot: z.string(),
  unitPrice: z.number().int().nonnegative(),
  isActive: z.boolean(),
});

export const ReservationDetailResponseSchema = z.object({
  id: z.string().uuid(),
  reservationCode: z.string(),
  status: ReservationStatusSchema,
  totalPrice: z.number().int().nonnegative(),
  reservedAt: z.string(),
  canceledAt: z.string().nullable(),
  concert: z.object({
    id: z.string().uuid(),
    title: z.string(),
    startAt: z.string(),
    venueName: z.string(),
    posterUrl: z.string().nullable(),
  }),
  seats: z.array(ReservationSeatSchema),
});

export type SeatDataParams = z.infer<typeof SeatDataParamsSchema>;
export type SeatClass = z.infer<typeof SeatClassSchema>;
export type Seat = z.infer<typeof SeatSchema>;
export type ConcertInfo = z.infer<typeof ConcertInfoSchema>;
export type SeatDataResponse = z.infer<typeof SeatDataResponseSchema>;
export type CreateReservationRequest = z.infer<typeof CreateReservationRequestSchema>;
export type CreateReservationResponse = z.infer<typeof CreateReservationResponseSchema>;
export type ReservationParams = z.infer<typeof ReservationParamsSchema>;
export type ReservationStatus = z.infer<typeof ReservationStatusSchema>;
export type ReservationSeat = z.infer<typeof ReservationSeatSchema>;
export type ReservationDetailResponse = z.infer<typeof ReservationDetailResponseSchema>;

