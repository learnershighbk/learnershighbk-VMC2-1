import type { SupabaseClient } from '@supabase/supabase-js';
import { verifyPassword } from '@/lib/utils/password-hash';
import { reservationLookupErrorCodes } from './error';
import type { SearchReservationsRequest, ReservationDetail } from './schema';

type ServiceResult<T> = 
  | { ok: true; data: T }
  | { ok: false; error: string };

export const searchReservations = async (
  supabase: SupabaseClient,
  request: SearchReservationsRequest
): Promise<ServiceResult<ReservationDetail[]>> => {
  try {
    const { phoneNumber, password } = request;

    console.log('[searchReservations] 조회 시작:', { phoneNumber });

    const { data: reservations, error: fetchError } = await supabase
      .from('reservations')
      .select(`
        id,
        concert_id,
        reservation_code,
        password_hash,
        status,
        total_price,
        reserved_at,
        canceled_at,
        concerts (
          title,
          start_at,
          venue_name
        )
      `)
      .eq('phone_number', phoneNumber)
      .order('reserved_at', { ascending: false });

    if (fetchError) {
      console.error('[searchReservations] DB 조회 오류:', fetchError);
      return { ok: false, error: reservationLookupErrorCodes.searchFailed };
    }

    console.log('[searchReservations] DB 조회 결과:', { 
      count: reservations?.length || 0,
      hasData: !!reservations
    });

    if (!reservations || reservations.length === 0) {
      console.log('[searchReservations] 예약 데이터 없음');
      return { ok: true, data: [] };
    }

    const matchedReservations: ReservationDetail[] = [];

    for (const reservation of reservations) {
      console.log('[searchReservations] 비밀번호 검증 시작:', { 
        reservationId: reservation.id,
        hasHash: !!reservation.password_hash,
        hashLength: reservation.password_hash?.length
      });
      
      const isMatch = await verifyPassword(password, reservation.password_hash);
      
      console.log('[searchReservations] 비밀번호 검증 결과:', { 
        reservationId: reservation.id,
        isMatch 
      });
      
      if (!isMatch) continue;

      const { data: seats, error: seatsError } = await supabase
        .from('reservation_seats')
        .select('seat_label_snapshot, unit_price')
        .eq('reservation_id', reservation.id)
        .eq('is_active', true);

      if (seatsError || !seats) {
        continue;
      }

      const concert = Array.isArray(reservation.concerts) 
        ? reservation.concerts[0] 
        : reservation.concerts;

      matchedReservations.push({
        id: reservation.id,
        concertId: reservation.concert_id,
        concertTitle: concert?.title || '',
        concertStartAt: concert?.start_at || '',
        venueName: concert?.venue_name || '',
        reservationCode: reservation.reservation_code,
        status: reservation.status as 'reserved' | 'canceled',
        totalPrice: reservation.total_price,
        reservedAt: reservation.reserved_at,
        canceledAt: reservation.canceled_at,
        seats: seats.map(seat => ({
          seatLabelSnapshot: seat.seat_label_snapshot,
          unitPrice: seat.unit_price,
        })),
      });
    }

    console.log('[searchReservations] 매칭된 예약 수:', matchedReservations.length);

    if (matchedReservations.length === 0) {
      console.log('[searchReservations] 비밀번호 불일치 - 인증 실패');
      return { ok: false, error: reservationLookupErrorCodes.authenticationFailed };
    }

    matchedReservations.sort((a, b) => {
      if (a.status === 'reserved' && b.status !== 'reserved') return -1;
      if (a.status !== 'reserved' && b.status === 'reserved') return 1;
      return new Date(b.reservedAt).getTime() - new Date(a.reservedAt).getTime();
    });

    console.log('[searchReservations] 조회 성공:', { count: matchedReservations.length });
    return { ok: true, data: matchedReservations };
  } catch (error) {
    console.error('[searchReservations] 예외 발생:', error);
    return { ok: false, error: reservationLookupErrorCodes.searchFailed };
  }
};

