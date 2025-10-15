import type { SelectedSeat, PricingSummary } from '../lib/price-calculator';
import type { Seat, SeatClass, ConcertInfo } from '../lib/dto';

export type AsyncPhase = 'idle' | 'loading' | 'success' | 'error';
export type RealtimePhase = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';
export type ModalPhase = 'closed' | 'confirm' | 'processing' | 'success' | 'error';
export type PurchaserField = 'phoneNumber' | 'password' | 'terms';

export interface SeatFilter {
  seatClassId?: string;
  availableOnly: boolean;
}

export interface ToastPayload {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface SeatSelectionState {
  concertId: string | null;
  concertInfo: ConcertInfo | null;
  seatClasses: SeatClass[];
  seats: Seat[];
  layoutMode: 'web' | 'mobile';
  seatMapVersion: number;
  selectedSeats: Record<string, SelectedSeat>;
  focusedSeatId: string | null;
  activeFilters: SeatFilter;
  purchaser: {
    phoneNumber: string;
    password: string;
  };
  validationErrors: Partial<Record<PurchaserField, string>>;
  agreementFlags: {
    terms: boolean;
  };
  pricingSummary: PricingSummary;
  asyncStatus: {
    reserve: AsyncPhase;
    cancel: AsyncPhase;
  };
  realtimeStatus: RealtimePhase;
  toastQueue: ToastPayload[];
  modalState: ModalPhase;
}

export type SeatSelectionAction =
  | { type: 'HYDRATE_CONCERT'; payload: { concertInfo: ConcertInfo; seatClasses: SeatClass[]; seats: Seat[] } }
  | { type: 'SET_LAYOUT_MODE'; payload: { mode: 'web' | 'mobile' } }
  | { type: 'TOGGLE_SEAT'; payload: { seat: Seat } }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_PURCHASER_FIELD'; payload: { field: keyof SeatSelectionState['purchaser']; value: string } }
  | { type: 'SET_VALIDATION_ERROR'; payload: { field: PurchaserField; message: string } }
  | { type: 'CLEAR_VALIDATION_ERRORS' }
  | { type: 'SET_ASYNC_STATUS'; payload: { operation: keyof SeatSelectionState['asyncStatus']; status: AsyncPhase } }
  | { type: 'ENQUEUE_TOAST'; payload: ToastPayload }
  | { type: 'DEQUEUE_TOAST'; payload: { id: string } }
  | { type: 'REALTIME_SEAT_UPDATE'; payload: { seatId: string; isReserved: boolean; version: number } }
  | { type: 'SET_REALTIME_STATUS'; payload: { status: RealtimePhase } }
  | { type: 'APPLY_FILTERS'; payload: { filters: Partial<SeatFilter> } }
  | { type: 'RESET_FILTERS' }
  | { type: 'OPEN_MODAL'; payload: { phase: ModalPhase } }
  | { type: 'CLOSE_MODAL' }
  | { type: 'TOGGLE_TERMS'; payload: { checked: boolean } };

