# Pokemon Card Price Tracker — Frontend Pre-Plan v1

> 작성일: 2026-03-31
> 상태: 초안 (Draft)
> 저장소: `pokemon-price-tracker-front`

---

## 1. 프로젝트 개요

포켓몬 트레이딩 카드게임 라이브(PTCGL) 카드의 국내 시세를 한눈에 비교할 수 있는 웹 서비스의 **프론트엔드** 프로젝트.

전체 시스템은 3개 저장소로 구성된다:

| 저장소 | 역할 |
|--------|------|
| **`pokemon-price-tracker-front`** (본 저장소) | React SPA — UI, 라우팅, API 연동 |
| `pokemon-price-tracker-backend` | Rust Axum API 서버 — 카드 메타데이터 조회 + 실시간 시세 조회 |
| `pokemon-price-tracker-scraper` | Python 스크래퍼 — 공식 카드 DB 수집 + 판매처별 시세 수집 |

---

## 2. 기술 스택

| 항목 | 선택 |
|------|------|
| 프레임워크 | React (Vite + TypeScript) |
| 배포 | Cloudflare Pages |
| 스타일링 | Tailwind CSS v4 + shadcn/ui |
| UI 컴포넌트 | shadcn/ui (Radix UI 기반 headless 컴포넌트) |
| 상태 관리 | @tanstack/react-query |
| 라우팅 | react-router-dom |

### Tailwind CSS + shadcn/ui 선택 이유
- **Tailwind CSS v4**: 유틸리티 퍼스트로 빠른 UI 개발, 번들 크기 최소화
- **shadcn/ui**: 복사 붙여넣기 방식으로 컴포넌트를 프로젝트에 직접 소유 → 커스터마이징 자유도 높음
- 카드 리스트, 검색 바, 시세 비교 테이블 등에 `Table`, `Card`, `Input`, `Select`, `Badge`, `Dialog` 등 shadcn 컴포넌트 활용
- 다크모드 지원이 Tailwind + shadcn 조합으로 간단하게 구현 가능

---

## 3. 지역(언어) 분기 정책

- 사용자의 브라우저 언어(`navigator.language`) 또는 IP 기반 지역 감지를 사용한다.
- **한국어(`ko`)** 접속: 정상적으로 서비스 페이지를 노출한다.
- **그 외 언어** 접속: "서비스 준비 중" 안내 페이지를 노출한다.

> 배경: 한국 포켓몬 카드게임 공식 사이트(pokemoncard.co.kr) 기반으로 데이터를 수집하므로, 현재는 한국 시장만 지원한다.
> 추후 다국어 지원 확장을 고려해 i18n 구조는 초기부터 열어두는 것을 권장한다.

---

## 4. 백엔드 API 연동

> 백엔드 API 상세는 `pokemon-price-tracker-backend` 저장소의 문서를 참조한다.

### 사용하는 API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| `GET` | `/api/cards` | 카드 목록 (페이지네이션, 검색·필터 지원) |
| `GET` | `/api/cards/:id` | 카드 단건 조회 |
| `GET` | `/api/cards/:id/prices` | 카드 실시간 시세 조회 (모든 판매처) |
| `GET` | `/api/expansions` | 확장팩 목록 |

### Query 파라미터 (`GET /api/cards`)

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `q` | string | 카드명 검색 |
| `expansion` | string | 확장팩 필터 |
| `rarity` | string | 희귀도 필터 |
| `page` | int | 페이지 번호 (기본값: 1) |
| `per_page` | int | 페이지당 건수 (기본값: 40) |

---

## 5. 화면 구성

### 5-1. 공통 레이아웃

```
[ 헤더: 로고 + 카드 검색 바 ]
[ 콘텐츠 영역 ]
[ 푸터 ]
```

### 5-2. 메인 페이지 (`/`)

- **상단**: 카드 검색 바 (카드명, 확장팩, 희귀도 필터 등)
- **본문**: 전체 카드 리스트
  - 카드 썸네일 이미지
  - 카드명 / 확장팩 / 희귀도
  - 판매처별 최신 시세 요약
  - 최저가 강조 표시
- **페이지네이션 또는 무한 스크롤**: TBD

### 5-3. 카드 상세 페이지 (`/card/:id`)

- 카드 이미지 (대형)
- 카드 기본 정보 (공식 DB 데이터)
- 판매처별 시세 실시간 비교 테이블 (페이지 진입 시 즉시 fetch)
  - 판매가 / 매입가 / 데이터 수집 시각
- **시세 히스토리 없음** — 실시간 조회만 제공
- 로딩 중에는 Skeleton UI 표시 (shadcn `Skeleton` 컴포넌트 활용)

### 5-4. 준비 중 페이지 (비한국어 접속)

- 간단한 "서비스 준비 중" 메시지
- 영문/기타 언어 안내 문구
- 한국어 접속 유도 (선택)

---

## 6. 아키텍처 다이어그램 (프론트엔드 관점)

```
[브라우저]
    |
    | HTTPS
    v
[Cloudflare Pages]  ← 정적 빌드 (Vite + React)
    |
    | API 호출 (REST)
    v
[Rust Axum 서버]  ← pokemon-price-tracker-backend
    |
    |-- /api/cards         → 카드 메타데이터
    |-- /api/cards/:id     → 카드 상세
    |-- /api/cards/:id/prices → 실시간 시세 (판매처별)
    |-- /api/expansions    → 확장팩 목록
```

---

## 7. 주요 고려사항 및 리스크

| 항목 | 내용 |
|------|------|
| Cloudflare Pages 제한 | 서버사이드 로직은 Workers/Functions로 처리 가능하나 실행 시간 제한(CPU 10ms~30s) 주의 |
| 언어 감지 신뢰도 | `navigator.language` 조작 가능성 → 서비스 초기에는 클라이언트 감지로 충분 |
| 시세 로딩 UX | 실시간 스크래핑 특성상 응답 지연 가능 → Skeleton UI + 부분 실패 처리 필수 |

---

## 8. 개발 단계 (프론트엔드 로드맵)

| 단계 | 내용 |
|------|------|
| Phase 1 | Vite+React+TS 프로젝트 세팅, Cloudflare Pages 배포 파이프라인 구성 |
| Phase 2 | 언어 분기 페이지 구현 (한국어 / 준비 중) |
| Phase 3 | React Query 설정 + API 연동 훅 작성 |
| Phase 4 | 메인 페이지 UI 구현 (카드 리스트 + 검색 + 시세 비교) |
| Phase 5 | 카드 상세 페이지 UI 구현 (실시간 시세 fetch + Skeleton UI) |
| Phase 6 | 성능 개선 (이미지 lazy loading, 반응형 레이아웃, 에러 UX) |

---

## 9. 미결 사항 (TBD)

- [ ] 다국어 확장(일본, 영미권) 시점 및 범위
- [ ] 페이지네이션 vs 무한 스크롤 결정
- [ ] 실시간 시세 조회 응답 지연 대응 UX (타임아웃, 부분 실패 표시 방식)

### 확정된 사항 (미결에서 해소)

| 항목 | 결정 |
|------|------|
| 시세 히스토리 | **미보존** — 실시간 스크래핑으로 즉시 반환 |
| 로그인/회원 기능 | **없음** (현재 범위 밖) |
| 상태 관리 | @tanstack/react-query 채택 |
