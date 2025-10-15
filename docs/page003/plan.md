# 좌석 선택 페이지 모듈 설계

## 개요

### Backend Modules
- `src/features/reservation/backend/schema.ts`: 좌석 조회/예약 생성 요청·응답 zod 스키마 및 타입 정의
- `src/features/reservation/backend/error.ts`: 예약 관련 에러 코드 상수 (좌석 충돌, 검증 실패, 재고 부족 등)
- `src/features/reservation/backend/service.ts`: Supabase 트랜잭션 기반 예약 생성, 좌석/등급 조회 비즈니스 로직
- `src/features/reservation/backend/route.ts`: `/concerts/:id/seats` 조회 및 `/reservations` 생성 Hono 라우터
- `src/features/reservation/backend/realtime.ts`: Supabase Realtime 채널 설정 유틸 (선택사항, FE에서 직접 구독)

### Frontend State Management
- `src/features/reservation/state/seat-selection-context.tsx`: Context Provider 및 초기화
- `src/features/reservation/state/seat-selection-reducer.ts`: useReducer 상태 전이 로직
- `src/features/reservation/state/types.ts`: State, Action 타입 정의
- `src/features/reservation/state/selectors.ts`: 파생 데이터 selector 함수

### Frontend Data Layer
- `src/features/reservation/lib/dto.ts`: Backend 스키마 재노출 및 클라이언트 모델 변환
- `src/features/reservation/hooks/useSeatDataQuery.ts`: 좌석 등급 및 좌석 조회 React Query
- `src/features/reservation/hooks/useReservationMutation.ts`: 예약 생성 Mutation
- `src/features/reservation/hooks/useRealtimeSeatUpdates.ts`: Supabase Realtime 구독 훅
- `src/features/reservation/hooks/useSeatSelection.ts`: Context 접근 wrapper 훅

### Frontend Presentation
- `src/features/reservation/components/SeatSelectionPageShell.tsx`: 페이지 전체 레이아웃 및 Provider 래핑
- `src/features/reservation/components/SeatMapPanel.tsx`: 좌석도 UI (등급별 그룹, 선택 상태 표시)
- `src/features/reservation/components/SeatClassLegend.tsx`: 등급별 색상 범례
- `src/features/reservation/components/SeatGridRow.tsx`: 좌석 행/열 렌더링 컴포넌트
- `src/features/reservation/components/SummaryPanel.tsx`: 선택 좌석 요약 및 가격 계산
- `src/features/reservation/components/PurchaserForm.tsx`: 전화번호/비밀번호 입력 폼
- `src/features/reservation/components/ReservationConfirmModal.tsx`: 예약 확인 모달
- `src/features/reservation/components/RealtimeBanner.tsx`: 실시간 연결 상태 배너
- `src/features/reservation/components/SeatAvailabilityBadge.tsx`: 좌석 상태별 배지

### Frontend Constants & Utils
- `src/features/reservation/constants/seat-limits.ts`: 최대 선택 수, 좌석 상태 enum
- `src/features/reservation/constants/validation-rules.ts`: 전화번호/비밀번호 규칙
- `src/features/reservation/lib/price-calculator.ts`: 가격 계산 및 요약 유틸
- `src/features/reservation/lib/seat-formatter.ts`: 좌석 표시 라벨 포맷터
- `src/features/reservation/lib/validation.ts`: zod 기반 폼 검증 스키마

### App Router
- `src/app/concerts/[concertId]/seats/page.tsx`: 좌석 선택 페이지 엔트리포인트

### Shared Utilities (재사용 고려)
- `src/lib/utils/transaction-helpers.ts`: Supabase 트랜잭션 래퍼 (공통)
- `src/lib/utils/phone-formatter.ts`: 전화번호 포맷/검증 (공통)
- `src/lib/utils/password-hash.ts`: 비밀번호 해싱 (bcrypt/argon2)

## Diagram

