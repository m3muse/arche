# ARCHE — 기초 산수 PWA

기초 산수가 약한 성인을 위한 곱하기 / 나누기 / 퍼센트 반복 연습 앱.  
빌드 도구 없음. 순수 정적 파일. 로컬 서버 필수 (`python -m http.server 8000`).

---

## 파일 구조

```
index.html          — 마크업 (탭 nav, topbar, #app 마운트 포인트)
styles.css          — 다크 테마, 모바일 우선
app.js              — 전체 앱 로직 (단일 IIFE)
i18n.js             — 언어팩 (ko / zh / en), window.I18N 에 등록
manifest.webmanifest
sw.js               — 서비스워커 (캐시 버전: arche-v16)
icon.svg
```

---

## UI / 레이아웃

- **topbar**: 좌←버튼(뒤로가기), 가운데 Arche 로고 + 페이지 타이틀, 우 프로필 칩
- **tabs**: 곱하기 / 나누기 / 퍼센트 / 설정 (4개)
- **#app**: 탭 콘텐츠 렌더링 영역
- 다크 테마, 모바일 우선

---

## 네비게이션

`stack` 배열로 화면 히스토리 관리. 화면 전환은 `go(view)`, 뒤로는 `back()`, 탭 전환은 `switchTab(tab)`.

```js
// view 객체 구조
{ tab: 'mul'|'div'|'pct'|'settings', name: '화면명', ...params }
```

**핸드폰 뒤로가기 지원**: `history.pushState` + `popstate` 이벤트로 Android 뒤로가기를 앱 내부 네비게이션에 연결. 루트에서도 앱을 종료하지 않고 머뭄.

---

## 로그인 / 프로필

- 백엔드 없음. 로컬 프로필 시스템 (`localStorage`).
- **앱 시작 시 게스트(미로그인)이면 로그인 화면 강제 표시** (이름만 입력, 비밀번호 없음).
- 같은 이름 재입력 시 기존 프로필로 자동 연결 (프로필 신규 생성 X).
- 로그아웃 = 게스트로 전환 → 다시 로그인 화면 표시.
- 여러 프로필 저장/전환/삭제 가능 (설정 탭).

```
localStorage 키
  gumon.lang                  → 'ko' | 'zh' | 'en'
  gumon.currentProfile        → 프로필 id ('guest' 가능)
  gumon.profiles              → Profile[] JSON
  gumon.profile.<id>.progress → Progress JSON
```

---

## 채점 규칙

- 직접 입력 방식 (객관식 없음)
- 정답 허용 오차: `|입력값 − 정답| ≤ 0.1` (소수 포함)
- 정답 시: ✓ 스타일 + input readonly + 다음 빈 칸 자동 포커스
- 오답 시: 빨간 테두리 400ms 후 제거
- **응용 퀴즈에 "다음(스킵)" 버튼 없음** — 정답을 맞춰야만 다음 문제로 진행

---

## 탭 1: 곱하기

**화면 흐름**: 레벨 목록 → 단 목록 → 단 메뉴(기초/응용 선택) → 퀴즈

| 구분 | 내용 |
|------|------|
| 레벨 | 1~9 (레벨 1 = 11~19단, 레벨 2 = 21~29단, …) |
| 기초 | N×1 ~ N×20, 총 20문제 / 세로 목록 입력 |
| 응용 | 기초 완료 시 해금 / 무한 랜덤 / 목표 20개 |
| 응용 카테고리 | mul_pack, mul_price, mul_speed, mul_drive, mul_lap |
| 완료 판정 | 기초 20/20 AND 응용 20/20 |

기초 완료 시 하단에 배너 버튼 → 그룹 목록으로 이동.

---

## 탭 2: 나누기

**화면 흐름**: 레벨 목록(1~10) → 그룹 목록(그룹 10개) → 그룹 메뉴(기초/응용) → 퀴즈

총 100그룹 (레벨 10 × 그룹 10).

| 구분 | 내용 |
|------|------|
| 기초 | 그룹별 12문제 고정 세트 (seeded RNG, 항상 같은 문제) |
| 응용 | 기초 완료 시 해금 / 무한 랜덤 / 목표 20개 |
| 응용 카테고리 | div_share, div_unit, div_pour |
| 난이도 진행 | 레벨 1: 한 자리 제수 두 자리 피제수 → 레벨 10: 큰 수 + 소수점 |
| 완료 판정 | 기초 12/12 AND 응용 20/20 |

기초 완료 시 하단에 배너 버튼 → 그룹 목록으로 이동.

---

## 탭 3: 퍼센트

**화면 흐름**: 레벨 목록(1~10) → 그룹 목록(그룹 10개) → 그룹 메뉴(기초/응용) → 퀴즈

총 100그룹 (레벨 10 × 그룹 10).

| 구분 | 내용 |
|------|------|
| 기초 | 그룹별 20문제 고정 세트 (seeded RNG) |
| 응용 | 기초 완료 시 해금 / 무한 랜덤 / 목표 20개 |
| 응용 카테고리 | pct_sale, pct_pop, pct_tip |
| 문제 유형 | `of` (A의 N%는?) / `ratio` (X는 A의 몇%?) — 그룹별 지정 |
| 난이도 진행 | 레벨 1~2: 10·25·50·100% → 레벨 10: 소수점% + 큰 금액 |
| 완료 판정 | 기초 20/20 AND 응용 20/20 |

각 그룹은 `PCT_LEVEL_CFG[lv]` 에서 `{ type, vals, pcts }` 를 읽어 문제 생성.

---

## 탭 4: 설정

- 언어 선택 (한국어 / 中文 / English)
- 프로필 로그인 (이름 입력) / 저장된 프로필 전환·삭제 / 로그아웃
- 진행상황 초기화 (현재 프로필)

---

## 데이터 모델

```js
Progress = {
  mul: {
    basic:   { [dan]: { [m]: true } },          // m = 1~20
    applied: { [dan]: { correct: N } }
  },
  div: {
    basic:   { [group]: { [idx]: true } },      // idx = 0~11
    applied: { [group]: { correct: N } }
  },
  pct: {
    basic:   { [group]: { [idx]: true } },      // idx = 0~19
    applied: { [group]: { correct: N } }
  }
}
```

---

## 다국어 (i18n)

`i18n.js` → `window.I18N = { ko, zh, en }`. `t('key.path', vars?)` 함수로 사용.  
저장: `localStorage['gumon.lang']`. 설정 탭에서 변경.

템플릿 보간: `t('cats.mul_price.q', { a, b })` → `"{a}원짜리를 {b}개 사면?"` 형식.

---

## 주요 상수 (app.js 상단)

```js
DAN_MIN = 11, DAN_MAX = 99
MUL_MAX = 20              // 기초 문제 수
MUL_APPLIED_GOAL = 20
DIV_LEVEL_QCOUNT = 12     // 나누기 기초 문제 수
DIV_APPLIED_GOAL = 20
PCT_BASIC_COUNT = 20      // 퍼센트 기초 문제 수
PCT_APPLIED_GOAL = 20
TOL = 0.1                 // 정답 허용 오차
```

---

## PWA / 서비스워커

- 오프라인 가능. 정적 자원 전체 캐시.
- 캐시 키: `arche-v17` (코드 변경 시 버전 bump 필요).
- 매니페스트: `manifest.webmanifest`, 아이콘: `icon.svg` (노란색 PWA 아이콘).
