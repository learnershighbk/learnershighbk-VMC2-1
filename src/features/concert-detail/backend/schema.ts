import { z } from "zod";

export const ConcertDetailParamsSchema = z.object({
  concertId: z.string().uuid(),
});

export const SeatClassSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  price: z.number().int().positive(),
  totalSeats: z.number().int().nonnegative(),
  availableSeats: z.number().int().nonnegative(),
  displayOrder: z.number().int(),
});

export const ConcertDetailResponseSchema = z.object({
  concert: z.object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string().nullable(),
    startAt: z.string(),
    venueName: z.string(),
    posterUrl: z.string().nullable(),
    isActive: z.boolean(),
  }),
  seatClasses: z.array(SeatClassSchema),
  isReservable: z.boolean(),
  isEnded: z.boolean(),
  totalAvailableSeats: z.number().int().nonnegative(),
});

export type ConcertDetailParams = z.infer<typeof ConcertDetailParamsSchema>;
export type SeatClass = z.infer<typeof SeatClassSchema>;
export type ConcertDetailResponse = z.infer<
  typeof ConcertDetailResponseSchema
>;

