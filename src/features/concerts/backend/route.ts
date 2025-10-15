import type { Hono } from 'hono';
import {
  failure,
  respond,
  type ErrorResult,
} from '@/backend/http/response';
import {
  getLogger,
  getSupabase,
  type AppEnv,
} from '@/backend/hono/context';
import { ConcertListParamsSchema } from '@/features/concerts/backend/schema';
import { fetchConcertList } from './service';
import {
  concertErrorCodes,
  type ConcertServiceError,
} from './error';

export const registerConcertRoutes = (app: Hono<AppEnv>) => {
  app.get('/api/concerts', async (c) => {
    const queryParams = c.req.query();

    const parsedParams = ConcertListParamsSchema.safeParse({
      sort: queryParams.sort,
      isActive: queryParams.isActive,
      page: queryParams.page,
      pageSize: queryParams.pageSize,
    });

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_CONCERT_PARAMS',
          'The provided concert list parameters are invalid.',
          parsedParams.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await fetchConcertList(supabase, parsedParams.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<ConcertServiceError, unknown>;

      if (errorResult.error.code === concertErrorCodes.fetchError) {
        logger.error('Failed to fetch concerts', errorResult.error.message);
      }

      return respond(c, result);
    }

    return respond(c, result);
  });
};

