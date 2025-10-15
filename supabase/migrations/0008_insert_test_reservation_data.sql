-- 테스트용 예약 데이터 삽입
-- 전화번호: 01012345678
-- 비밀번호: 1234
-- 
-- NOTE: 이 migration은 bcryptjs로 생성된 실제 해시를 사용합니다.
-- 비밀번호 '1234'의 bcrypt 해시 (cost factor 10)

DO $$
DECLARE
    test_concert_id uuid;
    test_vip_class_id uuid;
    test_reservation_id uuid;
    test_seat_id_1 uuid;
    test_seat_id_2 uuid;
    test_password_hash text;
BEGIN
    -- 기존 테스트 예약 데이터가 있는지 확인
    IF EXISTS (SELECT 1 FROM reservations WHERE phone_number = '01012345678') THEN
        RAISE NOTICE 'Test reservation already exists, skipping insertion';
        RETURN;
    END IF;

    -- '2025 신년 음악회' 콘서트 ID 가져오기
    SELECT id INTO test_concert_id 
    FROM concerts 
    WHERE title = '2025 신년 음악회' 
    LIMIT 1;

    IF test_concert_id IS NULL THEN
        RAISE EXCEPTION 'Concert not found. Please run 0004_insert_sample_concert_data.sql first.';
    END IF;

    -- VIP석 클래스 ID 가져오기
    SELECT id INTO test_vip_class_id 
    FROM seat_classes 
    WHERE concert_id = test_concert_id 
      AND name = 'VIP석'
    LIMIT 1;

    IF test_vip_class_id IS NULL THEN
        RAISE EXCEPTION 'VIP seat class not found.';
    END IF;

    -- 예약 가능한 VIP석 2개 선택
    SELECT id INTO test_seat_id_1
    FROM seats
    WHERE concert_id = test_concert_id
      AND seat_class_id = test_vip_class_id
      AND is_reserved = false
    LIMIT 1;

    SELECT id INTO test_seat_id_2
    FROM seats
    WHERE concert_id = test_concert_id
      AND seat_class_id = test_vip_class_id
      AND is_reserved = false
      AND id != test_seat_id_1
    LIMIT 1;

    IF test_seat_id_1 IS NULL OR test_seat_id_2 IS NULL THEN
        RAISE EXCEPTION 'Not enough available VIP seats.';
    END IF;

    -- 비밀번호 '1234'의 bcrypt 해시 (bcryptjs cost 10으로 생성됨)
    -- 실제 해시 값: $2b$10$sTcSHbBhGstDJqxiDwebIef.wSC5Ax22vF.OUz.tkQpWNosZWUa1G
    test_password_hash := '$2b$10$sTcSHbBhGstDJqxiDwebIef.wSC5Ax22vF.OUz.tkQpWNosZWUa1G';

    -- 테스트 예약 생성
    INSERT INTO reservations (
        concert_id,
        phone_number,
        password_hash,
        reservation_code,
        status,
        total_price,
        reserved_at
    )
    VALUES (
        test_concert_id,
        '01012345678',
        test_password_hash,
        'RES-' || TO_CHAR(NOW(), 'YYYYMMDD-HH24MISS') || '-' || SUBSTR(MD5(RANDOM()::TEXT), 1, 4),
        'reserved',
        300000, -- VIP석 2매 x 150,000원
        NOW()
    )
    RETURNING id INTO test_reservation_id;

    -- 좌석 예약 처리
    UPDATE seats 
    SET is_reserved = true, updated_at = NOW()
    WHERE id IN (test_seat_id_1, test_seat_id_2);

    -- 예약 좌석 상세 정보 생성
    INSERT INTO reservation_seats (
        reservation_id,
        seat_id,
        seat_label_snapshot,
        unit_price,
        is_active
    )
    SELECT 
        test_reservation_id,
        s.id,
        s.row_label || '-' || s.seat_number,
        150000,
        true
    FROM seats s
    WHERE s.id IN (test_seat_id_1, test_seat_id_2);

    -- 좌석 클래스 가용 좌석 수 감소 (RPC 함수 사용)
    PERFORM decrement_available_seats(test_vip_class_id, 2);

    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Test reservation created successfully!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Phone Number: 01012345678';
    RAISE NOTICE 'Password: 1234';
    RAISE NOTICE 'Reservation ID: %', test_reservation_id;
    RAISE NOTICE 'Total Price: 300,000원 (VIP 2석)';
    RAISE NOTICE '==============================================';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating test reservation: %', SQLERRM;
        RAISE;
END $$;

