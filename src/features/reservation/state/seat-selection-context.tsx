'use client';

import { createContext, useReducer, type ReactNode } from 'react';
import type { SeatSelectionState, SeatSelectionAction } from './types';
import { seatSelectionReducer, initialState } from './seat-selection-reducer';

interface SeatSelectionContextValue {
  state: SeatSelectionState;
  dispatch: React.Dispatch<SeatSelectionAction>;
}

export const SeatSelectionContext = createContext<SeatSelectionContextValue | null>(null);

interface SeatSelectionProviderProps {
  children: ReactNode;
  concertId: string;
}

export const SeatSelectionProvider = ({ children, concertId }: SeatSelectionProviderProps) => {
  const [state, dispatch] = useReducer(seatSelectionReducer, {
    ...initialState,
    concertId,
  });

  return (
    <SeatSelectionContext.Provider value={{ state, dispatch }}>
      {children}
    </SeatSelectionContext.Provider>
  );
};

