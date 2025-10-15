import type { SeatSelectionState, SeatSelectionAction } from './types';
import { calculatePricingSummary } from '../lib/price-calculator';
import { SEAT_LIMITS } from '../constants/seat-limits';

export const initialState: SeatSelectionState = {
  concertId: null,
  concertInfo: null,
  seatClasses: [],
  seats: [],
  layoutMode: 'web',
  seatMapVersion: 0,
  selectedSeats: {},
  focusedSeatId: null,
  activeFilters: {
    availableOnly: true,
  },
  purchaser: {
    phoneNumber: '',
    password: '',
  },
  validationErrors: {},
  agreementFlags: {
    terms: false,
  },
  pricingSummary: {
    totalAmount: 0,
    breakdown: {},
  },
  asyncStatus: {
    reserve: 'idle',
    cancel: 'idle',
  },
  realtimeStatus: 'idle',
  toastQueue: [],
  modalState: 'closed',
};

export const seatSelectionReducer = (
  state: SeatSelectionState,
  action: SeatSelectionAction
): SeatSelectionState => {
  switch (action.type) {
    case 'HYDRATE_CONCERT': {
      const { concertInfo, seatClasses, seats } = action.payload;
      return {
        ...state,
        concertId: concertInfo.id,
        concertInfo,
        seatClasses,
        seats,
        seatMapVersion: state.seatMapVersion + 1,
      };
    }

    case 'SET_LAYOUT_MODE': {
      return {
        ...state,
        layoutMode: action.payload.mode,
      };
    }

    case 'TOGGLE_SEAT': {
      const { seat } = action.payload;
      
      if (seat.isReserved) {
        return state;
      }

      const isCurrentlySelected = Boolean(state.selectedSeats[seat.id]);

      if (isCurrentlySelected) {
        const newSelectedSeats = { ...state.selectedSeats };
        delete newSelectedSeats[seat.id];
        const newPricingSummary = calculatePricingSummary(newSelectedSeats, state.seatClasses);

        return {
          ...state,
          selectedSeats: newSelectedSeats,
          pricingSummary: newPricingSummary,
        };
      }

      if (Object.keys(state.selectedSeats).length >= SEAT_LIMITS.MAX_SELECTION) {
        return {
          ...state,
          toastQueue: [
            ...state.toastQueue,
            {
              id: `toast-${Date.now()}`,
              type: 'warning',
              message: `최대 ${SEAT_LIMITS.MAX_SELECTION}개까지 선택할 수 있습니다`,
            },
          ],
        };
      }

      const newSelectedSeats = {
        ...state.selectedSeats,
        [seat.id]: {
          id: seat.id,
          seatClassId: seat.seatClassId,
          rowLabel: seat.rowLabel,
          seatNumber: seat.seatNumber,
          sectionLabel: seat.sectionLabel,
        },
      };

      const newPricingSummary = calculatePricingSummary(newSelectedSeats, state.seatClasses);

      return {
        ...state,
        selectedSeats: newSelectedSeats,
        pricingSummary: newPricingSummary,
      };
    }

    case 'CLEAR_SELECTION': {
      return {
        ...state,
        selectedSeats: {},
        pricingSummary: {
          totalAmount: 0,
          breakdown: {},
        },
      };
    }

    case 'SET_PURCHASER_FIELD': {
      return {
        ...state,
        purchaser: {
          ...state.purchaser,
          [action.payload.field]: action.payload.value,
        },
      };
    }

    case 'SET_VALIDATION_ERROR': {
      return {
        ...state,
        validationErrors: {
          ...state.validationErrors,
          [action.payload.field]: action.payload.message,
        },
      };
    }

    case 'CLEAR_VALIDATION_ERRORS': {
      return {
        ...state,
        validationErrors: {},
      };
    }

    case 'SET_ASYNC_STATUS': {
      return {
        ...state,
        asyncStatus: {
          ...state.asyncStatus,
          [action.payload.operation]: action.payload.status,
        },
      };
    }

    case 'ENQUEUE_TOAST': {
      return {
        ...state,
        toastQueue: [...state.toastQueue, action.payload],
      };
    }

    case 'DEQUEUE_TOAST': {
      return {
        ...state,
        toastQueue: state.toastQueue.filter((toast) => toast.id !== action.payload.id),
      };
    }

    case 'REALTIME_SEAT_UPDATE': {
      const { seatId, isReserved, version } = action.payload;

      const updatedSeats = state.seats.map((seat) =>
        seat.id === seatId ? { ...seat, isReserved } : seat
      );

      const wasSelected = Boolean(state.selectedSeats[seatId]);
      let newSelectedSeats = state.selectedSeats;
      let newToastQueue = state.toastQueue;

      if (wasSelected && isReserved) {
        newSelectedSeats = { ...state.selectedSeats };
        delete newSelectedSeats[seatId];
        newToastQueue = [
          ...state.toastQueue,
          {
            id: `toast-conflict-${Date.now()}`,
            type: 'warning',
            message: '선택한 좌석이 다른 사용자에 의해 예약되었습니다',
          },
        ];
      }

      const newPricingSummary = calculatePricingSummary(newSelectedSeats, state.seatClasses);

      return {
        ...state,
        seats: updatedSeats,
        selectedSeats: newSelectedSeats,
        pricingSummary: newPricingSummary,
        seatMapVersion: version,
        toastQueue: newToastQueue,
      };
    }

    case 'SET_REALTIME_STATUS': {
      return {
        ...state,
        realtimeStatus: action.payload.status,
      };
    }

    case 'APPLY_FILTERS': {
      return {
        ...state,
        activeFilters: {
          ...state.activeFilters,
          ...action.payload.filters,
        },
      };
    }

    case 'RESET_FILTERS': {
      return {
        ...state,
        activeFilters: {
          availableOnly: true,
        },
      };
    }

    case 'OPEN_MODAL': {
      return {
        ...state,
        modalState: action.payload.phase,
      };
    }

    case 'CLOSE_MODAL': {
      return {
        ...state,
        modalState: 'closed',
      };
    }

    case 'TOGGLE_TERMS': {
      return {
        ...state,
        agreementFlags: {
          ...state.agreementFlags,
          terms: action.payload.checked,
        },
      };
    }

    default:
      return state;
  }
};

