import type { Hono } from 'hono';
import type { AppEnv } from '@/backend/hono/context';
import { respond } from '@/backend/http/response';
import { PolicyDocumentParamsSchema } from './schema';
import { getPolicyDocumentBySlug } from './service';

export function registerPolicyDocumentsRoutes(app: Hono<AppEnv>) {
  app.get('/api/docs/:slug', async (c) => {
    const supabase = c.get('supabase');
    const logger = c.get('logger');

    const paramsResult = PolicyDocumentParamsSchema.safeParse({
      slug: c.req.param('slug'),
    });

    if (!paramsResult.success) {
      logger.warn('Invalid policy document slug', {
        errors: paramsResult.error.errors,
      });
      return c.json(
        {
          success: false,
          error: {
            code: 'INVALID_PARAMS',
            message: 'Invalid document slug format',
          },
        },
        400
      );
    }

    const { slug } = paramsResult.data;
    const result = await getPolicyDocumentBySlug(supabase, slug);

    return respond(c, result);
  });
}

