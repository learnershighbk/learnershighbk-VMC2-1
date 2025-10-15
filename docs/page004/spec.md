# 예약 완료 페이지 유스케이스

## Primary Actor
- 예약을 성공적으로 완료하고 결과를 확인하려는 사용자

## Precondition
- 사용자는 좌석 선택 프로세스를 통해 예약을 성공적으로 마쳤다.
- 예약 식별자(reservation_id)를 포함한 라우팅 정보를 가지고 있다.

## Trigger
- 사용자가 예약 완료 페이지로 이동한다.

## Main Scenario
1. FE는 reservation_id를 파라미터로 받아 로딩 상태를 표시한다.
2. FE는 BE에 예약 상세 정보를 조회한다.
3. BE는 예약 상태가 `reserved`인지 확인하고, 필요한 경우 공연 정보 일부를 조인한다.
4. Database는 예약 요약 정보와 필요시 공연 메타 데이터를 반환한다.
5. BE는 개인정보를 최소화한 형태로 응답한다.
6. FE는 공연명, 일정, 좌석 정보, 총액 등 예약 요약을 표시한다.
7. 사용자가 정보 복사/공유를 요청하면 FE는 클립보드 복사 기능을 제공한다.
8. 사용자가 홈 또는 예약 조회 페이지로 이동할 수 있는 버튼을 클릭하면 FE는 라우팅한다.

## Edge Cases
- reservation_id가 유효하지 않거나 만료된 경우: FE는 오류 안내와 함께 홈으로 이동하는 버튼을 제공한다.
- 이미 취소된 예약으로 접근한 경우: FE는 상태를 `취소됨`으로 표시하고 홈/조회 이동을 유도한다.
- 네트워크 오류: FE는 재시도 버튼을 제공하며 로컬 캐시는 사용하지 않는다.
- SSR/CSR 전환 시 데이터 불일치: FE는 로딩 상태를 유지하고 재조회한다.

## Business Rules
- 개인정보(전화번호, 비밀번호)는 노출하지 않는다.
- 예약 상태가 `reserved`가 아니면 예약 완료 UI를 노출하지 않는다.
- 예약 요약에는 좌석 위치와 총액, 예약 일시를 포함한다.
- 예약 정보 재조회는 보안 토큰 없이 reservation_id만으로 접근할 수 있지만 민감 정보는 제거되어야 한다.
- 브라우저 새로고침 시 동일 정보가 반복 노출되어야 하며 중복 예약 생성이 발생하지 않아야 한다.

```
@startuml
actor User
participant FE
participant BE
database Database

User -> FE: 예약 완료 페이지 진입(reservation_id)
FE -> BE: GET /reservations/{id}
BE -> Database: reservations 조회 및 공연 정보 보강(Optional)
Database --> BE: 예약 요약 데이터
BE --> FE: 200 OK + 예약 요약 응답
FE -> User: 예약 상세 정보 및 액션 버튼 표시
User -> FE: 홈/예약 조회 버튼 클릭
FE -> User: 해당 페이지로 라우팅
@enduml
```

