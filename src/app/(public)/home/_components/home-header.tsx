'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export const HomeHeader = () => {
  const router = useRouter();

  return (
    <section className="relative py-16 px-4 sm:py-20 md:py-24 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            콘서트 예약
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            원하는 공연을 선택하고 간편하게 좌석을 예약하세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/reservations/lookup')}
              className="w-full sm:w-auto"
            >
              예약 조회하기
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