```mermaid
graph TB
  subgraph "App Router"
    PAGE[concerts/[id]/seats/page.tsx]
  end
  
  subgraph "Backend Layer"
    ROUTE[route.ts<br/>registerReservationRoutes]
    SERVICE[service.ts<br/>트랜잭션 로직]
    SCHEMA[schema.ts<br/>zod 스키마]
    ERROR[error.ts<br/>에러 코드]
    REALTIME_BE[realtime.ts<br/>채널 설정]
  end
  
  subgraph "State Management"
    CONTEXT[seat-selection-context.tsx<br/>Provider]
    REDUCER[seat-selection-reducer.ts<br/>상태 전이]
    TYPES[types.ts<br/>State/Action]
    SELECTORS[selectors.ts<br/>파생 데이터]
  end
  
  subgraph "Data Layer"
    DTO[dto.ts<br/>모델 변환]
    SEAT_QUERY[useSeatDataQuery<br/>좌석 조회]
    RESERVE_MUT[useReservationMutation<br/>예약 생성]
    REALTIME[useRealtimeSeatUpdates<br/>실시간 구독]
    HOOK[useSeatSelection<br/>Context 접근]
  end
  
  subgraph "Presentation"
    SHELL[SeatSelectionPageShell]
    MAP[SeatMapPanel]
    GRID[SeatGridRow]
    LEGEND[SeatClassLegend]
    SUMMARY[SummaryPanel]
    FORM[PurchaserForm]
    MODAL[ReservationConfirmModal]
    BANNER[RealtimeBanner]
  end
  
  subgraph "Constants & Utils"
    LIMITS[seat-limits.ts]
    RULES[validation-rules.ts]
    CALC[price-calculator.ts]
    FORMAT[seat-formatter.ts]
    VALID[validation.ts]
  end
  
  PAGE --> SHELL
  SHELL --> CONTEXT
  CONTEXT --> REDUCER
  CONTEXT --> TYPES
  CONTEXT --> SELECTORS
  
  SHELL --> SEAT_QUERY
  SHELL --> REALTIME
  SEAT_QUERY --> DTO
  DTO --> SCHEMA
  
  MAP --> HOOK
  SUMMARY --> HOOK
  FORM --> HOOK
  MODAL --> RESERVE_MUT
  BANNER --> HOOK
  
  SHELL --> MAP
  SHELL --> SUMMARY
  SHELL --> FORM
  SHELL --> MODAL
  SHELL --> BANNER
  MAP --> GRID
  MAP --> LEGEND
  
  HOOK --> CONTEXT
  REDUCER --> TYPES
  REDUCER --> CALC
  
  ROUTE --> SERVICE
  SERVICE --> SCHEMA
  SERVICE --> ERROR
  RESERVE_MUT --> ROUTE
  SEAT_QUERY --> ROUTE
  
  REDUCER --> VALID
  FORM --> VALID
  SUMMARY --> CALC
  GRID --> FORMAT
```

## Implementation Plan

### 1. Backend Layer

#### 1.1 `schema.ts`
- **SeatDataParamsSchema**: `concertId` uuid 검증
- **SeatClassSchema**: 좌석 등급 정보 (id, name, price, totalSeats, availableSeats, displayOrder)
- **SeatSchema**: 개별 좌석 정보 (id, seatClassId, sectionLabel, rowLabel, seatNumber, isReserved)
- **SeatDataResponseSchema**: `{ seatClasses: SeatClass[], seats: Seat[], concertInfo: {...} }`
- **CreateReservationRequestSchema**: 
  - `concertId`: uuid
  - `seatIds`: uuid array (최소 1개, 최대 정책 값)
  - `phoneNumber`: 숫자만, 10-11자리
  - `password`: 숫자 4자리
  - `expectedTotal`: number (검증용)
- **CreateReservationResponseSchema**: `{ reservationId: uuid, reservationCode: string, totalPrice: number }`
- **Unit Test**:
  - 좌석 선택 수량 경계값 (0개, 최대+1개)
  - 전화번호/비밀번호 형식 오류
  - seatIds 중복 값 처리

#### 1.2 `error.ts`
```typescript
export const reservationErrorCodes = {
  // 좌석 조회 관련
  concertNotFound: 'CONCERT_NOT_FOUND',
  concertInactive: 'CONCERT_INACTIVE',
  seatDataFetchError: 'SEAT_DATA_FETCH_ERROR',
  
  // 예약 생성 관련
  invalidSeatsSelection: 'INVALID_SEATS_SELECTION',
  seatsAlreadyReserved: 'SEATS_ALREADY_RESERVED',
  insufficientSeats: 'INSUFFICIENT_SEATS',
  priceMatchFailure: 'PRICE_MATCH_FAILURE',
  reservationCreateFailed: 'RESERVATION_CREATE_FAILED',
  
  // 검증 관련
  validationError: 'VALIDATION_ERROR',
} as const;
```

