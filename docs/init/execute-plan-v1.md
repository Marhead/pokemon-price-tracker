# Pokemon Card Price Tracker — Frontend Execute Plan v1

> 작성일: 2026-03-31
> 기반 문서: `pre-plan-v1.md`
> 상태: 실행 계획 (Ready to Execute)
> 저장소: `pokemon-price-tracker-front`

---

## 실행 순서 개요

```
Phase 1  →  프론트엔드 프로젝트 세팅 + Cloudflare Pages 배포
Phase 2  →  언어 분기 페이지 구현
Phase 3  →  React Query 설정 + API 연동 훅
Phase 4  →  메인 페이지 UI
Phase 5  →  카드 상세 페이지 UI
Phase 6  →  성능 개선 및 고도화
```

---

## Phase 1 — 프론트엔드 프로젝트 세팅 + Cloudflare Pages 배포

### 목표
로컬에서 개발 가능한 Vite+React+TS 프로젝트를 만들고, Cloudflare Pages에 자동 배포되도록 구성한다.

### 작업 목록

#### 1-1. 프로젝트 초기화
```bash
npm create vite@latest pokemon-price-tracker -- --template react-ts
cd pokemon-price-tracker
npm install
```

#### 1-2. Tailwind CSS v4 설치
```bash
npm install tailwindcss @tailwindcss/vite
```

`vite.config.ts`에 플러그인 추가:
```ts
import tailwindcss from '@tailwindcss/vite'

export default {
  plugins: [tailwindcss()],
}
```

`src/index.css` 상단에 추가:
```css
@import "tailwindcss";
```

#### 1-3. shadcn/ui 설치
```bash
npx shadcn@latest init
```
- Style: `New York`
- Base color: `Zinc` (또는 프로젝트에 맞게 선택)
- CSS variables: `yes`

초기 필요 컴포넌트 설치:
```bash
npx shadcn@latest add button input card table badge skeleton select
```

#### 1-4. React Router 설치
```bash
npm install react-router-dom
```

라우트 구조:
```
/          → 메인 (카드 리스트)
/card/:id  → 카드 상세
/*         → 404
```

#### 1-5. 디렉토리 구조 설계
```
src/
  components/
    ui/          ← shadcn 자동 생성 컴포넌트
    layout/      ← Header, Footer
    card/        ← CardListItem, CardGrid 등
    price/       ← PriceTable, PriceRow 등
  pages/
    MainPage.tsx
    CardDetailPage.tsx
    ComingSoonPage.tsx
  hooks/
    useLanguageGate.ts
    useCards.ts
    usePrices.ts
  lib/
    api.ts       ← API 클라이언트
    utils.ts     ← shadcn 자동 생성
  types/
    card.ts
    price.ts
```

#### 1-6. Cloudflare Pages 배포 설정

GitHub 레포지토리 연결 후 Cloudflare Pages 대시보드에서:
- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

`wrangler.toml` (필요 시):
```toml
name = "pokemon-price-tracker"
compatibility_date = "2026-01-01"
```

### 완료 기준
- `npm run dev` 로컬 실행 정상
- `main` 브랜치 push 시 Cloudflare Pages 자동 빌드·배포 성공
- 빈 페이지라도 Cloudflare 도메인으로 접근 가능

---

## Phase 2 — 언어 분기 페이지 구현

### 목표
한국어 접속자에게는 서비스 페이지를, 그 외 언어 접속자에게는 "준비 중" 페이지를 보여준다.

### 작업 목록

#### 2-1. 언어 감지 훅 작성

`src/hooks/useLanguageGate.ts`:
```ts
export function useLanguageGate(): boolean {
  const lang = navigator.language || navigator.languages?.[0] || ''
  return lang.startsWith('ko')
}
```

#### 2-2. 앱 진입점에 분기 적용

`src/App.tsx`:
```tsx
import { useLanguageGate } from './hooks/useLanguageGate'
import { ComingSoonPage } from './pages/ComingSoonPage'
import { Router } from './Router'

export default function App() {
  const isKorean = useLanguageGate()
  if (!isKorean) return <ComingSoonPage />
  return <Router />
}
```

#### 2-3. ComingSoonPage 구현

`src/pages/ComingSoonPage.tsx`:
- 중앙 정렬 레이아웃
- "서비스 준비 중입니다" 메시지 (한국어)
- "This service is currently unavailable in your region." (영문)
- shadcn `Card` 컴포넌트로 감싸기

### 완료 기준
- 브라우저 언어를 `ko`로 설정하면 메인 페이지 라우터로 진입
- 그 외 언어(`en`, `ja` 등)로 설정하면 ComingSoonPage 노출
- 빌드 후 Cloudflare Pages에서도 동작 확인

---

## Phase 3 — React Query 설정 + API 연동 훅

### 목표
백엔드 API(`pokemon-price-tracker-backend`)와 통신하기 위한 React Query 설정 및 커스텀 훅을 작성한다.

