# 콘서트 상세 페이지 모듈 설계

## 개요
- `src/app/concerts/[concertId]/page.tsx` : Promise 기반 params를 사용하는 App Router 엔트리 포인트. React Query Provider 환경에서 상세 페이지 셸을 마운트한다.
- `src/features/concert-detail/backend/schema.ts` : 콘서트 상세/좌석 등급 조회 및 에러 응답을 위한 zod 스키마 정의.
- `src/features/concert-detail/backend/service.ts` : Supabase 트랜잭션 없이 읽기 전용으로 concerts, seat_classes를 조인·가공하는 서비스 계층.
- `src/features/concert-detail/backend/route.ts` : `GET /concerts/:concertId` 라우터 등록 및 표준 응답 포맷 적용.
- `src/features/concert-detail/lib/dto.ts` : FE에서 사용할 타입, 포맷터, seat class 요약 변환 로직을 재노출.
- `src/features/concert-detail/hooks/useConcertDetailQuery.ts` : `@tanstack/react-query` 기반 클라이언트 훅. `@/lib/remote/api-client`를 통해 API 호출 후 스키마 검증.
- `src/features/concert-detail/components/ConcertDetailPageShell.tsx` : 페이지 상단 컨테이너. 로딩/에러/정상 상태 제어 및 하위 컴포넌트 조립.
- `src/features/concert-detail/components/ConcertHero.tsx` : 포스터, 기본 정보, 상태 배지 노출.
- `src/features/concert-detail/components/SeatClassSummaryTable.tsx` : 좌석 등급/가격/잔여석 테이블과 스켈레톤.
- `src/features/concert-detail/components/ReservationCtaCard.tsx` : 예약 가능 여부 판단 후 CTAs 및 비활성 메시지 표시.
- `src/features/concert-detail/constants/index.ts` : 좌석 등급 표시 라벨, 안내 문구 상수 정의.
- `tests/features/concert-detail/backend/service.test.ts` : 서비스 레이어 유닛 테스트. Supabase client stub으로 데이터 정합성 검증.

## Diagram
```mermaid
graph TD
  A[App Router<br/>concerts/[concertId]/page] --> B[ConcertDetailPageShell]
  B --> C[useConcertDetailQuery]
  C --> D[API Client<br/>GET /concerts/:id]
  D --> E[Backend Route]
  E --> F[Service
    + Supabase 조회]
  F --> G[Schema DTO 변환]
  B --> H[ConcertHero]
  B --> I[SeatClassSummaryTable]
  B --> J[ReservationCtaCard]
  G -.재노출.-> C
  G -.재노출.-> H
  G -.재노출.-> I
  G -.재노출.-> J
```

## Implementation Plan

### 1. App Router (`src/app/concerts/[concertId]/page.tsx`)
1. 페이지 컴포넌트 상단에 `"use client"` 선언.
2. `params`를 Promise 형태로 받고 `await` 처리 후 `concertId`를 추출.
3. React Query `useSuspenseQuery` 대신 로딩 상태 핸들링이 필요한 경우 Suspense/Fallback을 활용하거나 내부 컴포넌트에서 처리하도록 `ConcertDetailPageShell`에 전달.
4. Hydration 이슈를 피하기 위해 `fallbackPosterUrl` 등은 상수로 관리하고, metadata는 추후 연동을 고려한 TODO 코멘트만 남긴다.

### 2. Backend 스키마 및 서비스
1. `schema.ts`
   - Params: `concertId`를 `z.string().uuid()`로 검증.
   - Response: concert, seatClasses, derived status(예: `isReservable`, `isEnded`)를 포함하는 객체 스키마 정의.
   - 오류 스키마: `INVALID_CONCERT_ID`, `CONCERT_INACTIVE`, `CONCERT_NOT_FOUND` 등을 union 처리.
2. `service.ts`
   - Supabase client를 주입 받아 concerts/seat_classes를 단일 쿼리(두 번 호출 및 조합)로 조회.
   - 공연 활성, 시작 시각 비교(`date-fns` 사용)로 `isReservable` 계산.
   - availableSeats 최소 0 보장 로직과 SeatClass display order 정렬.
   - 결과를 DTO로 매핑하고 zod로 최종 검증.
   - 실패 시 `failure(...)` 헬퍼로 표준 에러 반환.
3. `route.ts`
   - `registerConcertDetailRoutes(app)`를 정의하고 `registerExampleRoutes`와 동일한 패턴으로 app에 조립.
   - Params 파싱 실패 → 400, 서비스 에러 코드 → 적절한 status로 전달.
   - Hono context에서 logger로 오류 로깅.
