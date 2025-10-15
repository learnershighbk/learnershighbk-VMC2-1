import type { SupabaseClient } from '@supabase/supabase-js';
import type { HandlerResult } from '@/backend/http/response';
import { success, failure } from '@/backend/http/response';
import { reservationErrorCodes } from './error';
import type { 
  SeatDataResponse, 
  CreateReservationRequest, 
  CreateReservationResponse,
  ReservationDetailResponse,
  SeatClass,
  Seat,
  ConcertInfo,
  ReservationSeat,
} from './schema';
import { hashPassword } from '@/lib/utils/password-hash';

export const getSeatData = async (
  supabase: SupabaseClient,
  concertId: string
): Promise<HandlerResult<SeatDataResponse, string>> => {
  const { data: concert, error: concertError } = await supabase
    .from('concerts')
    .select('*')
    .eq('id', concertId)
    .single();

  if (concertError || !concert) {
    return failure(404, reservationErrorCodes.concertNotFound, '공연을 찾을 수 없습니다');
  }

  if (!concert.is_active) {
    return failure(400, reservationErrorCodes.concertInactive, '판매가 중지된 공연입니다');
  }

  const { data: seatClasses, error: seatClassesError } = await supabase
    .from('seat_classes')
    .select('*')
    .eq('concert_id', concertId)
    .order('display_order', { ascending: true });

  if (seatClassesError) {
    return failure(500, reservationErrorCodes.seatDataFetchError, '좌석 등급 정보를 불러올 수 없습니다');
  }

  const { data: seats, error: seatsError } = await supabase
    .from('seats')
    .select('*')
    .eq('concert_id', concertId)
    .order('row_label', { ascending: true })
    .order('seat_number', { ascending: true });

  if (seatsError) {
    return failure(500, reservationErrorCodes.seatDataFetchError, '좌석 정보를 불러올 수 없습니다');
  }

  const concertInfo: ConcertInfo = {
    id: concert.id,
    title: concert.title,
    description: concert.description,
    startAt: concert.start_at,
    venueName: concert.venue_name,
    posterUrl: concert.poster_url,
    isActive: concert.is_active,
  };

  const mappedSeatClasses: SeatClass[] = (seatClasses || []).map((sc) => ({
    id: sc.id,
    concertId: sc.concert_id,
    name: sc.name,
    price: sc.price,
    totalSeats: sc.total_seats,
    availableSeats: sc.available_seats,
    displayOrder: sc.display_order,
    createdAt: sc.created_at,
    updatedAt: sc.updated_at,
  }));

  const mappedSeats: Seat[] = (seats || []).map((s) => ({
    id: s.id,
    concertId: s.concert_id,
    seatClassId: s.seat_class_id,
    sectionLabel: s.section_label,
    rowLabel: s.row_label,
    seatNumber: s.seat_number,
    isReserved: s.is_reserved,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
  }));

  return success({
    seatClasses: mappedSeatClasses,
    seats: mappedSeats,
    concertInfo,
  });
};

