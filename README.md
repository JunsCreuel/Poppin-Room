# POPPIN ROOM (포핀룸)

> 누르고, 터뜨리고, 모으는 나만의 오브제 룸 — 디지털 토이 컬렉션 웹앱

1조 그룹프로젝트. 왁뿌볼을 터뜨리고 키캡을 두드려 코인을 모으고, 뽑기와 상점으로 오브제를 수집해 내 방을 꾸미는 스트레스 해소 앱입니다.

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 서비스명 | POPPIN ROOM (포핀룸) |
| 형태 | 모바일 우선 반응형 웹앱 (SPA) |
| 핵심 루프 | 누르기(왁뿌볼·키캡) → 코인 획득 → 뽑기·구매로 오브제 수집 → 내 방 꾸미기 |
| 배포 | GitHub Pages (main 브랜치 푸시 시 자동 빌드·배포) |
| 저장 방식 | 서버 없음, 브라우저 localStorage에 진행 상황 저장 |

---

## 2. 기술 스택

| 구분 | 스택 | 용도 |
|---|---|---|
| 프레임워크 | React 19 | 화면 컴포넌트 |
| 라우팅 | react-router-dom 7 (HashRouter) | 화면 전환, 서버 설정 없이 새로고침 가능 |
| 빌드 | Vite 8 | 개발 서버, 번들링 |
| 상태 관리 | React Context + useState | 전역 게임 상태 (`src/store/useGame.jsx`) |
| 스타일 | 순수 CSS (CSS 변수) | `index.css` 공통 테마, `landing.css` 랜딩 전용 |
| 사운드 | Web Audio API + mp3 | 타격·타건·뽑기 효과음 |
| 드래그 | Pointer Events API | 내 방 오브제 자유 배치 (마우스·터치 공통) |
| 린트 | oxlint | 코드 검사 |
| 배포 | GitHub Actions + GitHub Pages | `.github/workflows/deploy-pages.yml` |

---

## 3. 실행 방법

```bash
git clone https://github.com/JunsCreuel/Poppin-Room.git
cd Poppin-Room
npm install
npm run dev       # 개발 서버 http://localhost:5173
npm run build     # 프로덕션 빌드 → dist/
npm run preview   # 빌드 결과 미리보기
npm run lint      # 린트
```

---

## 4. 폴더 구조

```
Poppin-Room/
├─ .github/workflows/deploy-pages.yml   # GitHub Pages 자동 배포
├─ index.html                 # 앱 HTML 뼈대
├─ vite.config.js             # Vite 설정 (상대 경로 빌드)
├─ public/
│  ├─ images/                 # 왁뿌볼·키캡·히든·캡슐머신 이미지
│  └─ sounds/                 # 키캡 타건 mp3
└─ src/
   ├─ main.jsx                # 진입점
   ├─ App.jsx                 # 라우팅, 공통 헤더
   ├─ index.css               # 공통 스타일 + POPPIN ROOM 테마
   ├─ landing.css             # 랜딩 페이지 스타일
   ├─ pages/                  # 화면 단위 컴포넌트
   │  ├─ Landing.jsx          # 랜딩 (첫 화면)
   │  ├─ Wakpuball.jsx        # 왁뿌볼 룸
   │  ├─ Keycap.jsx           # 키캡 룸
   │  ├─ Gacha.jsx            # 뽑기
   │  ├─ Collection.jsx       # 컬렉션 (내 방 + 가방)
   │  ├─ Secret.jsx           # 시크릿 룸 입구
   │  ├─ HiddenWakpuball.jsx  # 히든 왁뿌볼 룸
   │  ├─ HiddenKeycap.jsx     # 히든 키캡 룸
   │  ├─ Shop.jsx             # 상점 & 랭킹
   │  └─ MyAccount.jsx        # 내 계정
   ├─ components/             # 재사용 컴포넌트
   │  ├─ RoomStage.jsx        # 내 방 드래그 배치
   │  ├─ WakpuStage.jsx       # 왁뿌볼 타격·파괴 연출
   │  ├─ CrackOverlay.jsx     # 금가는 오버레이
   │  ├─ CapsuleMachine.jsx   # 캡슐머신·뽑기 결과
   │  ├─ DesignPicker.jsx     # 룸 안 디자인 변경
   │  ├─ HiddenGauge.jsx      # 히든 룸 시도 횟수 게이지
   │  ├─ RewardEffects.jsx    # 코인 토스트·히든카드 모달
   │  └─ ToyCard.jsx          # 오브제 카드
   ├─ store/
   │  └─ useGame.jsx          # 전역 게임 상태 (코인·보유·장착·히든카드·내 방)
   ├─ data/
   │  ├─ toys.json            # 오브제 36종 데이터
   │  └─ crackStages.js       # 금가는 단계 이미지 자리
   └─ utils/
      ├─ sound.js             # 효과음
      ├─ volume.js            # 음량 설정
      └─ useRewardEffects.js  # 보상 연출 훅
```

