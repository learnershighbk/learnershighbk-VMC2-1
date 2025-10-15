import type { SeatSelectionState } from './types';

export const selectSeatCount = (state: SeatSelectionState): number =>
  Object.keys(state.selectedSeats).length;

export const selectTotalAmount = (state: SeatSelectionState): number =>
  state.pricingSummary.totalAmount;

export const selectSelectedSeatIds = (state: SeatSelectionState): string[] =>
  Object.keys(state.selectedSeats);

export const selectIsReserveDisabled = (state: SeatSelectionState): boolean =>
  selectSeatCount(state) === 0 ||
  Object.keys(state.validationErrors).length > 0 ||
  !state.purchaser.phoneNumber ||
  !state.purchaser.password ||
  !state.agreementFlags.terms ||
  state.asyncStatus.reserve === 'loading';

export const selectAvailableSeats = (state: SeatSelectionState) =>
  state.seats.filter((seat) => !seat.isReserved);

export const selectSeatsByClass = (state: SeatSelectionState, classId: string) =>
  state.seats.filter((seat) => seat.seatClassId === classId);

