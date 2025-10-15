'use client';

import { useContext, useMemo } from 'react';
import { SeatSelectionContext } from '../state/seat-selection-context';
import type { SeatSelectionState } from '../state/types';

export const useSeatSelection = () => {
  const context = useContext(SeatSelectionContext);
  if (!context) {
    throw new Error('useSeatSelection must be used within SeatSelectionProvider');
  }
  return context;
};

export const useSeatSelectionSelector = <T,>(
  selector: (state: SeatSelectionState) => T
): T => {
  const { state } = useSeatSelection();
  return useMemo(() => selector(state), [state, selector]);
};