### 작업 목록

#### 3-1. React Query 설치 및 설정

```bash
npm install @tanstack/react-query
```

`src/main.tsx`에 QueryClientProvider 추가:
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)
```

#### 3-2. API 클라이언트 작성

`src/lib/api.ts`:
```ts
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

export async function fetchCards(params: CardSearchParams) {
  const query = new URLSearchParams(params as Record<string, string>)
  const res = await fetch(`${API_BASE}/api/cards?${query}`)
  return res.json()
}

export async function fetchCard(id: string) {
  const res = await fetch(`${API_BASE}/api/cards/${id}`)
  return res.json()
}

export async function fetchPrices(cardId: string) {
  const res = await fetch(`${API_BASE}/api/cards/${cardId}/prices`)
  return res.json()
}

export async function fetchExpansions() {
  const res = await fetch(`${API_BASE}/api/expansions`)
  return res.json()
}
```

#### 3-3. 카드 목록 조회 훅

`src/hooks/useCards.ts`:
```ts
import { useQuery } from '@tanstack/react-query'
import { fetchCards } from '../lib/api'

export function useCards(params: CardSearchParams) {
  return useQuery({
    queryKey: ['cards', params],
    queryFn: () => fetchCards(params),
  })
}
```

#### 3-4. 실시간 시세 조회 훅

`src/hooks/usePrices.ts`:
```ts
import { useQuery } from '@tanstack/react-query'
import { fetchPrices } from '../lib/api'

export function usePrices(cardId: string) {
  return useQuery({
    queryKey: ['prices', cardId],
    queryFn: () => fetchPrices(cardId),
    staleTime: 0,
    gcTime: 0,
    retry: 1,
  })
}
```

#### 3-5. TypeScript 타입 정의

`src/types/card.ts`:
```ts
export interface Card {
  id: string
  name: string
  expansion: string
  rarity: string | null
  card_type: string | null
  image_url: string | null
  official_url: string | null
}

export interface CardSearchParams {
  q?: string
  expansion?: string
  rarity?: string
  page?: number
  per_page?: number
}
```

`src/types/price.ts`:
```ts
export interface PriceItem {
  source: 'cardnyang' | 'icu' | 'daangn' | 'joongna'
  card_id: string | null
  card_name_raw: string
  price: number
  price_type: 'buy' | 'sell' | 'used'
  url: string | null
  fetched_at: string
}
```

#### 3-6. 환경 변수 설정

`.env.local`:
```
VITE_API_BASE=http://localhost:3000
```

`.env.example`:
```
VITE_API_BASE=http://localhost:3000
```

### 완료 기준
- React Query DevTools로 쿼리 상태 확인 가능
- `useCards`, `usePrices` 훅이 백엔드 API 정상 호출 (백엔드 가동 시)
- 타입 정의 완료

---

## Phase 4 — 메인 페이지 UI

### 목표
카드 전체 리스트와 검색 바를 구현한다. 시세는 카드 목록에서 요약 표시한다.

### 작업 목록

#### 4-1. 검색 바 컴포넌트

`src/components/card/CardSearchBar.tsx`:
- shadcn `Input` — 카드명 텍스트 검색
- shadcn `Select` — 확장팩 필터
- shadcn `Select` — 희귀도 필터 (C / U / R / RR / SAR / ...)
- 검색어 디바운스 300ms 적용

#### 4-2. 카드 리스트 컴포넌트

`src/components/card/CardGrid.tsx`:
- CSS Grid 레이아웃 (모바일: 2열 / 태블릿: 3열 / 데스크톱: 4~5열)
- shadcn `Card`로 감싼 카드 아이템

`src/components/card/CardListItem.tsx`:
- 카드 썸네일 이미지 (lazy loading)
- 카드명 / 확장팩 / 희귀도 `Badge`
- 카드냥 매입가 요약 표시 (카드 상세에서 전체 판매처 확인 유도)
- 클릭 시 `/card/:id` 이동

#### 4-3. 헤더 레이아웃

`src/components/layout/Header.tsx`:
- 로고 (텍스트 또는 SVG)
- 카드 검색 바 임베드

#### 4-4. 페이지네이션

shadcn `Pagination` 컴포넌트 사용, API `page` 파라미터 연동

#### 4-5. 메인 페이지 조립

`src/pages/MainPage.tsx`:
```tsx
export function MainPage() {
  // useCards 훅으로 카드 목록 조회
  // CardSearchBar + CardGrid + Pagination 조합
}
```

### 완료 기준
- 카드 목록 정상 렌더링 (40개/페이지)
- 카드명 검색 → 결과 필터링 동작
- 확장팩/희귀도 필터 동작
- 모바일 반응형 레이아웃 확인

---

## Phase 5 — 카드 상세 페이지 UI

### 목표
카드 상세 정보와 실시간 시세 비교 테이블을 구현한다.

### 작업 목록

#### 5-1. 카드 상세 레이아웃

`src/pages/CardDetailPage.tsx`:
```
[ 뒤로 가기 버튼 ]
[ 카드 이미지 (좌) | 카드 기본 정보 (우) ]
  - 카드명
  - 카드 번호 / 확장팩 / 희귀도 Badge
  - 공식 사이트 링크

