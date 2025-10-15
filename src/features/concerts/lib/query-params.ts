import { ALLOWED_SORTS, DEFAULT_SORT, type SortKey } from '@/features/concerts/constants/sort';

export interface ConcertListQueryParams {
  sort?: SortKey;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export const parseConcertListSearchParams = (
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
): ConcertListQueryParams => {
  const getParam = (key: string): string | undefined => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key) ?? undefined;
    }
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const sortParam = getParam('sort');
  const sort = ALLOWED_SORTS.includes(sortParam as SortKey)
    ? (sortParam as SortKey)
    : DEFAULT_SORT;

  const isActiveParam = getParam('isActive');
  const isActive = isActiveParam === 'true' ? true : isActiveParam === 'false' ? false : undefined;

  const pageParam = getParam('page');
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;

  const pageSizeParam = getParam('pageSize');
  const pageSize = pageSizeParam
    ? Math.max(1, Math.min(100, parseInt(pageSizeParam, 10)))
    : 20;

  return {
    sort,
    isActive,
    page: isNaN(page) ? 1 : page,
    pageSize: isNaN(pageSize) ? 20 : pageSize,
  };
};

export const buildConcertListQuery = (
  params: ConcertListQueryParams,
): URLSearchParams => {
  const searchParams = new URLSearchParams();

  if (params.sort && params.sort !== DEFAULT_SORT) {
    searchParams.set('sort', params.sort);
  }

  if (params.isActive !== undefined) {
    searchParams.set('isActive', String(params.isActive));
  }

  if (params.page && params.page !== 1) {
    searchParams.set('page', String(params.page));
  }

  if (params.pageSize && params.pageSize !== 20) {
    searchParams.set('pageSize', String(params.pageSize));
  }

  return searchParams;
};

