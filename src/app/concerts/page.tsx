'use client';

import { useSearchParams } from 'next/navigation';
import { ConcertGrid } from '@/features/concerts/components/concert-grid';
import { useConcertListQuery } from '@/features/concerts/hooks/useConcertListQuery';
import { parseConcertListSearchParams } from '@/features/concerts/lib/query-params';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const ConcertsPage = () => {
  const searchParams = useSearchParams();
  const params = parseConcertListSearchParams(searchParams);
  const { toast } = useToast();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useConcertListQuery(params);

  useEffect(() => {
    if (isError && error) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: error.message ?? '공연 목록을 불러오지 못했습니다.',
      });
    }
  }, [isError, error, toast]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <h1 className="text-3xl font-bold">공연 목록</h1>
          <p className="text-muted-foreground mt-2">
            다양한 공연을 확인하고 예매하세요
          </p>
        </div>
      </div>
      
      <div className="container mx-auto max-w-7xl">
        <div className="py-8 px-4">
          <ConcertGrid
            concerts={data?.concerts ?? []}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={() => refetch()}
          />
        </div>

        {data && data.pagination.totalPages > 1 && (
          <div className="py-8 px-4 flex justify-center">
            <p className="text-sm text-muted-foreground">
              페이지 {data.pagination.page} / {data.pagination.totalPages}
              {' '}(전체 {data.pagination.total}개)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConcertsPage;