[ 실시간 시세 비교 ]
  - 로딩 중: Skeleton UI (3행)
  - 완료: PriceTable
  - 실패: "시세를 불러오지 못했습니다" 안내
```

#### 5-2. 시세 테이블 컴포넌트

`src/components/price/PriceTable.tsx`:

| 판매처 | 구분 | 가격 | 조회 시각 | 링크 |
|--------|------|------|-----------|------|
| 카드냥 | 매입가 | ₩12,000 | 방금 전 | → |
| ICU 너정다 | 평균 거래가 | ₩15,000 | 방금 전 | → |
| 당근마켓 | 중고가 (최저) | ₩10,000 | 방금 전 | → |
| 중고나라 | 중고가 (최저) | ₩11,000 | 방금 전 | → |

- 최저가 행 강조 표시 (`Badge` 또는 배경색)
- 판매처별 로딩 상태 개별 표시 (Skeleton 행)
- shadcn `Table` 컴포넌트 활용

#### 5-3. Skeleton UI

```tsx
{isPending && (
  <div className="space-y-2">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
  </div>
)}
```

### 완료 기준
- 카드 상세 정보 정상 표시
- 페이지 진입 시 실시간 시세 fetch 시작
- Skeleton → 데이터 전환 애니메이션 확인
- 판매처 1개 이상 실패 시에도 나머지 결과 표시

---

## Phase 6 — 성능 개선 및 고도화

### 목표
전반적인 UX 완성도를 높이고 성능을 최적화한다.

### 작업 목록

#### 6-1. 이미지 최적화
- 카드 썸네일 lazy loading (`loading="lazy"`)
- 이미지 placeholder (blur 또는 skeleton)

#### 6-2. 에러 처리 UX
- 판매처 전체 실패 시 안내 메시지
- 네트워크 오류 시 재시도 버튼
- API 연결 실패 시 fallback UI

#### 6-3. 반응형 레이아웃 점검
- 모바일 / 태블릿 / 데스크톱 각 해상도 확인
- 카드 그리드 열 수 조정
- 시세 테이블 모바일 대응 (가로 스크롤 또는 카드형)

#### 6-4. 접근성
- 시맨틱 HTML 태그 사용
- 키보드 네비게이션 확인
- 색상 대비 충분 여부 확인

### 완료 기준
- Lighthouse 성능 점수 90점 이상
- 모바일·데스크톱 모두 정상 작동
- 에러 상황에서도 사용자에게 명확한 안내 표시

---

## 의존성 요약

| 패키지 | 버전 | 용도 |
|--------|------|------|
| react | 19.x | UI 프레임워크 |
| vite | 6.x | 빌드 도구 |
| typescript | 5.x | 타입 시스템 |
| tailwindcss | 4.x | 스타일링 |
| shadcn/ui | latest | UI 컴포넌트 |
| @tanstack/react-query | 5.x | 서버 상태 관리 |
| react-router-dom | 7.x | 라우팅 |

---

## 체크리스트

### Phase 1
- [ ] Vite + React + TS 초기화
- [ ] Tailwind CSS v4 설치 및 설정
- [ ] shadcn/ui 초기화 + 기본 컴포넌트 설치
- [ ] React Router 설정
- [ ] Cloudflare Pages 연결 + 자동 배포 확인

### Phase 2
- [ ] `useLanguageGate` 훅 구현
- [ ] ComingSoonPage 구현
- [ ] 언어 분기 로직 적용 및 테스트

### Phase 3
- [ ] React Query 설치 + QueryClientProvider 설정
- [ ] API 클라이언트 (`src/lib/api.ts`) 작성
- [ ] `useCards`, `usePrices` 훅 구현
- [ ] TypeScript 타입 정의 (`card.ts`, `price.ts`)
- [ ] 환경 변수 설정 (`.env.local`, `.env.example`)

### Phase 4
- [ ] 카드 검색 바 컴포넌트
- [ ] 카드 그리드 / 리스트 아이템 컴포넌트
- [ ] 헤더 레이아웃
- [ ] 페이지네이션
- [ ] 모바일 반응형 확인

### Phase 5
- [ ] 카드 상세 레이아웃
- [ ] 실시간 시세 테이블 컴포넌트
- [ ] Skeleton UI 적용
- [ ] 부분 실패 처리 확인

### Phase 6
- [ ] 이미지 lazy loading 최적화
- [ ] 에러 처리 UX 개선
- [ ] 반응형 레이아웃 점검
- [ ] 접근성 확인
