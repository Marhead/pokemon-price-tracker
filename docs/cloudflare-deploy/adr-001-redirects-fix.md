# ADR-001: Cloudflare Pages _redirects 무한 루프 수정

> 작성일: 2026-04-02
> 상태: 채택됨 (Accepted)
> 저장소: `pokemon-price-tracker-front`

---

## 맥락 (Context)

Cloudflare Pages에 프로젝트를 배포할 때 다음 에러가 발생했다:

```
Invalid _redirects configuration:
Line 1: Infinite loop detected in this rule. This would cause a redirect
to strip `.html` or `/index` and end up triggering this rule again.
[code: 10021]
```

기존 `public/_redirects` 내용:
```
/* /index.html 200
```

이 규칙은 SPA(Single Page Application)의 클라이언트 사이드 라우팅을 위한 설정으로, 모든 경로를 `index.html`로 포워딩하는 것이 목적이다.

**에러 원인:**
Cloudflare Pages는 배포 시 `.html` 확장자 제거 최적화를 자동 적용한다. 이로 인해 아래 순환이 발생한다:

```
/* → /index.html → (확장자 제거) → /index → /* 매칭 → /index.html → ...
```

Cloudflare가 이를 무한 루프로 판단하여 배포를 차단한다.

---

## 결정 (Decision)

### 채택: 리다이렉트 대상을 `/index.html` → `/`로 변경

```
/* / 200
```

`/`로 지정하면 `.html` 확장자 제거 최적화가 개입하지 않으므로 순환이 발생하지 않는다. Cloudflare Pages는 `/`를 루트 `index.html`로 서빙하므로 SPA 라우팅 동작은 동일하게 유지된다.

### 거절: `_redirects` 파일 삭제

파일 자체를 삭제하면 SPA 클라이언트 라우팅이 깨진다. 사용자가 `/cards/SV9-061` 같은 경로를 직접 접근하거나 새로고침할 때 Cloudflare가 해당 경로의 실제 파일을 찾지 못해 404를 반환한다.

### 거절: Cloudflare Pages 설정에서 규칙 관리

Cloudflare 대시보드에서 리다이렉트 규칙을 직접 관리하는 방식. 코드 저장소와 설정이 분리되어 재현성이 떨어지고 팀 협업 시 혼선이 생길 수 있다.

---

## 결과 (Consequences)

### 긍정적

- Cloudflare Pages 배포 성공
- SPA 라우팅 정상 동작 유지 (새로고침, 직접 URL 접근 모두 가능)
- 단순한 1줄 수정으로 해결

### 중립적

- `public/_redirects`는 빌드 시 `dist/_redirects`로 복사됨 — 두 파일 모두 동일하게 유지됨

---

## 관련 변경

| 파일 | 변경 내용 |
|------|-----------|
| `public/_redirects` | `/* /index.html 200` → `/* / 200` |
