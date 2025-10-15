import type { SupabaseClient } from "@supabase/supabase-js";
import { isBefore } from "date-fns";
import type { HandlerResult } from "@/backend/http/response";
import { failure, success } from "@/backend/http/response";
import type { ConcertDetailErrorCode } from "./error";
import type { ConcertDetailResponse, SeatClass } from "./schema";

export async function getConcertDetail(
  supabase: SupabaseClient,
  concertId: string
): Promise<HandlerResult<ConcertDetailResponse, ConcertDetailErrorCode, unknown>> {
  const { data: concert, error: concertError } = await supabase
    .from("concerts")
    .select("*")
    .eq("id", concertId)
    .maybeSingle();

  if (concertError) {
    return failure(404, "CONCERT_NOT_FOUND", "콘서트를 찾을 수 없습니다.");
  }

  if (!concert) {
    return failure(404, "CONCERT_NOT_FOUND", "콘서트를 찾을 수 없습니다.");
  }

  const { data: seatClasses, error: seatClassError } = await supabase
    .from("seat_classes")
    .select("*")
    .eq("concert_id", concertId)
    .order("display_order", { ascending: true });

  if (seatClassError) {
    return failure(500, "SEAT_CLASS_NOT_FOUND", "좌석 등급 정보를 불러올 수 없습니다.");
  }

  const mappedSeatClasses: SeatClass[] = (seatClasses || []).map((sc) => ({
    id: sc.id,
    name: sc.name,
    price: sc.price,
    totalSeats: sc.total_seats,
    availableSeats: Math.max(0, sc.available_seats),
    displayOrder: sc.display_order,
  }));

  const now = new Date();
  const startAt = new Date(concert.start_at);
  const isEnded = isBefore(startAt, now);
  const totalAvailableSeats = mappedSeatClasses.reduce(
    (sum, sc) => sum + sc.availableSeats,
    0
  );
  const isReservable =
    concert.is_active && !isEnded && totalAvailableSeats > 0;

  return success({
    concert: {
      id: concert.id,
      title: concert.title,
      description: concert.description,
      startAt: concert.start_at,
      venueName: concert.venue_name,
      posterUrl: concert.poster_url,
      isActive: concert.is_active,
    },
    seatClasses: mappedSeatClasses,
    isReservable,
    isEnded,
    totalAvailableSeats,
  });
}

