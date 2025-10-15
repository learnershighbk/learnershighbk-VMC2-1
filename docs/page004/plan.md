## 개요
- `src/features/reservations/backend/schema.ts`: 예약 상세 조회의 params, response, error 스키마를 정의하고 타입을 재사용할 수 있게 공개합니다.
- `src/features/reservations/backend/service.ts`: Supabase에서 `reservations`, `reservation_seats`, `concerts`, `seat_classes`를 조합해 비즈니스 규칙을 적용한 요약 데이터를 생성합니다.
- `src/features/reservations/backend/error.ts`: 예약 상세 조회에 사용되는 표준 에러 코드와 메시지 맵을 정의합니다.
- `src/features/reservations/backend/route.ts`: `GET /reservations/:id` 라우터를 등록하여 스키마 검증과 표준 응답 포맷을 적용합니다.
- `src/features/reservations/lib/dto.ts`: 백엔드 스키마를 재노출하고 프런트엔드 표시용 포매터, 좌석 라벨 빌더를 제공합니다.
- `src/features/reservations/constants/messages.ts`: 상태별 문구, 버튼 레이블, 에러 안내 카피를 상수로 관리합니다.
- `src/features/reservations/hooks/useReservationDetailQuery.ts`: `@tanstack/react-query`를 통해 API를 호출하고 성공/실패 상태를 관리합니다.
- `src/features/reservations/components/reservation-complete-page-shell.tsx`: 예약 완료 페이지의 로딩/성공/에러 상태를 통합 제어합니다.
- `src/features/reservations/components/reservation-summary-card.tsx`: 공연 정보, 예약 상태, 좌석 리스트, 결제 요약을 표시합니다.
- `src/features/reservations/components/reservation-actions.tsx`: 홈/예약 조회 이동 버튼과 재시도, 공유/복사 액션을 제공합니다.
- `src/features/reservations/components/reservation-status-banner.tsx`: 예약 상태에 따른 배너(예약 완료/취소됨/오류)를 노출합니다.
- `src/features/reservations/components/reservation-copy-button.tsx`: 예약 코드/요약 정보를 클립보드로 복사하는 재사용 가능한 버튼을 제공합니다.
- `src/app/reservations/[reservationId]/page.tsx`: Promise 기반 params를 사용하는 App Router 엔트리 포인트로 React Query 환경에서 페이지 셸을 마운트합니다.
- `tests/features/reservations/backend/service.test.ts`: 서비스 레이어의 유닛 테스트로 상태 검증과 파생 데이터 계산을 확인합니다.

## Diagram
```mermaid
graph TD
  A[app/reservations/[reservationId]/page.tsx] --> B[ReservationCompletePageShell]
  B --> C[useReservationDetailQuery]
  C --> D[apiClient\nGET /reservations/:id]
  D --> E[backend route.ts]
  E --> F[service.ts]
  F --> G[schema.ts]
  F --> H[Supabase
reservations + concerts]
  G -.types.-> C
  G -.types.-> I[reservation-summary-card]
  B --> I
  B --> J[reservation-status-banner]
  B --> K[reservation-actions]
  K --> L[reservation-copy-button]
  K --> M[next/navigation\n라우팅]
  I --> N[messages.ts\nformatted strings]
  F --> O[dto.ts\nformatters]
  O -.formatters.-> I
  O -.formatters.-> K
```

## Implementation Plan
### Backend
1. `src/features/reservations/backend/schema.ts`
   - `ReservationParamsSchema`를 `z.object({ id: z.string().uuid() })`로 정의합니다.
   - `ReservationSeatSchema`, `ReservationSummarySchema`, `ReservationDetailResponseSchema`를 구성하고 개인정보 제외 필드를 명시합니다.
   - `ReservationStatusSchema`는 `'reserved' | 'canceled'` union을 사용하며 취소 사유 필드(optional)를 포함합니다.
   - Unit Test: `schema.test.ts`에서 uuid 검증, status 값 validation, 좌석 리스트 비어있는 케이스를 검증합니다.
2. `src/features/reservations/backend/error.ts`
   - `reservationErrorCodes` 상수(`INVALID_RESERVATION_ID`, `RESERVATION_NOT_FOUND`, `RESERVATION_NOT_ACTIVE`, `RESERVATION_FETCH_FAILED`)를 정의합니다.
   - 각 코드별 기본 메시지를 매핑하는 객체와 TypeScript 타입을 export합니다.
3. `src/features/reservations/backend/service.ts`
   - `getReservationDetail(supabase, id)` 함수에서 트랜잭션 없이 `reservations` 단건 조회 후 예약 상태가 `reserved`인지 확인합니다.
   - 필요한 경우 `concerts`, `reservation_seats`, `seat_classes`를 추가 쿼리하여 날짜(`date-fns/format`), 좌석 라벨, 총액 합계를 계산합니다.
   - 취소된 예약 접근 시 `RESERVATION_NOT_ACTIVE` 에러, 존재하지 않을 때 `RESERVATION_NOT_FOUND`를 반환합니다.
   - 성공 시 `ReservationDetailResponseSchema.parse`로 결과를 검증하고 `success()`로 래핑합니다.
   - Unit Test: Supabase client mock을 통해 `reserved`/`canceled`/미존재/쿼리 실패 시나리오를 검증하고 좌석 합계, 공연 정보 매핑을 확인합니다 (`tests/features/reservations/backend/service.test.ts`).
4. `src/features/reservations/backend/route.ts`
   - `registerReservationRoutes(app)`를 정의해 `app.get('/reservations/:id')` 핸들러에서 params를 스키마로 검증합니다.
   - 서비스 호출 결과를 그대로 `respond()`로 반환하며, validation 실패 시 400, 기타 에러는 서비스 레이어 상태 코드를 전달합니다.
   - 로거(`getLogger`)로 `RESERVATION_FETCH_FAILED` 상황을 기록합니다.
