# 콘서트 예약 데이터플로우

## 1. 간략 데이터플로우
- **홈 목록 조회**: 사용자가 홈 진입 시 `concerts` 테이블에서 공연 메타(포스터, 제목, 일정, 장소)를 읽고, 필요 시 `seat_classes` 집계 결과로 잔여석 요약을 표시한다.
- **콘서트 상세**: `concerts` 상세와 연결된 `seat_classes` 데이터를 조회하여 등급·가격·잔여좌석 정보를 보여준다.
- **좌석 선택 및 예약**: 좌석 선택 시 `seats` 테이블의 현재 예약 상태를 읽는다. 예약 제출 시 단일 트랜잭션으로 `seats` 상태를 `reserved`로 갱신하고, `seat_classes.available_seats`를 차감하며, `reservations` 및 `reservation_seats`에 기록한다.
- **예약 완료 노출**: 예약 식별자를 사용해 `reservations` 및 연관된 `reservation_seats` 데이터를 조회해 요약 정보를 표시한다.
- **예약 조회/취소**: 전화번호와 비밀번호 해시로 `reservations`를 조회한다. 취소 시 트랜잭션으로 `reservations.status`를 `canceled`로 바꾸고, `reservation_seats`를 따라 해당 `seats`를 해제하며 `seat_classes.available_seats`를 복구한다.

## 2. 데이터베이스 스키마 (PostgreSQL)

### 2.1 테이블 개요
| 테이블 | 목적 |
| --- | --- |
| `concerts` | 공연 기본정보 및 노출 제어 |
| `seat_classes` | 공연별 등급, 가격, 총좌석 및 잔여좌석 관리 |
| `seats` | 콘서트 좌석도(열/번)와 예약 상태 관리 |
| `reservations` | 예약 메타데이터(연락처, 상태, 금액, 식별자) 저장 |
| `reservation_seats` | 예약과 좌석 간 매핑 및 좌석 단가 스냅샷 |

### 2.2 컬럼 상세

#### `concerts`
| 컬럼 | 타입 | 제약 | 설명 |
| --- | --- | --- | --- |
| `id` | `uuid` | PK, 기본값 `gen_random_uuid()` | 공연 식별자 |
| `title` | `text` | NOT NULL | 공연명 |
| `description` | `text` |  | 공연 설명 |
| `start_at` | `timestamptz` | NOT NULL | 공연 시작 일시 |
| `venue_name` | `text` | NOT NULL | 공연 장소 |
| `poster_url` | `text` |  | 포스터 이미지 URL |
| `is_active` | `boolean` | NOT NULL, 기본값 `true` | 판매 중 여부 |
| `created_at` | `timestamptz` | NOT NULL, 기본값 `now()` | 생성 시각 |
| `updated_at` | `timestamptz` | NOT NULL, 기본값 `now()` | 자동 갱신 시각 |

#### `seat_classes`
| 컬럼 | 타입 | 제약 | 설명 |
| --- | --- | --- | --- |
| `id` | `uuid` | PK, 기본값 `gen_random_uuid()` | 좌석 등급 식별자 |
| `concert_id` | `uuid` | FK → `concerts.id` (ON DELETE CASCADE) | 공연 참조 |
| `name` | `text` | NOT NULL | 등급명 (예: VIP, R) |
| `price` | `integer` | NOT NULL, CHECK `price > 0` | 좌석 단가(원) |
| `total_seats` | `integer` | NOT NULL, CHECK `total_seats >= 0` | 등급 내 총좌석수 |
| `available_seats` | `integer` | NOT NULL, CHECK `available_seats >= 0 AND available_seats <= total_seats` | 현재 잔여좌석 |
| `display_order` | `integer` | NOT NULL, 기본값 `0` | UI 노출 순서 |
| `created_at` | `timestamptz` | NOT NULL, 기본값 `now()` | 생성 시각 |
| `updated_at` | `timestamptz` | NOT NULL, 기본값 `now()` | 자동 갱신 시각 |

#### `seats`
| 컬럼 | 타입 | 제약 | 설명 |
| --- | --- | --- | --- |
| `id` | `uuid` | PK, 기본값 `gen_random_uuid()` | 좌석 식별자 |
| `concert_id` | `uuid` | FK → `concerts.id` (ON DELETE CASCADE) | 공연 참조 |
| `seat_class_id` | `uuid` | FK → `seat_classes.id` (ON DELETE CASCADE) | 좌석 등급 참조 |
| `section_label` | `text` |  | 구역/층 정보 (선택) |
| `row_label` | `text` | NOT NULL | 열(행) 표시 |
| `seat_number` | `integer` | NOT NULL | 좌석 번호 |
| `is_reserved` | `boolean` | NOT NULL, 기본값 `false` | 예약 여부 |
| `created_at` | `timestamptz` | NOT NULL, 기본값 `now()` | 생성 시각 |
| `updated_at` | `timestamptz` | NOT NULL, 기본값 `now()` | 자동 갱신 시각 |

