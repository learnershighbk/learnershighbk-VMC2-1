'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SORT_LABELS, type SortKey } from '@/features/concerts/constants/sort';
import {
  buildConcertListQuery,
  parseConcertListSearchParams,
  type ConcertListQueryParams,
} from '@/features/concerts/lib/query-params';

export const HomeFilterBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentParams = parseConcertListSearchParams(searchParams);

  const updateParams = useCallback(
    (updates: Partial<ConcertListQueryParams>) => {
      const newParams: ConcertListQueryParams = {
        ...currentParams,
        ...updates,
        page: updates.page ?? 1,
      };

      const queryString = buildConcertListQuery(newParams).toString();
      router.push(`/home${queryString ? `?${queryString}` : ''}`);
    },
    [currentParams, router],
  );

  const handleSortChange = (value: string) => {
    updateParams({ sort: value as SortKey });
  };

  const handleActiveFilterChange = (value: boolean | undefined) => {
    updateParams({ isActive: value });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between py-6 px-4 bg-card border-y">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full sm:w-auto">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor="sort-select" className="text-sm font-medium whitespace-nowrap">
            정렬
          </label>
          <Select value={currentParams.sort} onValueChange={handleSortChange}>
            <SelectTrigger id="sort-select" className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SORT_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant={currentParams.isActive === undefined ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleActiveFilterChange(undefined)}
            className="flex-1 sm:flex-none"
          >
            전체
          </Button>
          <Button
            variant={currentParams.isActive === true ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleActiveFilterChange(true)}
            className="flex-1 sm:flex-none"
          >
            판매중
          </Button>
          <Button
            variant={currentParams.isActive === false ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleActiveFilterChange(false)}
            className="flex-1 sm:flex-none"
          >
            판매중지
          </Button>
        </div>
      </div>
    </div>
  );
};

