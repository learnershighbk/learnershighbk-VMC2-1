## 좌석 선택 상태관리 (Context + useReducer 설계)

### 1. 관리 대상 상태 데이터
- **전역 문맥**: `concertId`, `performanceDateTime`, `layoutMode`, `seatMapVersion`
- **좌석 선택 정보**: `selectedSeats`, `focusedSeatId`, `activeFilters`, `seatGroupBySection`
- **구매자 정보**: `purchaser.phone`, `purchaser.password`, `validationErrors`, `agreementFlags`
- **요약 및 정산**: `pricingSummary.totalAmount`, `pricingSummary.breakdown`
- **비동기 흐름**: `asyncStatus.reserve`, `asyncStatus.cancel`, `realtimeStatus`
- **피드백/모달**: `toastQueue`, `modalState`

### 2. 상태가 아닌 표시 데이터
- React Query/Supabase로 수급되는 공연 상세, 좌석 등급, 좌석 배치 원본
- 파생 계산: `seatCount`, `selectedSeatIds`, 좌석 행렬 및 요약 문자열
- 포스터 이미지(URL), 공연 소개 문구 등 정적 콘텐츠
- 금액/일시 포맷팅 결과(`date-fns`, 통화 포매터)
- 에러 메시지 템플릿과 안내 문구

### 3. Context + useReducer 구조 개요
- **Provider 파일**: `src/features/reservation/state/seat-selection-context.tsx`
- **Reducer 파일**: `src/features/reservation/state/seat-selection-reducer.ts`
- **Context Hook**: `useSeatSelectionContext` → 내부에서 state, dispatch 반환
- **Selector Hook**: `useSeatSelectionSelector(selectorFn)` → 불필요한 리렌더 방지

```typescript
export interface SeatSelectionState {
  concertId: string | null;
  performanceDateTime: string | null;
  layoutMode: "web" | "mobile";
  seatMapVersion: number;
  selectedSeats: Record<string, SelectedSeat>;
  focusedSeatId: string | null;
  activeFilters: SeatFilter;
  seatGroupBySection: Record<string, string[]>;
  purchaser: {
    phone: string;
    password: string;
  };
  validationErrors: Partial<Record<PurchaserField, string>>;
  agreementFlags: {
    marketing: boolean;
    terms: boolean;
  };
  pricingSummary: {
    totalAmount: number;
    breakdown: Record<string, SeatClassSummary>;
  };
  asyncStatus: {
    reserve: AsyncPhase;
    cancel: AsyncPhase;
  };
  realtimeStatus: RealtimePhase;
  toastQueue: ToastPayload[];
  modalState: ModalPhase;
}
```

### 4. 데이터 로딩 & 상태 흐름 (시각화)
```
┌──────────────────────────────┐
│ SeatSelectionProvider        │
│ - useReducer(state, dispatch)│
│ - useEffect(fetch)           │
└───────────────┬──────────────┘
                │ 1. React Query 성공 시
                ▼
┌──────────────────────────────┐
│ dispatch({ type: HYDRATE })  │
└───────────────┬──────────────┘
                │ 2. 상태 업데이트
                ▼
┌──────────────────────────────┐
│ SeatSelectionState           │
│ (Context 내부 저장)         │
└───────────────┬──────────────┘
                │ 3. selector 사용
                ▼
┌──────────────────────────────┐
│ 하위 컴포넌트(View)         │
│ - SeatGrid / Summary / Form  │
│ - useSeatSelectionSelector   │
│ - dispatch(Action)           │
└───────────────┬──────────────┘
                │ 4. 사용자/실시간 입력
                ▼
┌──────────────────────────────┐
│ dispatch(Action)             │
└──────────────────────────────┘
```

### 5. Action 정의
| Type | Payload | 트리거 | 핵심 효과 |
|------|---------|--------|-----------|
| `HYDRATE_CONCERT` | `{ concertDetail, seatClasses, seats }` | React Query 데이터 수신 | 초기화 + `seatMapVersion` 설정 |
| `SET_LAYOUT_MODE` | `{ mode }` | `matchMedia` 변경 | 반응형 전환 |
| `TOGGLE_SEAT` | `{ seat }` | 좌석 선택/해제 | `selectedSeats`, `pricingSummary` 갱신 |
| `CLEAR_SELECTION` | 없음 | 예약 완료, 취소 | 선택 초기화 |
| `SET_PURCHASER_FIELD` | `{ field, value }` | 입력 변경 | 폼 상태 업데이트 |
| `SET_VALIDATION_ERROR` | `{ field, message }` | Zod 검증 실패 | 오류 메시지 저장 |
| `CLEAR_VALIDATION_ERRORS` | 없음 | 검증 성공 | 오류 초기화 |
| `SET_ASYNC_STATUS` | `{ operation, status }` | 예약/취소 뮤테이션 | 로딩/성공/실패 표시 |
| `ENQUEUE_TOAST` | `{ payload }` | 성공/실패 알림 | 토스트 추가 |
| `DEQUEUE_TOAST` | `{ id }` | 토스트 종료 | 큐에서 제거 |
| `REALTIME_SEAT_UPDATE` | `{ seatId, isReserved, version }` | Supabase 실시간 이벤트 | 좌석 상태 동기화 |
| `SET_REALTIME_STATUS` | `{ status }` | 실시간 연결 상태 | 배너/재시도 처리 |
| `APPLY_FILTERS` | `{ filters }` | 필터 변경 | `activeFilters` 갱신 |
| `RESET_FILTERS` | 없음 | 초기화 버튼 | 필터 초기화 |
| `OPEN_MODAL` | `{ phase }` | 예약 확인 등 | `modalState` 전환 |
| `CLOSE_MODAL` | 없음 | 모달 닫기 | `modalState` 초기화 |

