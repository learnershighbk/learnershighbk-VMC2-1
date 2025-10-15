import type { Hono } from 'hono';
import type { AppEnv } from '@/backend/hono/context';
import { respond, success, failure } from '@/backend/http/response';
import { searchReservations, cancelReservation } from './service';
import { 
  SearchReservationsRequestSchema, 
  SearchReservationsResponseSchema,
  CancelReservationParamsSchema,
  CancelReservationResponseSchema,
} from './schema';
import { reservationLookupErrorCodes } from './error';

export const registerReservationLookupRoutes = (app: Hono<AppEnv>) => {
  app.post('/reservations/search', async (c) => {
    const supabase = c.get('supabase');
    const body = await c.req.json();

    const parseResult = SearchReservationsRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return respond(
        c,
        failure(400, reservationLookupErrorCodes.validationError, '입력 검증 실패', parseResult.error.errors)
      );
    }

    const result = await searchReservations(supabase, parseResult.data);

    if (!result.ok) {
      const errorCode = (result as { ok: false; error: string }).error;
      const statusCode = errorCode === reservationLookupErrorCodes.authenticationFailed 
        ? 401 
        : 500;
      const message = errorCode === reservationLookupErrorCodes.authenticationFailed
        ? '인증에 실패했습니다'
        : '예약 조회에 실패했습니다';
      return respond(c, failure(statusCode, errorCode, message));
    }

    const response = SearchReservationsResponseSchema.parse({
      reservations: result.data,
    });

    return respond(c, success(response, 200));
  });

  app.post('/reservations/:reservationId/cancel', async (c) => {
    const supabase = c.get('supabase');
    const reservationId = c.req.param('reservationId');

    const parseResult = CancelReservationParamsSchema.safeParse({ reservationId });
    if (!parseResult.success) {
      return respond(
        c,
        failure(400, reservationLookupErrorCodes.validationError, '입력 검증 실패', parseResult.error.errors)
      );
    }

    const result = await cancelReservation(supabase, reservationId);

    if (!result.ok) {
      const errorCode = (result as { ok: false; error: string }).error;
      const statusCode = errorCode === reservationLookupErrorCodes.reservationNotFound 
        ? 404
        : errorCode === reservationLookupErrorCodes.cancelNotAllowed
        ? 403
        : 500;
      const message = errorCode === reservationLookupErrorCodes.reservationNotFound
        ? '예약을 찾을 수 없습니다'
        : errorCode === reservationLookupErrorCodes.cancelNotAllowed
        ? '취소할 수 없는 예약입니다'
        : '예약 취소에 실패했습니다';
      return respond(c, failure(statusCode, errorCode, message));
    }

    const response = CancelReservationResponseSchema.parse(result.data);

    return respond(c, success(response, 200));
  });
};

