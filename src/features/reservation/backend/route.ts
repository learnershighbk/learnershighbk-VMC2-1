import type { Hono } from 'hono';
import type { AppEnv } from '@/backend/hono/context';
import { respond, failure } from '@/backend/http/response';
import { getSeatData, createReservation, getReservationDetail } from './service';
import { 
  SeatDataParamsSchema, 
  CreateReservationRequestSchema,
  ReservationParamsSchema,
} from './schema';
import { reservationErrorCodes } from './error';

export const registerReservationRoutes = (app: Hono<AppEnv>) => {
  app.get('/api/concerts/:concertId/seats', async (c) => {
    const supabase = c.get('supabase');
    const { concertId } = c.req.param();

    const paramsValidation = SeatDataParamsSchema.safeParse({ concertId });
    if (!paramsValidation.success) {
      const result = failure(
        400,
        reservationErrorCodes.validationError,
        '유효하지 않은 공연 ID입니다'
      );
      return respond(c, result);
    }

    const result = await getSeatData(supabase, concertId);
    return respond(c, result);
  });

  app.post('/api/reservations', async (c) => {
    const supabase = c.get('supabase');
    const body = await c.req.json();

    const requestValidation = CreateReservationRequestSchema.safeParse(body);
    if (!requestValidation.success) {
      const result = failure(
        400,
        reservationErrorCodes.validationError,
        requestValidation.error.errors[0]?.message || '유효하지 않은 요청입니다'
      );
      return respond(c, result);
    }

    const result = await createReservation(supabase, requestValidation.data);
    return respond(c, result);
  });

  app.get('/api/reservations/:id', async (c) => {
    const supabase = c.get('supabase');
    const { id } = c.req.param();

    const paramsValidation = ReservationParamsSchema.safeParse({ id });
    if (!paramsValidation.success) {
      const result = failure(
        400,
        reservationErrorCodes.invalidReservationId,
        '유효하지 않은 예약 ID입니다'
      );
      return respond(c, result);
    }

    const result = await getReservationDetail(supabase, id);
    return respond(c, result);
  });
};

