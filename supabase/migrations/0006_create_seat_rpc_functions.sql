-- RPC 함수: 좌석 재고 감소
CREATE OR REPLACE FUNCTION decrement_available_seats(
  class_id UUID,
  decrement_by INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE seat_classes
  SET 
    available_seats = available_seats - decrement_by,
    updated_at = NOW()
  WHERE id = class_id
    AND available_seats >= decrement_by;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient available seats or seat class not found';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- RPC 함수: 좌석 재고 증가
CREATE OR REPLACE FUNCTION increment_available_seats(
  class_id UUID,
  increment_by INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE seat_classes
  SET 
    available_seats = available_seats + increment_by,
    updated_at = NOW()
  WHERE id = class_id
    AND (available_seats + increment_by) <= total_seats;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot increment beyond total seats or seat class not found';
  END IF;
END;
$$ LANGUAGE plpgsql;