---

## 5. 화면 및 기능

| 화면 | 경로 | 기능 | 주요 파일 |
|---|---|---|---|
| 랜딩 | `/` | 브랜드 소개, 시작하기 → 6개 플레이 모드 카드, 실시간 통계(깬 횟수·오브제·히든카드) | `Landing.jsx`, `landing.css` |
| 왁뿌볼 룸 | `/wakpuball` | 연타로 파괴, 진행도에 따라 금·왁스 연출, 칠 때마다 코인 굴림, 디자인 변경 | `Wakpuball.jsx`, `WakpuStage.jsx`, `CrackOverlay.jsx` |
| 키캡 룸 | `/keycap` | 보유 디자인별 키 1개씩, 누르면 장착 + 고유 사운드 + 코인, ESC 키 지원, ASMR 토글 | `Keycap.jsx`, `sound.js` |
| 뽑기 | `/gacha` | 코인 10개로 유료 등급 랜덤 1개, 중복 시 30% 환급, 광고 보고 5코인(mock) | `Gacha.jsx`, `CapsuleMachine.jsx` |
| 컬렉션 | `/collection` | 내 방(최대 6개, 드래그 자유 배치, × 회수) + 가방(보유 오브제, 장착/방에 놓기) + 미획득 목록 | `Collection.jsx`, `RoomStage.jsx` |
| 시크릿 룸 | `/secret` | 히든 왁뿌볼/키캡 룸 입구 (진입 조건 미정) | `Secret.jsx` |
| 히든 룸 | `/hidden/wakpuball`, `/hidden/keycap` | 코인 없이 0.6% 확률 히든카드, 하루 40회(광고로 최대 60회), 24시간 롤링 리셋 | `HiddenWakpuball.jsx`, `HiddenKeycap.jsx`, `HiddenGauge.jsx` |
| 상점 & 랭킹 | `/shop` | 프리미엄 오브제 구매(mock), 오늘 깬 횟수 기준 상위 N% 랭킹, 결과 카드 PNG 저장 | `Shop.jsx` |
| 내 계정 | `/account` | 카카오/Google 로그인(mock), 코인·히든카드·프리미엄 내역, 진행 상황 초기화 | `MyAccount.jsx` |

옛 주소 `/store`, `/ranking`은 `/shop`으로, `/lab`은 `/`로 리다이렉트됩니다.

---

## 6. 게임 규칙

### 오브제 등급
| tier | 배지 | 획득 방법 | 수량 |
|---|---|---|---|
| free | COMMON | 처음부터 보유 | 왁뿌볼 3 · 키캡 3 |
| paid | RARE | 뽑기 (코인 10개) | 왁뿌볼 13 · 키캡 13 |
| premium | LIMITED | 상점 구매 (₩2,900~3,900, mock) | 왁뿌볼 2 · 키캡 2 |

### 코인
- 왁뿌볼 타격·키캡 타건 1회마다 굴림: 35% 확률 1코인, 5% 확률 5코인
- 뽑기 1회 10코인, 이미 보유한 오브제가 나오면 3코인 환급
- 광고 시청 시 5코인 (mock)

### 히든카드
- 히든 룸에서만 획득 가능, 누를 때마다 0.6%
- 하루 40회, 광고 1편당 20회 추가(최대 60회), 첫 시도로부터 24시간 뒤 리셋
- 획득 시 코드 발급, 내 계정에 보관

### 내 방
- 가방(보유 오브제)에서 골라 최대 6개 배치
- 드래그로 자유 이동, 위치는 방 기준 % 좌표로 저장되어 화면 크기가 달라도 유지
- × 버튼으로 가방 회수

---

## 7. 데이터 구조

### `src/data/toys.json`
오브제 한 개 = 아래 필드. 항목을 추가하면 코드 수정 없이 뽑기·도감·상점에 반영됩니다.

