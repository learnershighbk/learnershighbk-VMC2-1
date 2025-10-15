import { handle } from 'hono/vercel';
import { createHonoApp } from '@/backend/hono/app';

export const runtime = 'nodejs';

export const GET = handle(createHonoApp());
export const POST = handle(createHonoApp());
export const PUT = handle(createHonoApp());
export const PATCH = handle(createHonoApp());
export const DELETE = handle(createHonoApp());
export const OPTIONS = handle(createHonoApp());
