-- 샘플 콘서트 데이터 삽입

DO $$
DECLARE
    concert_id uuid;
    vip_class_id uuid;
    r_class_id uuid;
    s_class_id uuid;
    a_class_id uuid;
    row_num integer;
    seat_num integer;
BEGIN
    -- 기존 샘플 데이터가 있는지 확인
    IF EXISTS (SELECT 1 FROM concerts WHERE title = '2025 신년 음악회') THEN
        RAISE NOTICE 'Sample concert already exists, skipping insertion';
        RETURN;
    END IF;

    -- 샘플 콘서트 생성
    INSERT INTO concerts (title, description, start_at, venue_name, poster_url, is_active)
    VALUES (
        '2025 신년 음악회',
        '새해를 맞이하는 클래식 음악회입니다. 베토벤 교향곡 5번과 차이콥스키 피아노 협주곡 1번을 감상하실 수 있습니다.',
        '2025-12-31 19:30:00+09'::timestamptz,
        '서울 예술의 전당 콘서트홀',
        null,
        true
    )
    RETURNING id INTO concert_id;

    -- VIP석 등급 생성
    INSERT INTO seat_classes (concert_id, name, price, total_seats, available_seats, display_order)
    VALUES (concert_id, 'VIP석', 150000, 50, 50, 1)
    RETURNING id INTO vip_class_id;

    -- R석 등급 생성
    INSERT INTO seat_classes (concert_id, name, price, total_seats, available_seats, display_order)
    VALUES (concert_id, 'R석', 120000, 80, 80, 2)
    RETURNING id INTO r_class_id;

    -- S석 등급 생성
    INSERT INTO seat_classes (concert_id, name, price, total_seats, available_seats, display_order)
    VALUES (concert_id, 'S석', 90000, 120, 120, 3)
    RETURNING id INTO s_class_id;

    -- A석 등급 생성
    INSERT INTO seat_classes (concert_id, name, price, total_seats, available_seats, display_order)
    VALUES (concert_id, 'A석', 60000, 150, 150, 4)
    RETURNING id INTO a_class_id;

    -- VIP석 좌석 생성 (5열 × 10좌석 = 50석)
    FOR row_num IN 1..5 LOOP
        FOR seat_num IN 1..10 LOOP
            INSERT INTO seats (concert_id, seat_class_id, row_label, seat_number)
            VALUES (concert_id, vip_class_id, 'VIP-' || row_num, seat_num);
        END LOOP;
    END LOOP;

    -- R석 좌석 생성 (8열 × 10좌석 = 80석)
    FOR row_num IN 1..8 LOOP
        FOR seat_num IN 1..10 LOOP
            INSERT INTO seats (concert_id, seat_class_id, row_label, seat_number)
            VALUES (concert_id, r_class_id, 'R-' || row_num, seat_num);
        END LOOP;
    END LOOP;

    -- S석 좌석 생성 (12열 × 10좌석 = 120석)
    FOR row_num IN 1..12 LOOP
        FOR seat_num IN 1..10 LOOP
            INSERT INTO seats (concert_id, seat_class_id, row_label, seat_number)
            VALUES (concert_id, s_class_id, 'S-' || row_num, seat_num);
        END LOOP;
    END LOOP;

    -- A석 좌석 생성 (15열 × 10좌석 = 150석)
    FOR row_num IN 1..15 LOOP
        FOR seat_num IN 1..10 LOOP
            INSERT INTO seats (concert_id, seat_class_id, row_label, seat_number)
            VALUES (concert_id, a_class_id, 'A-' || row_num, seat_num);
        END LOOP;
    END LOOP;

    RAISE NOTICE 'Sample concert data inserted successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting sample concert data: %', SQLERRM;
        RAISE;
END $$;

-- 추가 샘플 콘서트 (판매 중지)
INSERT INTO concerts (title, description, start_at, venue_name, is_active)
SELECT 
    '재즈 페스티벌 2025',
    '국내외 유명 재즈 아티스트들의 공연',
    '2025-06-15 19:00:00+09'::timestamptz,
    '블루노트 서울',
    false
WHERE NOT EXISTS (
    SELECT 1 FROM concerts WHERE title = '재즈 페스티벌 2025'
);

-- 추가 샘플 콘서트 (미래 공연)
INSERT INTO concerts (title, description, start_at, venue_name, is_active)
SELECT 
    '봄맞이 클래식 콘서트',
    '봄을 맞이하는 경쾌한 클래식 선율',
    '2026-03-20 19:00:00+09'::timestamptz,
    '세종문화회관 대극장',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM concerts WHERE title = '봄맞이 클래식 콘서트'
);

