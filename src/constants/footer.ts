export const POLICY_LINKS = [
  {
    label: '이용약관',
    href: '/docs/terms-of-service',
    slug: 'terms-of-service',
  },
  {
    label: '개인정보처리방침',
    href: '/docs/privacy-policy',
    slug: 'privacy-policy',
  },
] as const;

export const COMPANY_INFO = {
  name: 'SuperNext',
  description: '온라인 공연 예매 서비스',
} as const;

export const FOOTER_SECTIONS = {
  company: {
    title: '회사 정보',
    links: [
      { label: '회사 소개', href: '/about' },
      { label: '공지사항', href: '/notices' },
    ],
  },
  support: {
    title: '고객 지원',
    links: [
      { label: '자주 묻는 질문', href: '/faq' },
      { label: '고객센터', href: '/support' },
    ],
  },
  policy: {
    title: '약관 및 정책',
    links: POLICY_LINKS,
  },
} as const;

