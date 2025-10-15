'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReservationLookupRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/reservations/search');
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <p className="text-gray-600">예약 조회 페이지로 이동 중...</p>
      </div>
    </div>
  );
}