#### 1.3 `service.ts`
- **getSeatData(supabase, concertId)**:
  1. concerts 테이블에서 공연 조회 (isActive 확인)
  2. seat_classes 조회 (displayOrder 정렬)
  3. seats 조회 (좌석 상태 포함)
  4. 조인된 데이터를 DTO로 변환
  5. 실패 시 `failure()` 반환
  
- **createReservation(supabase, request)**:
  1. 트랜잭션 시작
  2. 선택 좌석들의 isReserved=false 검증 (FOR UPDATE 락)
  3. 좌석별 가격 계산 및 expectedTotal 비교
  4. seats.isReserved = true 업데이트
  5. seat_classes.availableSeats 차감
  6. reservations 레코드 생성 (password bcrypt 해싱)
  7. reservation_seats 매핑 생성
  8. 커밋 및 예약 정보 반환
  9. 충돌 시 롤백 후 `SEATS_ALREADY_RESERVED` 에러
  
- **Unit Test**:
  - Supabase mock으로 정상 예약 플로우
  - 동시 예약 충돌 시나리오 (이미 예약된 좌석)
  - 가격 불일치 오류
  - 재고 부족 오류 (availableSeats < 선택 수)

#### 1.4 `route.ts`
```typescript
export const registerReservationRoutes = (app: Hono<AppEnv>) => {
  // GET /concerts/:concertId/seats
  app.get('/concerts/:concertId/seats', async (c) => {
    // params 검증
    // getSeatData 호출
    // respond 반환
  });
  
  // POST /reservations
  app.post('/reservations', async (c) => {
    // body 검증
    // createReservation 호출
    // respond 반환
  });
};
```
- `src/backend/hono/app.ts`에 `registerReservationRoutes(app)` 등록
- **Integration Test**: Hono 테스트 클라이언트로 엔드포인트 검증

### 2. Frontend State Management

#### 2.1 `types.ts`
```typescript
export interface SeatSelectionState {
  concertId: string | null;
  performanceDateTime: string | null;
  layoutMode: 'web' | 'mobile';
  seatMapVersion: number;
  selectedSeats: Record<string, SelectedSeat>; // key: seatId
  focusedSeatId: string | null;
  activeFilters: SeatFilter;
  seatGroupBySection: Record<string, string[]>;
  purchaser: {
    phone: string;
    password: string;
  };
  validationErrors: Partial<Record<PurchaserField, string>>;
  agreementFlags: {
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

export type SeatSelectionAction =
  | { type: 'HYDRATE_CONCERT'; payload: { concertDetail, seatClasses, seats } }
  | { type: 'SET_LAYOUT_MODE'; payload: { mode } }
  | { type: 'TOGGLE_SEAT'; payload: { seat } }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_PURCHASER_FIELD'; payload: { field, value } }
  | { type: 'SET_VALIDATION_ERROR'; payload: { field, message } }
  | { type: 'CLEAR_VALIDATION_ERRORS' }
  | { type: 'SET_ASYNC_STATUS'; payload: { operation, status } }
  | { type: 'ENQUEUE_TOAST'; payload: ToastPayload }
  | { type: 'DEQUEUE_TOAST'; payload: { id } }
  | { type: 'REALTIME_SEAT_UPDATE'; payload: { seatId, isReserved, version } }
  | { type: 'SET_REALTIME_STATUS'; payload: { status } }
  | { type: 'APPLY_FILTERS'; payload: { filters } }
  | { type: 'RESET_FILTERS' }
  | { type: 'OPEN_MODAL'; payload: { phase } }
  | { type: 'CLOSE_MODAL' };
```

#### 2.2 `seat-selection-reducer.ts`
- 각 action별 순수 함수 전이
- `TOGGLE_SEAT`: 선택/해제, 수량 제한 검증, pricingSummary 재계산
- `REALTIME_SEAT_UPDATE`: seatMapVersion 비교, 선택된 좌석 충돌 시 자동 해제 + 토스트
- `SET_PURCHASER_FIELD`: 즉시 검증 실행
- **Unit Test**: 각 액션별 상태 전이 검증