export const cancelReservation = async (
  supabase: SupabaseClient,
  reservationId: string
): Promise<ServiceResult<{ reservationId: string; status: 'canceled'; canceledAt: string }>> => {
  try {
    const { data: reservation, error: fetchError } = await supabase
      .from('reservations')
      .select(`
        id,
        concert_id,
        status,
        concerts (
          start_at
        )
      `)
      .eq('id', reservationId)
      .single();

    if (fetchError || !reservation) {
      return { ok: false, error: reservationLookupErrorCodes.reservationNotFound };
    }

    if (reservation.status === 'canceled') {
      const { data: existingData } = await supabase
        .from('reservations')
        .select('canceled_at')
        .eq('id', reservationId)
        .single();

      return {
        ok: true,
        data: {
          reservationId,
          status: 'canceled',
          canceledAt: existingData?.canceled_at || new Date().toISOString(),
        },
      };
    }

    if (reservation.status !== 'reserved') {
      return { ok: false, error: reservationLookupErrorCodes.cancelNotAllowed };
    }

    const concert = Array.isArray(reservation.concerts) 
      ? reservation.concerts[0] 
      : reservation.concerts;

    const concertStartTime = new Date(concert?.start_at || '');
    const now = new Date();

    if (concertStartTime <= now) {
      return { ok: false, error: reservationLookupErrorCodes.cancelNotAllowed };
    }

    const { data: reservationSeats, error: seatsError } = await supabase
      .from('reservation_seats')
      .select('seat_id, seat_label_snapshot')
      .eq('reservation_id', reservationId)
      .eq('is_active', true);

    if (seatsError || !reservationSeats || reservationSeats.length === 0) {
      return { ok: false, error: reservationLookupErrorCodes.cancelFailed };
    }

    const seatIds = reservationSeats.map(rs => rs.seat_id);

    const { data: seats, error: seatsFetchError } = await supabase
      .from('seats')
      .select('id, seat_class_id')
      .in('id', seatIds);

    if (seatsFetchError || !seats) {
      return { ok: false, error: reservationLookupErrorCodes.cancelFailed };
    }

    const seatClassCounts: Record<string, number> = {};
    seats.forEach(seat => {
      seatClassCounts[seat.seat_class_id] = (seatClassCounts[seat.seat_class_id] || 0) + 1;
    });

    const canceledAt = new Date().toISOString();

    const { error: updateReservationError } = await supabase
      .from('reservations')
      .update({
        status: 'canceled',
        canceled_at: canceledAt,
      })
      .eq('id', reservationId);

    if (updateReservationError) {
      return { ok: false, error: reservationLookupErrorCodes.cancelFailed };
    }

    const { error: updateSeatsError } = await supabase
      .from('seats')
      .update({ is_reserved: false })
      .in('id', seatIds);

    if (updateSeatsError) {
      return { ok: false, error: reservationLookupErrorCodes.cancelFailed };
    }

    const { error: deactivateError } = await supabase
      .from('reservation_seats')
      .update({ is_active: false })
      .eq('reservation_id', reservationId);

    if (deactivateError) {
      return { ok: false, error: reservationLookupErrorCodes.cancelFailed };
    }

    for (const [seatClassId, count] of Object.entries(seatClassCounts)) {
      const { error: incrementError } = await supabase.rpc('increment_available_seats', {
        class_id: seatClassId,
        increment_by: count,
      });

      if (incrementError) {
        console.error('Failed to increment available seats:', incrementError);
      }
    }

    return {
      ok: true,
      data: {
        reservationId,
        status: 'canceled',
        canceledAt,
      },
    };
  } catch (error) {
    console.error('cancelReservation error:', error);
    return { ok: false, error: reservationLookupErrorCodes.cancelFailed };
  }
};

