# Pokemon Card Price Tracker — Frontend

포켓몬 트레이딩 카드 가격 비교 서비스의 프론트엔드입니다.
한국 주요 포켓몬 카드 거래처(카드냥, ICU 너정다, 당근마켓, 중고나라)의 실시간 가격을 한눈에 비교할 수 있습니다.

> 한국어 브라우저 환경 전용 서비스입니다.

---

## 서비스 구조

이 서비스는 3개의 저장소로 구성되어 있습니다.

| 역할 | 저장소 | 기술 스택 |
|------|--------|-----------|
| **Frontend** (현재 저장소) | pokemon-price-tracker-front | React, TypeScript, Vite |
| **Backend API** | pokemon-price-tracker-backend | Rust, Axum |
| **Scraper** | pokemon-price-tracker-scraper | Python |

```
[Browser] → [React SPA] → [Rust API Server] → [DB / Scraper]
```

---

## 주요 기능

- **카드 목록 조회**: 페이지네이션, 이름 검색(300ms 디바운스), 확장팩/희귀도 필터링
- **카드 상세 조회**: 카드 이미지, 기본 정보(확장팩, 희귀도, 카드 타입), 공식 페이지 링크
- **실시간 가격 비교**: 4개 거래처의 매입가·판매가·중고가를 테이블로 제공, 최저가 하이라이트
- **언어 게이트**: 브라우저 언어가 한국어(`ko`)가 아닌 경우 Coming Soon 페이지 표시

### 가격 데이터 출처

| 소스 | 유형 |
|------|------|
| 카드냥 (Cardnyang) | 카드 전문 매장 |
| ICU 너정다 | 카드 전문 매장 |
| 당근마켓 | C2C 중고 거래 |
| 중고나라 | C2C 중고 거래 |

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| UI 프레임워크 | React 19 |
| 언어 | TypeScript 5.9 (strict mode) |
| 빌드 도구 | Vite 8 |
| 스타일링 | Tailwind CSS v4 + shadcn/ui |
| 서버 상태 관리 | TanStack React Query v5 |
| 라우팅 | React Router v7 |
| 아이콘 | Lucide React |
| 폰트 | Geist Variable |
| 배포 | Cloudflare Pages |

---

## 페이지 구성

| 경로 | 컴포넌트 | 설명 |
|------|----------|------|
| `/` | `MainPage` | 카드 목록, 검색, 필터 |
| `/card/:id` | `CardDetailPage` | 카드 상세 + 가격 비교 테이블 |
| `*` | `NotFoundPage` | 404 |
| (언어 조건 미충족) | `ComingSoonPage` | 한국어 외 언어 차단 |

---

## API 연동

백엔드 API URL은 환경 변수로 설정합니다.

```
VITE_API_URL=http://localhost:3000
```

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/cards` | 카드 목록 (검색·필터·페이지네이션) |
| GET | `/api/cards/:id` | 카드 상세 |
| GET | `/api/cards/:id/prices` | 카드별 실시간 가격 |
| GET | `/api/expansions` | 확장팩 목록 |

---

## 로컬 개발 환경 설정

### 사전 요구사항

- Node.js 20+
- npm

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# VITE_API_URL을 백엔드 서버 주소로 수정

# 개발 서버 실행 (HMR 활성화)
npm run dev
```

### 주요 스크립트

```bash
npm run dev       # 개발 서버 실행
npm run build     # TypeScript 컴파일 + Vite 빌드 (output: dist/)
npm run preview   # 프로덕션 빌드 로컬 미리보기
npm run lint      # ESLint 검사
```

---

## 프로젝트 구조

```
src/
├── components/
│   ├── card/         # CardGrid, CardListItem, CardSearchBar
│   ├── layout/       # Header, Footer
│   ├── price/        # PriceTable, PriceSkeleton
│   └── ui/           # shadcn/ui 기반 공통 컴포넌트
├── hooks/
│   ├── useCards.ts        # 카드 목록/상세 조회
│   ├── usePrices.ts       # 가격 데이터 조회 (캐시 없음, 항상 최신)
│   └── useLanguageGate.ts # 브라우저 언어 감지
├── lib/
│   ├── api.ts        # API 클라이언트
│   └── utils.ts      # 유틸리티 함수
├── pages/            # 페이지 컴포넌트
├── types/            # TypeScript 타입 정의
├── App.tsx           # QueryClientProvider + 언어 게이트
└── Router.tsx        # 라우트 정의
```

---

## 배포

Cloudflare Pages에 배포됩니다.

- Git push 시 자동 빌드 및 배포
- SPA 라우팅을 위한 `public/_redirects` 파일 포함
- 빌드 명령어: `npm run build`
- 빌드 출력 디렉토리: `dist/`