#### 2.3 `seat-selection-context.tsx`
```typescript
export const SeatSelectionProvider = ({ children, concertId }) => {
  const [state, dispatch] = useReducer(seatSelectionReducer, initialState);
  
  // React Query 데이터 수신 시 HYDRATE_CONCERT dispatch
  useEffect(() => {
    if (seatData) {
      dispatch({ type: 'HYDRATE_CONCERT', payload: seatData });
    }
  }, [seatData]);
  
  return (
    <SeatSelectionContext.Provider value={{ state, dispatch }}>
      {children}
    </SeatSelectionContext.Provider>
  );
};
```

#### 2.4 `selectors.ts`
```typescript
export const selectSeatCount = (state: SeatSelectionState) => 
  Object.keys(state.selectedSeats).length;

export const selectTotalAmount = (state: SeatSelectionState) => 
  state.pricingSummary.totalAmount;

export const selectSelectedSeatIds = (state: SeatSelectionState) => 
  Object.keys(state.selectedSeats);

export const selectIsReserveDisabled = (state: SeatSelectionState) => 
  selectSeatCount(state) === 0 || 
  Object.keys(state.validationErrors).length > 0 ||
  !state.purchaser.phone ||
  !state.purchaser.password ||
  !state.agreementFlags.terms;
```

### 3. Frontend Data Layer

#### 3.1 `dto.ts`
- Backend 스키마 재노출
- `mapSeatToGridModel`: 좌석을 행/열 그룹으로 변환
- `mapSeatClassToLegendModel`: 등급별 색상 할당

#### 3.2 `useSeatDataQuery.ts`
```typescript
export const useSeatDataQuery = (concertId: string) => 
  useQuery({
    queryKey: ['seatData', concertId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/concerts/${concertId}/seats`);
      return SeatDataResponseSchema.parse(data);
    },
    enabled: Boolean(concertId),
    staleTime: 30 * 1000,
    refetchOnMount: true,
  });
