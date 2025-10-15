import type { SupabaseClient } from '@supabase/supabase-js';
import { match } from 'ts-pattern';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  ConcertTableRowSchema,
  SeatClassTableRowSchema,
  type ConcertListParams,
  type ConcertListResponse,
  type ConcertRow,
  type SeatClassRow,
  type SeatClassSummary,
  type ConcertSummary,
} from '@/features/concerts/backend/schema';
import {
  concertErrorCodes,
  type ConcertServiceError,
} from '@/features/concerts/backend/error';

const CONCERTS_TABLE = 'concerts';
const SEAT_CLASSES_TABLE = 'seat_classes';

export const fetchConcertList = async (
  client: SupabaseClient,
  params: ConcertListParams,
): Promise<HandlerResult<ConcertListResponse, ConcertServiceError, unknown>> => {
  const { sort, isActive, page, pageSize } = params;

  let query = client.from(CONCERTS_TABLE).select('*', { count: 'exact' });

  if (isActive !== undefined) {
    query = query.eq('is_active', isActive);
  }

  const sortConfig = match(sort)
    .with('date_asc', () => ({ column: 'start_at', ascending: true }))
    .with('date_desc', () => ({ column: 'start_at', ascending: false }))
    .with('title_asc', () => ({ column: 'title', ascending: true }))
    .with('title_desc', () => ({ column: 'title', ascending: false }))
    .otherwise(() => ({ column: 'start_at', ascending: true }));

  query = query.order(sortConfig.column, { ascending: sortConfig.ascending });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data: concerts, error: concertsError, count } = await query;

  if (concertsError) {
    return failure(
      500,
      concertErrorCodes.fetchError,
      concertsError.message,
    );
  }

  if (!concerts) {
    return success({
      concerts: [],
      pagination: {
        page,
        pageSize,
        total: 0,
        totalPages: 0,
      },
    });
  }

  const concertsParsed = z.array(ConcertTableRowSchema).safeParse(concerts);

  if (!concertsParsed.success) {
    return failure(
      500,
      concertErrorCodes.validationError,
      'Concert rows failed validation.',
      concertsParsed.error.format(),
    );
  }

  const concertIds = concertsParsed.data.map((c) => c.id);

  let seatClassesData: SeatClassRow[] = [];

  if (concertIds.length > 0) {
    const { data: seatClasses, error: seatClassesError } = await client
      .from(SEAT_CLASSES_TABLE)
      .select('*')
      .in('concert_id', concertIds)
      .order('display_order', { ascending: true });

    if (seatClassesError) {
      return failure(
        500,
        concertErrorCodes.fetchError,
        seatClassesError.message,
      );
    }

    if (seatClasses) {
      const seatClassesParsed = z.array(SeatClassTableRowSchema).safeParse(seatClasses);

      if (!seatClassesParsed.success) {
        return failure(
          500,
          concertErrorCodes.validationError,
          'Seat class rows failed validation.',
          seatClassesParsed.error.format(),
        );
      }

      seatClassesData = seatClassesParsed.data;
    }
  }

  const seatClassesByCompanyId = seatClassesData.reduce(
    (acc, sc) => {
      if (!acc[sc.concert_id]) {
        acc[sc.concert_id] = [];
      }
      acc[sc.concert_id].push(sc);
      return acc;
    },
    {} as Record<string, SeatClassRow[]>,
  );

  const concertSummaries: ConcertSummary[] = concertsParsed.data.map((concert) => {
    const seatClasses = seatClassesByCompanyId[concert.id] ?? [];
    
    const seatClassSummaries: SeatClassSummary[] = seatClasses.map((sc) => ({
      id: sc.id,
      name: sc.name,
      price: sc.price,
      totalSeats: sc.total_seats,
      availableSeats: sc.available_seats,
      displayOrder: sc.display_order,
    }));

    return {
      id: concert.id,
      title: concert.title,
      description: concert.description,
      startAt: concert.start_at,
      venueName: concert.venue_name,
      posterUrl: concert.poster_url,
      isActive: concert.is_active,
      seatClasses: seatClassSummaries,
    };
  });

  const totalPages = count !== null ? Math.ceil(count / pageSize) : 0;

  return success({
    concerts: concertSummaries,
    pagination: {
      page,
      pageSize,
      total: count ?? 0,
      totalPages,
    },
  });
};

import { z } from 'zod';

