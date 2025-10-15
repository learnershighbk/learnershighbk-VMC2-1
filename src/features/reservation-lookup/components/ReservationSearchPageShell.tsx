'use client';

import { useState } from 'react';
import type { ReservationDetail, SearchReservationsRequest } from '../lib/dto';
import { useSearchReservations } from '../hooks/useSearchReservations';
import { ReservationSearchForm } from './ReservationSearchForm';
import { ReservationList } from './ReservationList';
import { EmptyReservationState } from './EmptyReservationState';

export const ReservationSearchPageShell = () => {
  const [searchResults, setSearchResults] = useState<ReservationDetail[] | null>(null);
  const searchMutation = useSearchReservations();

  const handleSearch = (formData: SearchReservationsRequest) => {
    searchMutation.mutate(formData, {
      onSuccess: (response) => {
        setSearchResults(response.reservations);
      },
    });
  };

  const handleUpdate = () => {
    setSearchResults(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">예약 조회</h1>
        <p className="text-gray-600">
          예약하신 전화번호와 비밀번호를 입력해주세요.
        </p>
      </div>

      <div className="space-y-8">
        <ReservationSearchForm 
          onSubmit={handleSearch}
          isLoading={searchMutation.isPending}
        />
        
        {searchMutation.isError && (
          <div className="p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
            <p className="text-sm">
              예약 조회에 실패했습니다. 입력하신 정보를 다시 확인해주세요.
            </p>
          </div>
        )}
        
        {searchResults !== null && (
          searchResults.length > 0 ? (
            <ReservationList 
              reservations={searchResults} 
              onUpdate={handleUpdate}
            />
          ) : (
            <EmptyReservationState />
          )
        )}
      </div>
    </div>
  );
};

