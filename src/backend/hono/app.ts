import { Hono } from 'hono';
import { errorBoundary } from '@/backend/middleware/error';
import { withAppContext } from '@/backend/middleware/context';
import { withSupabase } from '@/backend/middleware/supabase';
import { registerExampleRoutes } from '@/features/example/backend/route';
import { registerConcertRoutes } from '@/features/concerts/backend/route';
import { registerConcertDetailRoutes } from '@/features/concert-detail/backend/route';
import { registerReservationRoutes } from '@/features/reservation/backend/route';
import { registerPolicyDocumentsRoutes } from '@/features/policy-docs/backend/route';
import { registerReservationLookupRoutes } from '@/features/reservation-lookup/backend/route';
import type { AppEnv } from '@/backend/hono/context';

let singletonApp: Hono<AppEnv> | null = null;

export const createHonoApp = () => {
  if (singletonApp) {
    return singletonApp;
  }

  const app = new Hono<AppEnv>();

  app.use('*', errorBoundary());
  app.use('*', withAppContext());
  app.use('*', withSupabase());

  registerExampleRoutes(app);
  registerConcertRoutes(app);
  registerConcertDetailRoutes(app);
  registerReservationRoutes(app);
  registerPolicyDocumentsRoutes(app);
  registerReservationLookupRoutes(app);

  singletonApp = app;

  return app;
};