| 필드 | 설명 |
|---|---|
| `id` | `wb_01`, `kc_01` 형식 |
| `name` | 표시 이름 |
| `grade` | `common` / `rare` / `limited` (배지) |
| `tier` | `free` / `paid` / `premium` (획득 방법) |
| `image` | `images/…png` |
| `accent`, `filter`, `isHolo` | 색·필터·홀로그램 연출 |
| `hitsToBreak`, `crackPattern` | 왁뿌볼 파괴 횟수·금 패턴 |
| `sound` | 키캡 mp3 경로 (없으면 합성음) |
| `price` | premium 가격(원) |

### localStorage (`poppinroom-state`)
`coins`, `owned`, `equipped`, `hiddenCards`, `room[{id,x,y}]`, `dailyBreaks`, `totalBreaks`, `dailyKeyCoins`, `hiddenAttempts`, `hiddenCap`, `hiddenCycleStart`, `loggedIn`

---

## 8. 역할 분담 및 AI 활용

바이브 코딩(Claude Code)으로 진행했습니다. 사람이 기획·디자인·검수를 맡고, 코드 작성의 상당 부분은 AI가 담당했습니다. 각 영역의 AI 개입 정도를 아래에 표기합니다.

| 영역 | 담당 | 구현 방식 | AI 개입 |
|---|---|---|---|
| 브랜드 네이밍 (POPPIN ROOM) | 팀 전체 | 회의로 결정 | 없음 |
| 랜딩 페이지 디자인·마크업 | 김민지 | HTML/CSS 직접 작성 (초안) | 없음 |
| 랜딩을 앱 첫 화면으로 통합 | 박준성 | 초안 HTML/CSS → React 컴포넌트 변환, 라우팅 연결 | 코드 전부 AI, 사람이 흐름 지시·검수 |
| 화면 흐름 설계 (시작하기 → 6개 카드 → 각 기능) | 박준성 | 기획 후 AI에게 지시 | 없음 (기획) |
| 왁뿌볼·키캡·뽑기·히든 룸 게임 로직 | 박준성 | React + Web Audio | 코드 전부 AI, 규칙(확률·비용·제한)은 사람이 결정 |
| 상점 + 랭킹 통합 | 박준성 | 두 페이지를 하나로 합침 | 코드 AI |
| 키캡 룸 디자인별 1키 배치 | 박준성 | 기존 8칸 KEY-DECK 재구성 | 코드 AI |
| 컬렉션 = 가방 + 내 방 (드래그 배치) | 박준성 | Pointer Events, % 좌표 저장, 옛 형식 마이그레이션 | 코드 전부 AI, 요구사항은 사람 |
| 앱 전체 디자인 시스템 (랜딩 톤 통일) | 박준성 | CSS 변수 토큰 + 테마 오버라이드 | 코드 AI, 방향("랜딩 감성 유지")은 사람 |
| 저장소 정리 (옛 CSL LAB 삭제, 브랜치 통합, Pages 배포) | 박준성 | git, GitHub Actions | AI가 실행, 사람이 결정 |
| 이미지·사운드 에셋 | 팀 | 렌더 이미지, 녹음 파일 제공 | 없음 |
| 테스트·검증 | 박준성 | Playwright로 화면 스크린샷·동작 확인 | AI 실행, 사람이 결과 확인 |

표기 기준: **없음** = 사람이 직접 / **코드 AI** = AI가 코드 작성, 사람이 요구사항 정의와 결과 검수 / **AI 실행** = AI가 작업 수행, 사람이 지시·확인

---

## 9. 미구현 및 다음 단계

| 항목 | 상태 |
|---|---|
| 시크릿 룸 진입 조건 | 미정 — 조건 확정 후 `Secret.jsx`에 잠금 처리 |
| 로그인 (카카오/Google OAuth) | mock — 버튼만 동작 |
| 프리미엄 결제 | mock — 즉시 지급 |
| 광고 SDK | mock — 즉시 보상 |
| 랭킹 서버 | 없음 — 깬 횟수로 상위 % 시뮬레이션 (`calcRankPercentile`) |
| 룸 데코·시크릿 박스 상점 품목 | 없음 — 랜딩 문구에만 언급 |
| 왁뿌볼 단계별 파손 사진 | 자리만 있음 (`crackStages.js`), 사진 오면 경로만 채우기 |
| 키캡 실제 녹음 사운드 | 파일은 `public/sounds/`에 있음, 클릭 1회 길이로 트리밍 후 `toys.json`의 `sound`에 연결 |
