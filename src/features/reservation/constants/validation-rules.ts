export const PHONE_REGEX = /^[0-9]{10,11}$/;
export const PASSWORD_REGEX = /^[0-9]{4}$/;

export const VALIDATION_MESSAGES = {
  phoneRequired: '전화번호를 입력해주세요',
  phoneInvalid: '10-11자리 숫자를 입력해주세요',
  passwordRequired: '비밀번호를 입력해주세요',
  passwordInvalid: '숫자 4자리를 입력해주세요',
  termsRequired: '약관에 동의해주세요',
  seatsRequired: '좌석을 선택해주세요',
  maxSeatsExceeded: '최대 4개까지 선택할 수 있습니다',
} as const;

