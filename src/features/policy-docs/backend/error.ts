export const policyDocumentErrorCodes = {
  NOT_FOUND: 'POLICY_DOCUMENT_NOT_FOUND',
  INACTIVE: 'POLICY_DOCUMENT_INACTIVE',
  UNKNOWN: 'POLICY_DOCUMENT_UNKNOWN_ERROR',
} as const;

export type PolicyDocumentErrorCode =
  (typeof policyDocumentErrorCodes)[keyof typeof policyDocumentErrorCodes];

export type PolicyDocumentServiceError = {
  code: PolicyDocumentErrorCode;
  message: string;
  statusCode: number;
};

export const policyDocumentErrorMessages: Record<
  PolicyDocumentErrorCode,
  string
> = {
  [policyDocumentErrorCodes.NOT_FOUND]:
    '요청하신 문서를 찾을 수 없습니다.',
  [policyDocumentErrorCodes.INACTIVE]:
    '해당 문서는 현재 비활성 상태입니다.',
  [policyDocumentErrorCodes.UNKNOWN]:
    '문서를 불러오는 중 알 수 없는 오류가 발생했습니다.',
};

