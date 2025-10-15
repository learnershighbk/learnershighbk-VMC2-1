'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { MESSAGES } from '../constants/messages';

export const EmptyReservationState = () => {
  return (
    <Card className="p-12 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="text-4xl">🔍</div>
        <h3 className="text-lg font-semibold text-gray-900">
          {MESSAGES.emptyReservations}
        </h3>
        <p className="text-sm text-gray-600">
          입력하신 정보와 일치하는 예약 내역을 찾을 수 없습니다.
        </p>
        <Button asChild className="mt-4">
          <Link href="/concerts">공연 둘러보기</Link>
        </Button>
      </div>
    </Card>
  );
};

