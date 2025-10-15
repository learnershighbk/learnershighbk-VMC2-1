-- 테스트 예약의 비밀번호 해시 수정
-- 비밀번호 '1234'의 정확한 bcrypt 해시로 업데이트

UPDATE reservations
SET password_hash = '$2b$10$sTcSHbBhGstDJqxiDwebIef.wSC5Ax22vF.OUz.tkQpWNosZWUa1G'
WHERE phone_number = '01012345678';

-- 수정 결과 확인
SELECT 
    phone_number,
    SUBSTRING(password_hash, 1, 30) as hash_preview,
    LENGTH(password_hash) as hash_length,
    updated_at
FROM reservations
WHERE phone_number = '01012345678';