```

#### 3.3 `useReservationMutation.ts`
```typescript
export const useReservationMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (request: CreateReservationRequest) => {
      const { data } = await apiClient.post('/api/reservations', request);
      return CreateReservationResponseSchema.parse(data);
    },
    onSuccess: (data, variables) => {
      // 좌석 데이터 무효화
      queryClient.invalidateQueries({ queryKey: ['seatData', variables.concertId] });
    },
  });
};
```

#### 3.4 `useRealtimeSeatUpdates.ts`
```typescript
export const useRealtimeSeatUpdates = (concertId: string, dispatch) => {
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel(`seats:${concertId}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'seats', filter: `concert_id=eq.${concertId}` },
        (payload) => {
          dispatch({
            type: 'REALTIME_SEAT_UPDATE',
            payload: {
              seatId: payload.new.id,
              isReserved: payload.new.is_reserved,
              version: Date.now(),
            },
          });
        }
      )
      .subscribe((status) => {
        dispatch({ type: 'SET_REALTIME_STATUS', payload: { status } });
      });
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [concertId, dispatch]);
};
```

#### 3.5 `useSeatSelection.ts`
```typescript
export const useSeatSelection = () => {
  const context = useContext(SeatSelectionContext);
  if (!context) throw new Error('useSeatSelection must be used within Provider');
  return context;
};

export const useSeatSelectionSelector = <T>(selector: (state: SeatSelectionState) => T): T => {
  const { state } = useSeatSelection();
  return useMemo(() => selector(state), [state, selector]);
};
```

### 4. Frontend Presentation

#### 4.1 `SeatSelectionPageShell.tsx`
```typescript
'use client';

export const SeatSelectionPageShell = ({ concertId }) => {
  const { data, isLoading, error } = useSeatDataQuery(concertId);
  
  return (
    <SeatSelectionProvider concertId={concertId}>
      {isLoading && <LoadingSkeleton />}
      {error && <ErrorBanner error={error} />}
      {data && (
        <>
          <SeatMapPanel />
          <SummaryPanel />
          <PurchaserForm />
          <ReservationConfirmModal />
          <RealtimeBanner />
        </>
      )}
    </SeatSelectionProvider>
  );
};
```

**QA Sheet**:
- [ ] 로딩 시 스켈레톤 표시 확인
- [ ] 에러 시 재시도 버튼 동작 검증
- [ ] 좌석 데이터 로드 후 UI 렌더링 확인

#### 4.2 `SeatMapPanel.tsx`
- 등급별로 좌석 그룹핑
- `TOGGLE_SEAT` dispatch로 선택 처리
- 선택된 좌석 하이라이트
- 예약된 좌석 비활성 표시

**QA Sheet**:
- [ ] 좌석 클릭 시 선택/해제 토글 확인
- [ ] 예약된 좌석 클릭 불가 확인
- [ ] 최대 선택 수 초과 시 토스트 표시
- [ ] 키보드 네비게이션 (Tab, Enter) 동작
- [ ] 선택 좌석 색상 구분 명확성

#### 4.3 `SummaryPanel.tsx`
- `selectTotalAmount`, `selectSeatCount` 사용
- 등급별 breakdown 표시
- 예약하기 버튼 (disabled 조건 적용)

**QA Sheet**:
- [ ] 좌석 선택 시 실시간 가격 합계 갱신
- [ ] 선택 좌석 0개 시 버튼 비활성
- [ ] 필수 입력 미완료 시 버튼 비활성

#### 4.4 `PurchaserForm.tsx`
- react-hook-form + zod 검증
- `SET_PURCHASER_FIELD` dispatch
- 실시간 에러 메시지 표시

**QA Sheet**:
- [ ] 전화번호 숫자만 입력 허용
- [ ] 비밀번호 4자리 제한
- [ ] 약관 동의 체크박스 필수
- [ ] 포커스 이동 및 에러 메시지 위치

#### 4.5 `ReservationConfirmModal.tsx`
- 예약 정보 요약
- `useReservationMutation` 호출
- 성공 시 예약 완료 페이지 이동

**QA Sheet**:
- [ ] 모달 열림/닫힘 애니메이션
- [ ] 예약 중 로딩 상태 표시
- [ ] 성공 시 페이지 이동 확인
- [ ] 실패 시 에러 토스트 및 모달 유지

#### 4.6 `RealtimeBanner.tsx`
- 실시간 연결 상태별 배너 표시
- 연결 끊김 시 재연결 안내

**QA Sheet**:
- [ ] 연결 끊김 시 배너 표시
- [ ] 재연결 성공 시 배너 자동 숨김
- [ ] 재시도 버튼 동작 확인

### 5. Constants & Utils

#### 5.1 `seat-limits.ts`
```typescript
export const SEAT_LIMITS = {
  MAX_SELECTION: 4,
  MIN_SELECTION: 1,
} as const;

export enum SeatStatus {
  AVAILABLE = 'available',
  SELECTED = 'selected',
  RESERVED = 'reserved',
}
```

#### 5.2 `validation-rules.ts`
```typescript
export const PHONE_REGEX = /^[0-9]{10,11}$/;
export const PASSWORD_REGEX = /^[0-9]{4}$/;

export const VALIDATION_MESSAGES = {
  phoneRequired: '전화번호를 입력해주세요',
  phoneInvalid: '10-11자리 숫자를 입력해주세요',
  passwordRequired: '비밀번호를 입력해주세요',
  passwordInvalid: '숫자 4자리를 입력해주세요',
  termsRequired: '약관에 동의해주세요',
};
```

#### 5.3 `price-calculator.ts`
```typescript
export const calculatePricingSummary = (
  selectedSeats: Record<string, SelectedSeat>,
  seatClasses: SeatClass[]
): PricingSummary => {
  const breakdown: Record<string, SeatClassSummary> = {};
  let totalAmount = 0;
  
  Object.values(selectedSeats).forEach(seat => {
    const seatClass = seatClasses.find(sc => sc.id === seat.seatClassId);
    if (!seatClass) return;
    
    if (!breakdown[seatClass.id]) {
      breakdown[seatClass.id] = {
        name: seatClass.name,
        price: seatClass.price,
        count: 0,
        subtotal: 0,
      };
    }
    
    breakdown[seatClass.id].count += 1;
    breakdown[seatClass.id].subtotal += seatClass.price;
    totalAmount += seatClass.price;
  });
  
  return { totalAmount, breakdown };
};
```

**Unit Test**: 등급별 계산, 빈 선택 처리

#### 5.4 `seat-formatter.ts`
```typescript
export const formatSeatLabel = (seat: Seat): string => 
  `${seat.rowLabel}열 ${seat.seatNumber}번`;

export const formatSeatWithClass = (seat: Seat, seatClass: SeatClass): string => 
  `${seatClass.name} - ${formatSeatLabel(seat)}`;
```

#### 5.5 `validation.ts`
```typescript
export const PurchaserFormSchema = z.object({
  phoneNumber: z.string().regex(PHONE_REGEX, VALIDATION_MESSAGES.phoneInvalid),
  password: z.string().regex(PASSWORD_REGEX, VALIDATION_MESSAGES.passwordInvalid),
  terms: z.boolean().refine(val => val === true, VALIDATION_MESSAGES.termsRequired),
});
```

### 6. App Router

#### 6.1 `concerts/[concertId]/seats/page.tsx`
```typescript
'use client';

export default async function SeatSelectionPage({
  params,
}: {
  params: Promise<{ concertId: string }>;
}) {
  const { concertId } = await params;
  
  return <SeatSelectionPageShell concertId={concertId} />;
}
```

**QA Sheet**:
- [ ] URL 파라미터 정상 파싱
- [ ] 뒤로가기 시 상태 초기화
- [ ] 새로고침 시 데이터 재로딩

### 7. Shared Utilities

#### 7.1 `lib/utils/transaction-helpers.ts` (공통)
```typescript
export const withTransaction = async <T>(
  supabase: SupabaseClient,
  callback: (client: SupabaseClient) => Promise<T>
): Promise<T> => {
  // Supabase는 자동 트랜잭션을 지원하지 않으므로
  // 개별 쿼리에서 FOR UPDATE 락과 롤백 처리를 수동 구현
  return callback(supabase);
};
```

#### 7.2 `lib/utils/password-hash.ts` (공통)
```typescript
import bcrypt from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

### 8. Testing Strategy

#### Backend Unit Tests
- `service.test.ts`:
  - [ ] 좌석 조회 성공 시나리오
  - [ ] 비활성 공연 오류
  - [ ] 예약 생성 정상 플로우
  - [ ] 동시 예약 충돌 (SEATS_ALREADY_RESERVED)
  - [ ] 가격 불일치 오류 (PRICE_MATCH_FAILURE)
  - [ ] 재고 부족 오류

#### Frontend Unit Tests
- `seat-selection-reducer.test.ts`:
  - [ ] TOGGLE_SEAT 액션 (선택/해제)
  - [ ] 최대 수량 초과 시 선택 불가
  - [ ] REALTIME_SEAT_UPDATE 시 충돌 좌석 자동 해제
  - [ ] 가격 요약 재계산
- `price-calculator.test.ts`:
  - [ ] 등급별 합계 정확성
  - [ ] 빈 선택 시 0원
- `selectors.test.ts`:
  - [ ] selectIsReserveDisabled 조건 검증

#### Integration Tests
- `tests/features/reservation/backend/route.test.ts`:
  - [ ] GET /concerts/:id/seats 성공 응답
  - [ ] POST /reservations 성공 및 트랜잭션 검증
  - [ ] 검증 실패 시 400 응답

#### E2E Tests (Playwright)
- `tests/e2e/seat-selection.spec.ts`:
  - [ ] 좌석 선택 및 예약 전체 플로우
  - [ ] 실시간 좌석 업데이트 시뮬레이션
  - [ ] 동시 예약 충돌 처리

### 9. 후속 작업 및 개선사항

1. **성능 최적화**:
   - 좌석 수가 많을 경우 가상 스크롤 적용
   - useMemo/useCallback 활용한 리렌더 최소화

2. **접근성**:
   - 좌석 그리드 키보드 네비게이션
   - 스크린 리더 라벨 추가
   - 색각 이상자를 위한 패턴/아이콘 추가

3. **UX 개선**:
   - 좌석 선택 애니메이션
   - 드래그로 다중 선택
   - 최적 좌석 추천 기능

4. **보안**:
   - Rate limiting (예약 생성 API)
   - CSRF 토큰
   - 비밀번호 해싱 강도 조정

5. **모니터링**:
   - 예약 실패율 추적
   - 실시간 연결 안정성 모니터링
   - 좌석 선택-예약 전환율 분석

