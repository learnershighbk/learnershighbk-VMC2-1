-- 예약 데이터 확인 쿼리
-- 이 쿼리를 Supabase SQL Editor에서 실행하여 데이터를 확인하세요

-- 1. 전화번호로 예약 데이터 확인
SELECT 
    r.id,
    r.phone_number,
    r.password_hash,
    r.reservation_code,
    r.status,
    r.total_price,
    r.reserved_at,
    c.title as concert_title,
    c.start_at as concert_start_at
FROM reservations r
JOIN concerts c ON r.concert_id = c.id
WHERE r.phone_number = '01012345678';

-- 2. 예약 좌석 정보 확인
SELECT 
    rs.reservation_id,
    rs.seat_label_snapshot,
    rs.unit_price,
    rs.is_active
FROM reservation_seats rs
WHERE rs.reservation_id IN (
    SELECT id FROM reservations WHERE phone_number = '01012345678'
);

-- 3. 비밀번호 해시 확인 (앞부분만)
SELECT 
    phone_number,
    SUBSTRING(password_hash, 1, 20) as hash_preview,
    LENGTH(password_hash) as hash_length
FROM reservations
WHERE phone_number = '01012345678';

