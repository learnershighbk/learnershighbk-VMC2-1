-- Update concerts with dates before 2025-10-16 to dates between 2026-12 and 2027-12

DO $$
BEGIN
    -- Update '재즈 페스티벌 2025' from 2025-06-15 to 2026-12-15
    UPDATE concerts
    SET start_at = '2026-12-15 19:00:00+09'::timestamptz,
        updated_at = now()
    WHERE title = '재즈 페스티벌 2025'
      AND start_at < '2025-10-16 00:00:00+09'::timestamptz;

    -- Update '2025 펜타포트 락 페스티벌' from 2025-08-08 to 2027-08-08
    UPDATE concerts
    SET start_at = '2027-08-08 16:00:00+09'::timestamptz,
        updated_at = now()
    WHERE title = '2025 펜타포트 락 페스티벌'
      AND start_at < '2025-10-16 00:00:00+09'::timestamptz;

    -- Update '서울재즈페스티벌 2025' from 2025-09-20 to 2027-09-20
    UPDATE concerts
    SET start_at = '2027-09-20 18:00:00+09'::timestamptz,
        updated_at = now()
    WHERE title = '서울재즈페스티벌 2025'
      AND start_at < '2025-10-16 00:00:00+09'::timestamptz;

    -- Update '뮤지컬 레미제라블' from 2025-10-10 to 2027-10-10
    UPDATE concerts
    SET start_at = '2027-10-10 19:30:00+09'::timestamptz,
        updated_at = now()
    WHERE title = '뮤지컬 레미제라블'
      AND start_at < '2025-10-16 00:00:00+09'::timestamptz;

    -- Update '한여름밤의 클래식 - 서울시향 야외음악회' from 2025-07-25 to 2027-07-25
    UPDATE concerts
    SET start_at = '2027-07-25 19:30:00+09'::timestamptz,
        updated_at = now()
    WHERE title = '한여름밤의 클래식 - 서울시향 야외음악회'
      AND start_at < '2025-10-16 00:00:00+09'::timestamptz;

    RAISE NOTICE 'Updated concert dates for old concerts to 2026-12 ~ 2027-12';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating concert dates: %', SQLERRM;
        RAISE;
END $$;

