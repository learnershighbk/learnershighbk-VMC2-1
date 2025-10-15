export const ALLOWED_SORTS = ['date_asc', 'date_desc', 'title_asc', 'title_desc'] as const;

export type SortKey = (typeof ALLOWED_SORTS)[number];

export const DEFAULT_SORT: SortKey = 'date_asc';

export const SORT_LABELS: Record<SortKey, string> = {
  date_asc: '공연일 빠른순',
  date_desc: '공연일 늦은순',
  title_asc: '제목 오름차순',
  title_desc: '제목 내림차순',
};