### 6. Reducer 전이 규칙
- 모든 전이는 순수 함수로 작성, 기존 state를 복제 후 필요한 필드만 갱신
- `TOGGLE_SEAT`는 좌석 예약 가능 여부를 검증하고 `pricingSummary`를 동기화
- `REALTIME_SEAT_UPDATE`는 `seatMapVersion` 비교 후 최신 이벤트만 반영하며, 이미 선택된 좌석이 예약 완료되면 자동 해제 + 경고 토스트 dispatch
- `SET_ASYNC_STATUS`는 성공 시 `modalState` 전환, 실패 시 에러 토스트와 함께 상태 복원
- `SET_PURCHASER_FIELD`는 즉시 검증을 수행하고 실패 시 `SET_VALIDATION_ERROR`와 연동

### 7. Context 노출 인터페이스
- **state**: `SeatSelectionState`
- **dispatch**: `(action: SeatSelectionAction) => void`
- **utility hooks**
  - `useSeatSelectionSelector(selector: (state) => T)`
  - `useSeatSelectionDispatch()`
  - `useSeatSelectionState()` (직접 접근이 필요한 경우에만 사용)
- **파생 selector 예시**
  - `selectSeatCount(state) => number`
  - `selectTotalAmount(state) => number`
  - `selectSelectedSeatIds(state) => string[]`
  - `selectIsReserveDisabled(state) => boolean`
  - `selectRealtimeNotice(state) => RealtimeBannerModel`

### 8. 하위 컴포넌트 연결
- `SeatSelectionPage`
  - Provider로 트리 감싸기, React Query 결과를 useEffect로 감지하여 `HYDRATE_CONCERT` dispatch
- `SeatMapPanel`
  - 좌석 목록: React Query 데이터 기반
  - 선택 여부: `selectSelectedSeatIds`
  - 클릭 핸들러: `dispatch({ type: "TOGGLE_SEAT", payload: { seat } })`
- `SummaryPanel`
  - `selectTotalAmount`, `selectSeatCount`
  - 예약 버튼: `reserveSeatsMutation` 호출 전 `dispatch({ type: "SET_ASYNC_STATUS", ... })`
- `PurchaserForm`
  - 폼 필드: `selectPurchaserFields`
  - 입력 변경: `SET_PURCHASER_FIELD`
  - 검증 결과: `validationErrors`
- `RealtimeBanner`
  - `selectRealtimeNotice`
  - 재시도 버튼 클릭 시 `dispatch({ type: "SET_REALTIME_STATUS", ... })` 후 refetch
- `ToastHost`
  - `toastQueue` 구독, 토스트 닫기 시 `DEQUEUE_TOAST`

### 9. 데이터 흐름 요약 시나리오
1. **페이지 진입**: Provider 초기화 → React Query fetch 완료 → `HYDRATE_CONCERT`
2. **좌석 선택**: 사용자 클릭 → `TOGGLE_SEAT` → 상태 변경 → View 갱신
3. **예약 시도**: 폼 제출 → Zod 검증 → `SET_ASYNC_STATUS`(loading) → 뮤테이션 성공 시 `CLEAR_SELECTION` + `ENQUEUE_TOAST`
4. **실시간 업데이트**: Supabase 이벤트 → `REALTIME_SEAT_UPDATE` → 비정상 상태 시 토스트 안내
5. **반응형 전환**: viewport 변경 → `SET_LAYOUT_MODE` → 레이아웃별 selector 결과 갱신

### 10. 유지보수 가이드
- 액션 추가 시 `SeatSelectionAction` 유니온 타입 확장 후 reducer와 selector 업데이트
- 파생 selector는 순수 함수로 작성하고 memoization(`useMemo`, `useCallback`)을 활용해 성능 유지
- 테스트: reducer 유닛 테스트, Context 통합 테스트, Supabase 이벤트 시뮬레이션
- 확장: 필터 추가, 다중 공연 지원 시 `concertId` 기준으로 Provider를 중첩하거나, Zustand 등의 확장을 고려하기 전에 Context 구조를 재사용