> 유니크: (`concert_id`, `row_label`, `seat_number`)로 좌석 중복을 방지한다.

#### `reservations`
| 컬럼 | 타입 | 제약 | 설명 |
| --- | --- | --- | --- |
| `id` | `uuid` | PK, 기본값 `gen_random_uuid()` | 예약 식별자 |
| `concert_id` | `uuid` | FK → `concerts.id` (ON DELETE RESTRICT) | 공연 참조 |
| `reservation_code` | `text` | NOT NULL, UNIQUE, 기본값 `upper(replace(gen_random_uuid()::text, '-', ''))` | 사용자 표시용 예약번호 |
| `phone_number` | `text` | NOT NULL | 인증에 사용되는 전화번호 |
| `password_hash` | `text` | NOT NULL | 4자리 비밀번호 해시 |
| `status` | `text` | NOT NULL, CHECK (`status` IN ('reserved', 'canceled')) | 예약 상태 |
| `total_price` | `integer` | NOT NULL, CHECK `total_price >= 0` | 총 결제 금액 |
| `reserved_at` | `timestamptz` | NOT NULL, 기본값 `now()` | 예약 생성 시각 |
| `canceled_at` | `timestamptz` |  | 예약 취소 시각 |
| `created_at` | `timestamptz` | NOT NULL, 기본값 `now()` | 행 생성 시각 |
| `updated_at` | `timestamptz` | NOT NULL, 기본값 `now()` | 자동 갱신 시각 |

인덱스 권장: (`phone_number`, `status`, `reserved_at`) 조합으로 조회 최적화.

#### `reservation_seats`
| 컬럼 | 타입 | 제약 | 설명 |
| --- | --- | --- | --- |
| `id` | `uuid` | PK, 기본값 `gen_random_uuid()` | 매핑 식별자 |
| `reservation_id` | `uuid` | FK → `reservations.id` (ON DELETE CASCADE) | 예약 참조 |
| `seat_id` | `uuid` | FK → `seats.id` (ON DELETE RESTRICT) | 좌석 참조 |
| `seat_label_snapshot` | `text` | NOT NULL | 예약 시점 좌석 표시(등급/열/번호) |
| `unit_price` | `integer` | NOT NULL, CHECK `unit_price >= 0` | 좌석 단가 스냅샷 |
| `is_active` | `boolean` | NOT NULL, 기본값 `true` | 예약이 유효한 좌석인지 여부 |
| `created_at` | `timestamptz` | NOT NULL, 기본값 `now()` | 생성 시각 |
| `updated_at` | `timestamptz` | NOT NULL, 기본값 `now()` | 자동 갱신 시각 |

> 제약: `UNIQUE (seat_id)` 인덱스를 `WHERE is_active` 조건과 함께 생성해 동일 좌석의 중복 활성 예약을 방지한다.

### 2.3 관계 요약
- `concerts` 1 → N `seat_classes`, `seats`, `reservations`
- `seat_classes` 1 → N `seats`
- `reservations` 1 → N `reservation_seats`
- `reservation_seats` N → 1 `seats`

## 3. 핵심 트랜잭션 플로우

### 3.1 예약 생성
1. 클라이언트가 선택한 좌석 목록과 사용자 입력(전화번호, 비밀번호, 예상 금액)을 서버에 전달한다.
2. 서버는 단일 트랜잭션으로 다음을 수행한다:
   - 모든 좌석에 대해 `seats.is_reserved = false`인지 확인한다.
   - 좌석들을 `is_reserved = true`로 갱신한다.
   - 등급별로 `seat_classes.available_seats`에서 선택 수량을 차감한다.
   - `reservations`에 예약 메타를 삽입하고, 연결 좌석은 `reservation_seats`에 기록한다.
3. 트랜잭션 성공 시 예약 코드와 요약 정보를 반환하고, 실패 시 모든 변경을 롤백한다.

### 3.2 예약 조회
1. 전화번호와 비밀번호 입력을 해시 비교해 `reservations`를 조회한다.
2. 필요한 경우 `reservation_seats` 및 `seats`, `seat_classes`를 조인해 상세 좌석 정보를 반환한다.
3. 결과는 최신 예약 우선 순서로 정렬한다.

### 3.3 예약 취소
1. 대상 예약이 `reserved` 상태인지 확인한다.
2. 단일 트랜잭션으로 다음을 수행한다:
   - `reservations.status`를 `canceled`로 변경하고 `canceled_at`을 기록한다.
   - 연결된 좌석(`reservation_seats`)을 순회해 `seats.is_reserved`를 `false`로 되돌린다.
   - `reservation_seats.is_active`를 `false`로 갱신한다.
   - 등급별로 취소 좌석 수만큼 `seat_classes.available_seats`를 복구한다.
3. 성공 시 갱신된 예약 정보와 좌석 재고를 반환한다.