4. `src/backend/hono/app.ts`에서 `registerConcertDetailRoutes`를 app에 추가.
5. Unit Test (`tests/features/concert-detail/backend/service.test.ts`)
   - Supabase client mock: `.from().select().eq().maybeSingle()` 체인을 stub.
   - 정상 시 좌석 등급 정렬/파생 필드 확인.
   - 비활성 공연, 좌석 잔여 오류 등 케이스 검증.

### 3. 클라이언트 DTO & Hook
1. `lib/dto.ts`
   - Backend response 스키마 재노출, TypeScript 타입 alias 제공.
   - 금액, 시간 포매터(`date-fns`, Intl.NumberFormat) 유틸 함수 추가.
2. `hooks/useConcertDetailQuery.ts`
   - `useQuery` 사용, key는 `['concertDetail', concertId]`.
   - `apiClient.get` 호출 후 `ConcertDetailResponseSchema`로 안전하게 parse.
   - 오류 시 `extractApiErrorMessage`로 메시지 구성, caller가 사용할 수 있도록 throw 하지 말고 Error 객체 반환 패턴 유지.
   - 재시도 전략: 1회 재시도, 404/410 시에는 재시도 비활성화.

### 4. 프레젠테이션 컴포넌트
1. `ConcertDetailPageShell`
   - 로딩: SeatClassSummaryTable에서 skeleton prop 제공.
   - 에러: 공통 오류 배너(필요 시 `shadcn` Alert 재사용).
   - 성공: Hero, Summary, CTA 구성.
   - React Query 결과 상태를 기반으로 조건부 렌더링.
2. `ConcertHero`
   - 포스터 이미지는 `https://picsum.photos/seed/${concertId}/960/540` 기본값.
   - `isReservable`, `isActive`, `isEnded`를 기준으로 배지 색상 결정.
   - 일정 포맷은 `date-fns/format` 사용.
3. `SeatClassSummaryTable`
   - `shadcn` Table 컴포넌트 활용 여부 검토. 기존에 없다면 설치 지침을 문서화.
   - 잔여석 0일 때 비활성 스타일.
   - Skeleton 상태에서 가짜 행 3~4개 노출.
4. `ReservationCtaCard`
   - 예약 가능 조건(활성 + 미래 일정 + 잔여석 > 0) 판단.
   - Button click → `seat selection` 라우팅(`/concerts/${id}/seats`). `next/navigation` 사용.
   - 비활성 사유 안내 텍스트 유지.
5. QA Sheet (Presentation)
   - [ ] 로딩 상태에서 Hero/CTA 비노출, Skeleton 표시 확인.
   - [ ] 공연 비활성일 때 CTA 비활성 및 안내 카피 검증.
   - [ ] 공연 종료 상태 배지(`종료된 공연`) 표기 및 버튼 숨김 확인.
   - [ ] 좌석 등급이 하나도 없을 때 Empty 상태 안내 배치 확인.
   - [ ] 예약 가능 시 CTA 클릭 → 좌석 선택 페이지 이동 확인.

### 5. 상수 및 유틸
1. `constants/index.ts`
   - 좌석 등급 표시 텍스트, 예: `{ grade: 'VIP', label: 'VIP석' }` 매핑.
   - 에러 메시지 copy, 빈 상태 문구 상수화.
2. `lib/formatters.ts` (필요 시 dto 내부)
   - 통화 포맷 함수 `formatWon`, 일정 포맷 `formatConcertDateTime` 정의.

### 6. 통합 고려사항
1. React Query 캐시 무효화: 좌석 선택/예약 성공 후 `concertDetail` 쿼리 refetch 트리거를 좌석 선택 flow에서 호출할 수 있도록 export.
2. 로깅: 페이지 마운트 시 optional analytics hook 자리만 할당 (`TODO:` 주석 처리).
3. 접근성: 이미지 alt, 테이블 caption, 버튼 aria-disabled 적용.
4. SEO: 추후 server components로 전환할 수 있도록 API 응답 타입 안정화.

### 7. 테스트 & 검증
- Unit Test: `service.test.ts`에 날짜 비교, 잔여석 합산, 에러 분기 검증.
- QA 시나리오: 위 QA Sheet 기반 수동 테스트 + Storybook 도입 고려(추후 TODO).
- 통합 테스트(추후): Playwright 시나리오 초안 작성하여 좌석 선택 전 환류 확인.

### 8. 문서 & 후속 작업
- README 혹은 `/docs/page002/plan.md` 하단에 shadcn table 설치 명령 필요 시 추가(현 계획상 Table 컴포넌트 사용 시).
- 좌석 선택 페이지와의 연동 규약(쿼리 파라미터, pathname)을 `/docs/page003/spec.md`에 반영 검토.


