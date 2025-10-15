-- 추가 한국 주요 콘서트 및 페스티벌 데이터 삽입

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
    -- 1. IU 콘서트 '2025 IU CONCERT H.E.R'
    IF NOT EXISTS (SELECT 1 FROM concerts WHERE title = '2025 IU CONCERT H.E.R') THEN
        INSERT INTO concerts (title, description, start_at, venue_name, poster_url, is_active)
        VALUES (
            '2025 IU CONCERT H.E.R',
            '아이유의 새로운 앨범을 기념하는 전국 투어 콘서트입니다. 감성 발라드부터 업템포 댄스곡까지 다채로운 무대를 선보입니다.',
            '2025-11-15 19:00:00+09'::timestamptz,
            '고척스카이돔',
            null,
            true
        )
        RETURNING id INTO concert_id;

        -- 좌석 등급 생성
        INSERT INTO seat_classes (concert_id, name, price, total_seats, available_seats, display_order)
        VALUES (concert_id, 'VIP석', 180000, 100, 100, 1)
        RETURNING id INTO vip_class_id;

        INSERT INTO seat_classes (concert_id, name, price, total_seats, available_seats, display_order)
        VALUES (concert_id, 'R석', 150000, 150, 150, 2)
        RETURNING id INTO r_class_id;

        INSERT INTO seat_classes (concert_id, name, price, total_seats, available_seats, display_order)
        VALUES (concert_id, 'S석', 120000, 200, 200, 3)
        RETURNING id INTO s_class_id;

        -- 좌석 생성 (VIP: 10x10, R: 15x10, S: 20x10)
        FOR row_num IN 1..10 LOOP
            FOR seat_num IN 1..10 LOOP
                INSERT INTO seats (concert_id, seat_class_id, row_label, seat_number)
                VALUES (concert_id, vip_class_id, 'VIP-' || row_num, seat_num);
            END LOOP;
        END LOOP;

        FOR row_num IN 1..15 LOOP
            FOR seat_num IN 1..10 LOOP
                INSERT INTO seats (concert_id, seat_class_id, row_label, seat_number)
                VALUES (concert_id, r_class_id, 'R-' || row_num, seat_num);
            END LOOP;
        END LOOP;

        FOR row_num IN 1..20 LOOP
            FOR seat_num IN 1..10 LOOP
                INSERT INTO seats (concert_id, seat_class_id, row_label, seat_number)
                VALUES (concert_id, s_class_id, 'S-' || row_num, seat_num);
            END LOOP;
        END LOOP;

        RAISE NOTICE 'IU 콘서트 데이터 삽입 완료';
    END IF;

    -- 2. 펜타포트 락 페스티벌
    IF NOT EXISTS (SELECT 1 FROM concerts WHERE title = '2025 펜타포트 락 페스티벌') THEN
        INSERT INTO concerts (title, description, start_at, venue_name, poster_url, is_active)
        VALUES (
            '2025 펜타포트 락 페스티벌',
            '인천 송도에서 개최되는 국내 최대 규모의 락 페스티벌. 국내외 유명 밴드들의 열정적인 무대가 펼쳐집니다.',
            '2025-08-08 16:00:00+09'::timestamptz,
            '인천 송도 달빛축제공원',
            null,
            true
        )
        RETURNING id INTO concert_id;

        INSERT INTO seat_classes (concert_id, name, price, total_seats, available_seats, display_order)
        VALUES (concert_id, '스탠딩석', 99000, 500, 500, 1)
        RETURNING id INTO s_class_id;

        INSERT INTO seat_classes (concert_id, name, price, total_seats, available_seats, display_order)
        VALUES (concert_id, '일반석', 77000, 300, 300, 2)
        RETURNING id INTO a_class_id;

        -- 좌석 생성
        FOR row_num IN 1..50 LOOP
            FOR seat_num IN 1..10 LOOP
                INSERT INTO seats (concert_id, seat_class_id, row_label, seat_number)
                VALUES (concert_id, s_class_id, 'STAND-' || row_num, seat_num);
            END LOOP;
        END LOOP;

        FOR row_num IN 1..30 LOOP
            FOR seat_num IN 1..10 LOOP
                INSERT INTO seats (concert_id, seat_class_id, row_label, seat_number)
                VALUES (concert_id, a_class_id, 'SEAT-' || row_num, seat_num);
            END LOOP;
        END LOOP;

        RAISE NOTICE '펜타포트 락 페스티벌 데이터 삽입 완료';
    END IF;

    -- 3. 서울재즈페스티벌 2025
    IF NOT EXISTS (SELECT 1 FROM concerts WHERE title = '서울재즈페스티벌 2025') THEN
        INSERT INTO concerts (title, description, start_at, venue_name, poster_url, is_active)
        VALUES (
            '서울재즈페스티벌 2025',
            '올림픽공원에서 펼쳐지는 세계적인 재즈 뮤지션들의 향연. 가을 밤하늘 아래 감성적인 재즈 선율을 즐기세요.',
            '2025-09-20 18:00:00+09'::timestamptz,
            '올림픽공원 88잔디마당',
            null,
            true
        )
        RETURNING id INTO concert_id;

        INSERT INTO seat_classes (concert_id, name, price, total_seats, available_seats, display_order)
        VALUES (concert_id, 'VIP존', 130000, 80, 80, 1)
        RETURNING id INTO vip_class_id;

        INSERT INTO seat_classes (concert_id, name, price, total_seats, available_seats, display_order)
        VALUES (concert_id, '프리미엄존', 100000, 120, 120, 2)
        RETURNING id INTO r_class_id;

        INSERT INTO seat_classes (concert_id, name, price, total_seats, available_seats, display_order)
        VALUES (concert_id, '일반존', 70000, 200, 200, 3)
        RETURNING id INTO s_class_id;

        -- 좌석 생성
        FOR row_num IN 1..8 LOOP
            FOR seat_num IN 1..10 LOOP
                INSERT INTO seats (concert_id, seat_class_id, row_label, seat_number)
                VALUES (concert_id, vip_class_id, 'VIP-' || row_num, seat_num);
            END LOOP;
        END LOOP;

        FOR row_num IN 1..12 LOOP
            FOR seat_num IN 1..10 LOOP
                INSERT INTO seats (concert_id, seat_class_id, row_label, seat_number)
                VALUES (concert_id, r_class_id, 'PREM-' || row_num, seat_num);
            END LOOP;
        END LOOP;

        FOR row_num IN 1..20 LOOP
            FOR seat_num IN 1..10 LOOP
                INSERT INTO seats (concert_id, seat_class_id, row_label, seat_number)
                VALUES (concert_id, s_class_id, 'GEN-' || row_num, seat_num);
            END LOOP;
        END LOOP;

        RAISE NOTICE '서울재즈페스티벌 데이터 삽입 완료';
    END IF;

    -- 4. 뮤지컬 '레미제라블' 한국 공연
    IF NOT EXISTS (SELECT 1 FROM concerts WHERE title = '뮤지컬 레미제라블') THEN
        INSERT INTO concerts (title, description, start_at, venue_name, poster_url, is_active)
        VALUES (
            '뮤지컬 레미제라블',
            '빅토르 위고의 대작을 원작으로 한 세계적인 뮤지컬. 감동적인 스토리와 웅장한 음악이 어우러진 최고의 무대를 만나보세요.',
            '2025-10-10 19:30:00+09'::timestamptz,
            '샤롯데씨어터',
            null,
            true
        )
        RETURNING id INTO concert_id;

        INSERT INTO seat_classes (concert_id, name, price, total_seats, available_seats, display_order)
        VALUES (concert_id, 'VIP석', 170000, 60, 60, 1)
        RETURNING id INTO vip_class_id;

        INSERT INTO seat_classes (concert_id, name, price, total_seats, available_seats, display_order)
        VALUES (concert_id, 'R석', 140000, 100, 100, 2)
        RETURNING id INTO r_class_id;

        INSERT INTO seat_classes (concert_id, name, price, total_seats, available_seats, display_order)
        VALUES (concert_id, 'S석', 110000, 140, 140, 3)
        RETURNING id INTO s_class_id;

        INSERT INTO seat_classes (concert_id, name, price, total_seats, available_seats, display_order)
        VALUES (concert_id, 'A석', 80000, 100, 100, 4)
        RETURNING id INTO a_class_id;

        -- 좌석 생성
        FOR row_num IN 1..6 LOOP
            FOR seat_num IN 1..10 LOOP
                INSERT INTO seats (concert_id, seat_class_id, row_label, seat_number)
                VALUES (concert_id, vip_class_id, 'VIP-' || row_num, seat_num);
            END LOOP;
        END LOOP;

        FOR row_num IN 1..10 LOOP
            FOR seat_num IN 1..10 LOOP
                INSERT INTO seats (concert_id, seat_class_id, row_label, seat_number)
                VALUES (concert_id, r_class_id, 'R-' || row_num, seat_num);
            END LOOP;
        END LOOP;

        FOR row_num IN 1..14 LOOP
            FOR seat_num IN 1..10 LOOP
                INSERT INTO seats (concert_id, seat_class_id, row_label, seat_number)
                VALUES (concert_id, s_class_id, 'S-' || row_num, seat_num);
            END LOOP;
        END LOOP;

        FOR row_num IN 1..10 LOOP
            FOR seat_num IN 1..10 LOOP
                INSERT INTO seats (concert_id, seat_class_id, row_label, seat_number)
                VALUES (concert_id, a_class_id, 'A-' || row_num, seat_num);
            END LOOP;
        END LOOP;

        RAISE NOTICE '뮤지컬 레미제라블 데이터 삽입 완료';
    END IF;

    -- 5. 한여름밤의 클래식 - 서울시향 야외음악회
    IF NOT EXISTS (SELECT 1 FROM concerts WHERE title = '한여름밤의 클래식 - 서울시향 야외음악회') THEN
        INSERT INTO concerts (title, description, start_at, venue_name, poster_url, is_active)
        VALUES (
            '한여름밤의 클래식 - 서울시향 야외음악회',
            '서울시립교향악단이 선사하는 여름밤의 클래식 향연. 베토벤, 모차르트, 차이콥스키의 명곡을 야외에서 즐기세요.',
            '2025-07-25 19:30:00+09'::timestamptz,
            '세종문화회관 야외광장',
            null,
            true
        )
        RETURNING id INTO concert_id;

        INSERT INTO seat_classes (concert_id, name, price, total_seats, available_seats, display_order)
        VALUES (concert_id, '지정석', 50000, 200, 200, 1)
        RETURNING id INTO r_class_id;

        INSERT INTO seat_classes (concert_id, name, price, total_seats, available_seats, display_order)
        VALUES (concert_id, '자유석', 30000, 300, 300, 2)
        RETURNING id INTO s_class_id;

        -- 좌석 생성
        FOR row_num IN 1..20 LOOP
            FOR seat_num IN 1..10 LOOP
                INSERT INTO seats (concert_id, seat_class_id, row_label, seat_number)
                VALUES (concert_id, r_class_id, 'RES-' || row_num, seat_num);
            END LOOP;
        END LOOP;

        FOR row_num IN 1..30 LOOP
            FOR seat_num IN 1..10 LOOP
                INSERT INTO seats (concert_id, seat_class_id, row_label, seat_number)
                VALUES (concert_id, s_class_id, 'FREE-' || row_num, seat_num);
            END LOOP;
        END LOOP;

        RAISE NOTICE '한여름밤의 클래식 데이터 삽입 완료';
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting additional concert data: %', SQLERRM;
        RAISE;
END $$;