export const createReservation = async (
  supabase: SupabaseClient,
  request: CreateReservationRequest
): Promise<HandlerResult<CreateReservationResponse, string>> => {
  const { concertId, seatIds, phoneNumber, password, expectedTotal } = request;

  const { data: selectedSeats, error: seatsError } = await supabase
    .from('seats')
    .select('*, seat_classes!inner(*)')
    .in('id', seatIds)
    .eq('concert_id', concertId);

  if (seatsError || !selectedSeats || selectedSeats.length !== seatIds.length) {
    return failure(400, reservationErrorCodes.invalidSeatsSelection, '유효하지 않은 좌석 선택입니다');
  }

  const alreadyReserved = selectedSeats.filter((seat) => seat.is_reserved);
  if (alreadyReserved.length > 0) {
    return failure(
      409,
      reservationErrorCodes.seatsAlreadyReserved,
      '이미 예약된 좌석이 포함되어 있습니다'
    );
  }

  const calculatedTotal = selectedSeats.reduce((sum, seat) => {
    const seatClass = seat.seat_classes as { price: number };
    return sum + seatClass.price;
  }, 0);

  if (calculatedTotal !== expectedTotal) {
    return failure(
      400,
      reservationErrorCodes.priceMatchFailure,
      '계산된 금액이 일치하지 않습니다'
    );
  }

  const seatClassCounts: Record<string, number> = {};
  selectedSeats.forEach((seat) => {
    const classId = seat.seat_class_id;
    seatClassCounts[classId] = (seatClassCounts[classId] || 0) + 1;
  });

  for (const [classId, count] of Object.entries(seatClassCounts)) {
    const { data: seatClass, error: classError } = await supabase
      .from('seat_classes')
      .select('available_seats')
      .eq('id', classId)
      .single();

    if (classError || !seatClass || seatClass.available_seats < count) {
      return failure(
        400,
        reservationErrorCodes.insufficientSeats,
        '선택한 좌석 등급의 잔여석이 부족합니다'
      );
    }
  }

  const passwordHash = await hashPassword(password);

  const { error: updateSeatsError } = await supabase
    .from('seats')
    .update({ is_reserved: true, updated_at: new Date().toISOString() })
    .in('id', seatIds)
    .eq('is_reserved', false);

  if (updateSeatsError) {
    return failure(
      409,
      reservationErrorCodes.seatsAlreadyReserved,
      '좌석 예약 중 오류가 발생했습니다'
    );
  }

  for (const [classId, count] of Object.entries(seatClassCounts)) {
    const { error: updateClassError } = await supabase.rpc('decrement_available_seats', {
      class_id: classId,
      decrement_by: count,
    });

    if (updateClassError) {
      console.error('RPC decrement_available_seats 에러:', updateClassError);
      
      await supabase
        .from('seats')
        .update({ is_reserved: false, updated_at: new Date().toISOString() })
        .in('id', seatIds);

      return failure(
        500,
        reservationErrorCodes.reservationCreateFailed,
        `좌석 재고 업데이트 중 오류가 발생했습니다: ${updateClassError.message || JSON.stringify(updateClassError)}`
      );
    }
  }

  const { data: reservation, error: reservationError } = await supabase
    .from('reservations')
    .insert({
      concert_id: concertId,
      phone_number: phoneNumber,
      password_hash: passwordHash,
      status: 'reserved',
      total_price: calculatedTotal,
      reserved_at: new Date().toISOString(),
    })
    .select('id, reservation_code, total_price')
    .single();

  if (reservationError || !reservation) {
    await supabase
      .from('seats')
      .update({ is_reserved: false, updated_at: new Date().toISOString() })
      .in('id', seatIds);

    for (const [classId, count] of Object.entries(seatClassCounts)) {
      await supabase.rpc('increment_available_seats', {
        class_id: classId,
        increment_by: count,
      });
    }

    return failure(
      500,
      reservationErrorCodes.reservationCreateFailed,
      '예약 생성 중 오류가 발생했습니다'
    );
  }

  const reservationSeatsData = selectedSeats.map((seat) => {
    const seatClass = seat.seat_classes as { name: string; price: number };
    return {
      reservation_id: reservation.id,
      seat_id: seat.id,
      seat_label_snapshot: `${seatClass.name} ${seat.row_label}열 ${seat.seat_number}번`,
      unit_price: seatClass.price,
      is_active: true,
    };
  });

  const { error: reservationSeatsError } = await supabase
    .from('reservation_seats')
    .insert(reservationSeatsData);

  if (reservationSeatsError) {
    await supabase
      .from('reservations')
      .update({ status: 'canceled', canceled_at: new Date().toISOString() })
      .eq('id', reservation.id);

    await supabase
      .from('seats')
      .update({ is_reserved: false, updated_at: new Date().toISOString() })
      .in('id', seatIds);

    for (const [classId, count] of Object.entries(seatClassCounts)) {
      await supabase.rpc('increment_available_seats', {
        class_id: classId,
        increment_by: count,
      });
    }

    return failure(
      500,
      reservationErrorCodes.reservationCreateFailed,
      '예약 좌석 매핑 생성 중 오류가 발생했습니다'
    );
  }

  return success({
    reservationId: reservation.id,
    reservationCode: reservation.reservation_code,
    totalPrice: reservation.total_price,
  });
};

export const getReservationDetail = async (
  supabase: SupabaseClient,
  id: string
): Promise<HandlerResult<ReservationDetailResponse, string>> => {
  const { data: reservation, error: reservationError } = await supabase
    .from('reservations')
    .select('*')
    .eq('id', id)
    .single();

  if (reservationError || !reservation) {
    return failure(404, reservationErrorCodes.reservationNotFound, '예약을 찾을 수 없습니다');
  }

  const { data: concert, error: concertError } = await supabase
    .from('concerts')
    .select('id, title, start_at, venue_name, poster_url')
    .eq('id', reservation.concert_id)
    .single();

  if (concertError || !concert) {
    return failure(500, reservationErrorCodes.reservationFetchFailed, '공연 정보를 불러올 수 없습니다');
  }

  const { data: reservationSeats, error: reservationSeatsError } = await supabase
    .from('reservation_seats')
    .select('*')
    .eq('reservation_id', id)
    .order('created_at', { ascending: true });

  if (reservationSeatsError) {
    return failure(500, reservationErrorCodes.reservationFetchFailed, '예약 좌석 정보를 불러올 수 없습니다');
  }

  const mappedSeats: ReservationSeat[] = (reservationSeats || []).map((rs) => ({
    id: rs.id,
    seatId: rs.seat_id,
    seatLabelSnapshot: rs.seat_label_snapshot,
    unitPrice: rs.unit_price,
    isActive: rs.is_active,
  }));

  return success({
    id: reservation.id,
    reservationCode: reservation.reservation_code,
    status: reservation.status,
    totalPrice: reservation.total_price,
    reservedAt: reservation.reserved_at,
    canceledAt: reservation.canceled_at,
    concert: {
      id: concert.id,
      title: concert.title,
      startAt: concert.start_at,
      venueName: concert.venue_name,
      posterUrl: concert.poster_url,
    },
    seats: mappedSeats,
  });
};

