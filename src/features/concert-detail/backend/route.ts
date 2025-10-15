import type { Hono } from "hono";
import { respond, failure } from "@/backend/http/response";
import type { AppEnv } from "@/backend/hono/context";
import { ConcertDetailParamsSchema } from "./schema";
import { getConcertDetail } from "./service";

export function registerConcertDetailRoutes(app: Hono<AppEnv>) {
  app.get("/api/concerts/:concertId", async (c) => {
    const logger = c.get("logger");
    const supabase = c.get("supabase");

    const parseResult = ConcertDetailParamsSchema.safeParse({
      concertId: c.req.param("concertId"),
    });

    if (!parseResult.success) {
      logger.error("Invalid concert ID params", parseResult.error);
      return respond(
        c,
        failure(400, "INVALID_CONCERT_ID", "유효하지 않은 콘서트 ID입니다.")
      );
    }

    const { concertId } = parseResult.data;
    const result = await getConcertDetail(supabase, concertId);

    return respond(c, result);
  });
}