5. `src/backend/hono/app.ts`
   - `registerReservationRoutes`를 import하여 기존 `registerExampleRoutes` 다음에 등록합니다.

### Shared / Lib
6. `src/features/reservations/lib/dto.ts`
   - 백엔드 스키마 타입(`ReservationDetailResponse`, `ReservationSeat`)을 재노출합니다.
   - `buildSeatLabel({ section, row, number })`, `formatReservationDate(date)`, `formatReservationPrice(amount)` 포매터를 정의합니다 (`date-fns`, `Intl.NumberFormat` 사용).
   - Unit Test: 좌석 라벨 조합, 날짜 포맷, 통화 포맷을 검증합니다 (`dto.test.ts`).
7. `src/features/reservations/constants/messages.ts`
   - 상태별 헤드라인, CTA 레이블, 에러 안내 카피를 객체로 관리합니다.
   - 재사용할 토스트/다이얼로그 메시지를 상수화합니다.

### Frontend Hooks
8. `src/features/reservations/hooks/useReservationDetailQuery.ts`
   - `useQuery`로 `apiClient.get('/reservations/{id}')` 호출 후 `ReservationDetailResponseSchema.parse` 적용.
   - `extractApiErrorMessage`로 에러 메시지를 구성하고 404(`RESERVATION_NOT_FOUND`) 시 재시도를 비활성화합니다.
   - 성공 시 DTO 포맷터를 적용한 데이터를 반환합니다.
   - Unit Test: axios mock을 활용하여 성공/404/500 흐름과 재시도 옵션을 검증합니다 (`useReservationDetailQuery.test.ts`).

### Presentation Components
9. `src/features/reservations/components/reservation-complete-page-shell.tsx`
   - "use client" 상단 선언 후 로딩/에러/성공 상태를 분기합니다.
   - 로딩 시 skeleton, 에러 시 배너 및 재시도 버튼을 노출하고 성공 시 요약 카드와 액션을 렌더링합니다.
   - QA Sheet: [ ] 로딩 상태 skeleton 확인, [ ] 에러 배너 문구 및 재시도 버튼 동작, [ ] 성공 시 상태 배너/요약/액션이 모두 노출되는지 검증.
10. `src/features/reservations/components/reservation-status-banner.tsx`
    - 예약 상태(`reserved`/`canceled`) 및 에러 상태를 받아 색상/아이콘을 결정합니다 (`lucide-react` 아이콘 검토).
    - 취소 상태일 때 안내 문구와 홈/조회 버튼 유도 문구를 표시합니다.
    - QA Sheet: [ ] 예약 완료/취소/에러 상태별 시각적 구분, [ ] 스크린 리더 friendly role/aria-label 적용.
11. `src/features/reservations/components/reservation-summary-card.tsx`
    - 공연 정보(제목, 일정, 장소), 예약 코드, 좌석 리스트, 결제 금액을 카드 형태로 표시합니다.
    - 좌석 리스트는 `buildSeatLabel` 포매터와 잔여 좌석 합계를 사용하며, 개인정보는 노출하지 않습니다.
    - QA Sheet: [ ] 공연 메타 데이터 표시 정확도, [ ] 좌석 리스트 접근성(ul/li 구조) 확인, [ ] 총액 포매팅 검증.
12. `src/features/reservations/components/reservation-actions.tsx`
    - 홈, 예약 조회 페이지 이동 버튼과 공유/복사/재시도 버튼을 배치합니다.
    - `useReservationDetailQuery`의 refetch 함수를 prop으로 받아 재시도 동작을 연결합니다.
    - QA Sheet: [ ] 홈/조회 라우팅 동작, [ ] 재시도 버튼 호출, [ ] 공유/복사 툴팁 및 피드백 토스트 확인.
13. `src/features/reservations/components/reservation-copy-button.tsx`
    - Clipboard API를 활용해 예약 코드 또는 요약 텍스트를 복사하고 `useToast`로 성공/실패 메시지를 표시합니다.
    - 접근성을 위해 `aria-live` 피드백과 키보드 포커스를 고려합니다.
    - QA Sheet: [ ] 복사 성공/실패 메시지 검증, [ ] 키보드 접근성 확인, [ ] 다국어 대응 여지 TODO 확인.

### App Router
14. `src/app/reservations/[reservationId]/page.tsx`
    - 클라이언트 컴포넌트로 선언하고 `params` Promise를 `await`하여 `reservationId`를 추출합니다.
    - React Query Provider 컨텍스트 내에서 `ReservationCompletePageShell`을 렌더링하고 필요한 prop(쿼리 key)을 전달합니다.
    - 페이지 메타데이터는 추후 SEO 작업을 위한 TODO로 남깁니다.

### Testing & QA
15. `tests/features/reservations/backend/service.test.ts`
    - Supabase mock으로 앞서 정의한 시나리오를 검증하고 파생 값(총액, 좌석 수) 단언을 포함합니다.
16. QA 시트 통합
    - 위 컴포넌트별 QA 체크 항목을 `/docs/page004/spec.md` 기반으로 테스트 케이스화합니다.
    - 수동 테스트 시나리오: [ ] 예약 완료 정상 흐름, [ ] 취소된 예약 접근, [ ] 존재하지 않는 예약 ID, [ ] 네트워크 오류 후 재시도.
17. 추후 과제
    - 예약 조회 페이지 연동, 공유 기능(카카오톡 등) 확장, Storybook 도입 여부를 백로그로 기록합니다.
