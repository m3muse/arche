# GUMON - 기초 산수 PWA

기초 산수가 약한 성인을 위한 곱하기 / 나누기 / 퍼센트 연습 PWA.

## 공통 규칙

- **답 입력 방식**: 직접 입력 (객관식 X)
- **채점**: 정답 시 ✓ + 잠금 + 다음 칸 자동 포커스
- **소수 정답 허용 오차**: `|입력값 − 정답| ≤ 0.1` (예: 3.333… → 3.3 정답)
- **저장**: `localStorage`, 프로필별로 분리 (`gumon.profile.<id>.progress`)
- **PWA**: 정적 자원 + 서비스워커 오프라인
- **UI**: 다크 테마, 모바일 우선

## 다국어 (i18n)

- 지원: **한국어 / 중국어(간체) / 영어**
- 기본: 한국어 (브라우저 언어 감지 후 자동 설정 가능)
- 저장: `localStorage['gumon.lang']`
- 설정 탭에서 변경

## 로그인/로그아웃 (로컬 프로필)

- 정적 PWA → 백엔드 인증 없음, **로컬 프로필 시스템**
- 프로필 = `{ id, name }` (비밀번호 X, 다중 사용자 전환용)
- 게스트 모드 = 익명 프로필
- 진행상황은 프로필별로 분리 저장
- 설정 탭에서 로그인(프로필 생성/선택), 로그아웃(게스트로 전환)

## 탭 구성 (총 4개)

### Tab 1: 곱하기 — 단별 2단계 구조
- Level 1~9 → 11단 ~ 99단
- 각 단 진입 시:
  - **Stage 1: 기초** — N×1 ~ N×20 (20문제)
  - **Stage 2: 응용** — Stage 1 완료 시 해금
    - 묶음(개수×단위), 가격(단가×수량), 시간·거리(속도×시간)
    - N을 곱셈 인자로 사용, 무한 출제, 누적 정답수 표시

### Tab 2: 나누기 — 2단계 구조
- **Stage 1: 기초** — ÷2 ~ ÷9 (8개 카드), 각 카드 12문제
- **Stage 2: 응용** — Stage 1 전체 완료 시 해금
  - 똑같이 나눠 갖기, 단가 계산, 단위 분배

### Tab 3: 퍼센트 — 2단계 구조
- **Stage 1: 기초** — "A의 N%" / "A는 B의 몇 %" 각 20문제 고정 세트
- **Stage 2: 응용** — Stage 1 전체 완료 시 해금
  - 세일/할인, 인구·통계 비율, 팁·세금

### Tab 4: 설정
- 언어 선택 (한/중/영)
- 로그인 / 로그아웃 / 프로필 전환
- 진행상황 초기화

## 데이터 모델

```js
// localStorage
'gumon.lang'        : 'ko' | 'zh' | 'en'
'gumon.currentProfile' : string  // 프로필 id, 'guest' 가능
'gumon.profiles'    : Profile[]  // [{id,name}]
'gumon.profile.<id>.progress' : Progress

Progress = {
  mul: {
    basic:   { [dan]: { [m]: true } },
    applied: { [dan]: { correct: N } }
  },
  div: {
    basic:   { [divisor]: { [q]: true } },
    applied: { [categoryId]: { correct: N } }
  },
  pct: {
    basic:   { ofType: { [idx]: true }, ratioType: { [idx]: true } },
    applied: { [categoryId]: { correct: N } }
  }
}
```

## 파일 구조

- `index.html`, `styles.css`, `app.js`
- `i18n.js` — 언어팩
- `manifest.webmanifest`, `sw.js`, `icon.svg`

## 개발 메모

- 빌드 도구 없음 (순수 정적)
- 정적 서버 필수 (`python -m http.server 8000`)
- 응용 문제 텍스트는 i18n 딕셔너리에서 템플릿 + 보간
