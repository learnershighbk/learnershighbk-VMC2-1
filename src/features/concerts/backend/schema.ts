import { z } from 'zod';

const ALLOWED_SORTS = ['date_asc', 'date_desc', 'title_asc', 'title_desc'] as const;

export const ConcertListParamsSchema = z.object({
  sort: z.enum(ALLOWED_SORTS).optional().default('date_asc'),
  isActive: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().min(1).default(1)),
  pageSize: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().min(1).max(100).default(20)),
});

export type ConcertListParams = z.infer<typeof ConcertListParamsSchema>;

export const SeatClassSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  price: z.number().int().positive(),
  totalSeats: z.number().int().nonnegative(),
  availableSeats: z.number().int().nonnegative(),
  displayOrder: z.number().int(),
});

export type SeatClassSummary = z.infer<typeof SeatClassSummarySchema>;

export const ConcertSummarySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  startAt: z.string(),
  venueName: z.string(),
  posterUrl: z.string().nullable(),
  isActive: z.boolean(),
  seatClasses: z.array(SeatClassSummarySchema),
});

export type ConcertSummary = z.infer<typeof ConcertSummarySchema>;

export const ConcertListResponseSchema = z.object({
  concerts: z.array(ConcertSummarySchema),
  pagination: z.object({
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

export type ConcertListResponse = z.infer<typeof ConcertListResponseSchema>;

export const ConcertTableRowSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  start_at: z.string(),
  venue_name: z.string(),
  poster_url: z.string().nullable(),
  is_active: z.boolean(),
});

export type ConcertRow = z.infer<typeof ConcertTableRowSchema>;

export const SeatClassTableRowSchema = z.object({
  id: z.string().uuid(),
  concert_id: z.string().uuid(),
  name: z.string(),
  price: z.number(),
  total_seats: z.number(),
  available_seats: z.number(),
  display_order: z.number(),
});

export type SeatClassRow = z.infer<typeof SeatClassTableRowSchema>;

