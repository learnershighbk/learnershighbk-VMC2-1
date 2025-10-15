export const reservationMessages = {
  status: {
    reserved: '예약 완료',
    canceled: '예약 취소됨',
  },
  headline: {
    reserved: '예약이 완료되었습니다!',
    canceled: '예약이 취소되었습니다',
    error: '예약 정보를 불러올 수 없습니다',
  },
  description: {
    reserved: '예약이 성공적으로 완료되었습니다. 예약 코드를 확인하세요.',
    canceled: '이 예약은 취소되었습니다.',
    error: '예약 정보를 불러오는 중 오류가 발생했습니다.',
  },
  action: {
    goHome: '홈으로',
    viewReservations: '예약 조회',
    retry: '다시 시도',
    copyCode: '예약 코드 복사',
    copySuccess: '예약 코드가 복사되었습니다',
    copyError: '복사에 실패했습니다',
  },
  label: {
    reservationCode: '예약 코드',
    concertInfo: '공연 정보',
    concertTitle: '공연명',
    concertDate: '공연 일시',
    concertVenue: '공연 장소',
    seatInfo: '좌석 정보',
    seatCount: '좌석 수',
    totalPrice: '총 결제 금액',
    reservedAt: '예약 일시',
    canceledAt: '취소 일시',
  },
  error: {
    notFound: '예약을 찾을 수 없습니다',
    fetchFailed: '예약 정보를 불러올 수 없습니다',
    invalidId: '유효하지 않은 예약 ID입니다',
  },
  toast: {
    copySuccess: '예약 코드가 클립보드에 복사되었습니다',
    copyError: '클립보드 복사에 실패했습니다',
  },
} as const;

