export const CONCERT_DETAIL_MESSAGES = {
  LOADING: "공연 정보를 불러오는 중입니다...",
  ERROR_NOT_FOUND: "공연을 찾을 수 없습니다.",
  ERROR_GENERIC: "공연 정보를 불러오는데 실패했습니다.",
  INACTIVE: "현재 예약할 수 없는 공연입니다.",
  ENDED: "종료된 공연입니다.",
  SOLD_OUT: "매진되었습니다.",
  EMPTY_SEAT_CLASSES: "좌석 등급 정보가 없습니다.",
} as const;

export const CONCERT_STATUS_BADGE = {
  ACTIVE: "예약 가능",
  INACTIVE: "예약 불가",
  ENDED: "종료된 공연",
  SOLD_OUT: "매진",
} as const;

export const SEAT_CLASS_TABLE_HEADERS = {
  GRADE: "등급",
  PRICE: "가격",
  TOTAL_SEATS: "총 좌석",
  AVAILABLE_SEATS: "잔여 좌석",
} as const;

