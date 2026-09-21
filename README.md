# POPPIN ROOM (포핀룸)

> 누르고, 터뜨리고, 모으는 나만의 오브제 룸 — 디지털 토이 컬렉션 웹앱

1조 그룹프로젝트. 팝볼을 터뜨리고 키캡을 두드려 코인을 모으고, 뽑기와 상점으로 오브제를 수집하는 스트레스 해소 앱입니다.

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 서비스명 | POPPIN ROOM (포핀룸) |
| 형태 | 모바일 우선 반응형 웹앱 (SPA) |
| 핵심 루프 | 누르기(팝볼·키캡) → 코인 획득 → 뽑기·구매로 오브제 수집 → 컬렉션 완성 |
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
| 사운드 | Web Audio API + mp3 | 타격·타건·뽑기 효과음, 첫 탭에서 모바일 오디오 언락(iOS 무음 스위치 무시, 컨텍스트 resume 후 재생) |
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

# 팝볼 크랙 프레임 등록 (PNG → WebP, 프레임 수 = 등급별 타격 수 10/15/20/20, 01부터 빠짐없이)
pip install pillow
python3 scripts/import_crack_frames.py <압축 푼 폴더> basic-pink=wb_01 swirl-spark=wb_02 marble=wb_03
```

---

## 4. 폴더 구조

```
Poppin-Room/
├─ .github/workflows/deploy-pages.yml   # GitHub Pages 자동 배포
├─ index.html                 # 앱 HTML 뼈대
├─ vite.config.js             # Vite 설정 (상대 경로 빌드)
├─ scripts/
│  └─ import_crack_frames.py  # 크랙 프레임 PNG → WebP 변환·toys.json 등록
├─ public/
│  ├─ images/                 # 팝볼·키캡·히든·캡슐머신 이미지
│  │  └─ crack/<id>/          # 팝볼 크랙 프레임 01~NN.webp (타격당 1장)
│  └─ sounds/                 # 키캡 타건 mp3
└─ src/
   ├─ main.jsx                # 진입점
   ├─ App.jsx                 # 라우팅, 공통 헤더
   ├─ index.css               # 공통 스타일 + POPPIN ROOM 테마
   ├─ landing.css             # 랜딩 페이지 스타일
   ├─ pages/                  # 화면 단위 컴포넌트
   │  ├─ Landing.jsx          # 랜딩 (첫 화면)
   │  ├─ Wakpuball.jsx        # 팝볼 룸
   │  ├─ Keycap.jsx           # 키캡 룸
   │  ├─ Gacha.jsx            # 뽑기
   │  ├─ Collection.jsx       # 컬렉션 (가방)
   │  ├─ Secret.jsx           # 시크릿 룸 입구
   │  ├─ HiddenWakpuball.jsx  # 히든 팝볼 룸
   │  ├─ HiddenKeycap.jsx     # 히든 키캡 룸
   │  ├─ Shop.jsx             # 상점 & 랭킹
   │  └─ MyAccount.jsx        # 내 계정
   ├─ components/             # 재사용 컴포넌트
   │  ├─ WakpuStage.jsx       # 팝볼 타격·파괴 연출
   │  ├─ CapsuleMachine.jsx   # 캡슐머신·뽑기 결과
   │  ├─ DesignPicker.jsx     # 룸 안 디자인 변경
   │  ├─ SecretDraw.jsx       # 시크릿 룸 카드 뽑기(흔들림 → 카드)
   │  ├─ RewardEffects.jsx    # 코인 토스트·히든카드 모달
   │  └─ ToyCard.jsx          # 오브제 카드
   ├─ store/
   │  └─ useGame.jsx          # 전역 게임 상태 (코인·보유·장착·히든카드)
   ├─ data/
   │  ├─ toys.json            # 오브제 52종 데이터(팝볼 18 · 키캡 34)
   │  ├─ gradeOdds.js         # 뽑기 등급 가중치·확률 계산
   │  └─ crackFrames.js       # 크랙 프레임 경로 헬퍼
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
| 팝볼 룸 | `/wakpuball` | 연타로 파괴, 타격마다 크랙 프레임 전환(프레임 있는 오브제), 칠 때마다 코인 굴림, 디자인 변경 | `Wakpuball.jsx`, `WakpuStage.jsx`, `crackFrames.js` |
| 키캡 룸 | `/keycap` | 보유 디자인별 키 1개씩, 누르면 장착 + 고유 사운드 + 코인, ESC 키 지원, ASMR 토글 | `Keycap.jsx`, `sound.js` |
| 뽑기 | `/gacha` | 코인 200개로 유료 등급 랜덤 1개, 중복 시 30% 환급, 광고 보고 5코인(mock) | `Gacha.jsx`, `CapsuleMachine.jsx` |
| 컬렉션 | `/collection` | 팝볼/키캡 탭 → COMMON/RARE/PREMIUM/LIMITED 등급 탭별로 보유 오브제(장착) + 미획득 목록 | `Collection.jsx` |
| 시크릿 룸 | `/secret` | 시크릿 키 1개 = 히든 팝볼 룸 또는 히든 키캡 룸 중 하나 1회 입장, 키 없으면 잠김 | `Secret.jsx` |
| 히든 룸 | `/hidden/wakpuball`, `/hidden/keycap` | 입장 후 클릭 1번 → 흔들림 → 카드 1장 (100코인 10% / 200코인 5% / 500코인 1% / 키 5개 0.5% / 히든카드 0.01% / 나머지 50코인, 꽝 없음), 입장권 없이 접근 시 시크릿 입구로 | `HiddenWakpuball.jsx`, `HiddenKeycap.jsx`, `SecretDraw.jsx` |
| 상점 & 랭킹 | `/shop` | 코인 상점(시크릿 키 300코인, 광고 보고 키 받기 하루 3개), 프리미엄 오브제 구매(mock), 오늘 깬 횟수 기준 상위 N% 랭킹, 결과 카드 PNG 저장 | `Shop.jsx` |
| 내 계정 | `/account` | 카카오/Google 로그인(mock), 코인·히든카드·프리미엄 내역, 진행 상황 초기화 | `MyAccount.jsx` |

옛 주소 `/store`, `/ranking`은 `/shop`으로, `/lab`은 `/`로 리다이렉트됩니다.

---

## 6. 게임 규칙

### 오브제 등급
등급(배지)과 tier(획득 방법)는 서로 다른 축. RARE·LIMITED는 둘 다 뽑기(tier=paid)에서 나오지만 확률이 다르고, PREMIUM만 상점(tier=premium) 전용.

| grade | tier | 획득 방법 | 수량 | 팝볼 파괴 타격 수 |
|---|---|---|---|---|
| COMMON | free | 처음부터 보유 | 팝볼 3 · 키캡 6 | 10회 |
| RARE | paid | 뽑기 (코인 200개, 일반 확률) | 팝볼 11 · 키캡 18 | 15회 |
| PREMIUM | premium | 상점 구매 (₩2,900~3,400, mock) | 팝볼 2 · 키캡 4 | 20회 |
| LIMITED | paid | 뽑기 (코인 200개, 극악 확률 — 합산 팝볼 0.9% · 키캡 1.6%) | 팝볼 2 · 키캡 6 | 20회 |

팝볼 파괴 타격 수는 등급 기준 통일(키캡 게이지는 오브제와 무관하게 동일 적용). 뽑기 확률 계산은 `src/data/gradeOdds.js`, 화면 표시는 `/gacha`에서 실제 값 그대로 확인 가능.

### 코인
- 팝볼 타격·키캡 타건 1회마다 굴림: 35% 확률 1코인, 5% 확률 5코인
- 뽑기 1회 200코인, 이미 보유한 오브제가 나오면 60코인 환급
- 광고 시청 시 5코인 (mock)

### 시크릿 키
- 획득: 상점 300코인 구매 / 광고 보고 받기 하루 최대 3개(mock) / 팝볼·키캡 타격 1회마다 0.06% 확률로 코인 대신 드롭
- 사용: 키 1개 = 히든 팝볼 룸 또는 히든 키캡 룸 중 하나 1회 입장(입장권), 키 없으면 시크릿 룸 잠김

### 시크릿 룸 카드
- 입장 후 오브제를 한 번 클릭 → 1.2초 흔들림 → 카드 1장, 입장권 소모
- 확률: 100코인 10% / 200코인 5% / 500코인 1% / 시크릿 키 5개 0.5% / 히든카드 0.01% / 나머지 83.49%는 50코인 (꽝 없음)
- 히든카드는 코드 발급 후 내 계정에 보관

---

## 7. 데이터 구조

### `src/data/toys.json`
오브제 한 개 = 아래 필드. 항목을 추가하면 코드 수정 없이 뽑기·도감·상점에 반영됩니다.

| 필드 | 설명 |
|---|---|
| `id` | `wb_01`, `kc_01` 형식 |
| `name` | 표시 이름 |
| `grade` | `common` / `rare` / `premium` / `limited` (배지, tier와 별도 축) |
| `tier` | `free` / `paid` / `premium` (획득 방법) |
| `image` | `images/…png` |
| `accent`, `filter`, `isHolo` | 색·필터·홀로그램 연출 |
| `hitsToBreak`, `crackPattern` | 팝볼 파괴 횟수·금 패턴 |
| `crackFrames` | `{ dir, count }` 팝볼 크랙 프레임 폴더·장수, 없으면 고정 이미지 + 조각 파편 연출 |
| `hitSound` | 팝볼 타격 녹음 경로(`sounds/…wav`), 없으면 합성 크런치음 — 현재 프리미엄 2종(네온 블랙·홀로그램 젬) |
| `sound` | 키캡 타건 녹음 경로(`sounds/…wav`), 없으면 합성 클릭음 — 현재 프리미엄 4종 |
| `price` | premium 가격(원) |

### localStorage (`poppinroom-state`)
`coins`, `owned`, `equipped`, `hiddenCards`, `secretKeys`, `secretEntry`, `dailyAdKeys`, `dailyBreaks`, `totalBreaks`, `dailyKeyCoins`, `loggedIn`

### 팝볼 디자인 (18종)
| id | 이름 | 등급 | 설명 |
|---|---|---|---|
| wb_01 | 베이직 핑크 | COMMON | 기본 핑크 왁스, 무광 표면 |
| wb_02 | 스월 스파클 | COMMON | 소용돌이 무늬, 반짝임 입자 |
| wb_03 | 마블 스트레스볼 | COMMON | 대리석 무늬 |
| wb_04 | 버블 젤리 | RARE | 투명 젤리, 기포 무늬 |
| wb_05 | 선더 크랙 | RARE | 그레이 톤, 번개 균열 무늬 |
| wb_06 | 스타 오브 | LIMITED | 진한 핑크, 별 각인 — 뽑기 극악 확률 |
| wb_07 | 네온 블랙 | PREMIUM | 블랙 바탕, 네온 라인 — 상점 전용 |
| wb_08 | 홀로그램 젬 | PREMIUM | 보라 홀로그램, 보석 컷 — 상점 전용 |
| wb_banana | 바나나 | RARE | 바나나 모양·색 |
| wb_watermelon | 수박 | RARE | 수박 모양·색 |
| wb_grape | 포도 | RARE | 포도 모양·색 |
| wb_mango | 망고 | RARE | 망고 모양·색 |
| wb_lemon | 레몬 | RARE | 레몬 모양·색 |
| wb_peach | 복숭아 | RARE | 복숭아 모양·색 |
| wb_donut | 민트 도넛 | RARE | 민트색 도넛 모양 |
| wb_popsicle | 블루 소다바 | RARE | 파란 소다맛 아이스바 모양 |
| wb_pudding | 카라멜 푸딩 | RARE | 카라멜 푸딩 모양 |
| wb_shell | 라벤더 조개 | LIMITED | 라벤더색 조개 모양 — 뽑기 극악 확률 |

### 키캡 디자인 (34종)
| id | 이름 | 등급 | 설명 |
|---|---|---|---|
| kc_01 | 베이직 핑크 | COMMON | 기본 핑크 키캡 |
| kc_02 | 펄 화이트 | COMMON | 진주빛 화이트 |
| kc_03 | 스모크 클리어 | COMMON | 투명 스모크 톤 |
| kc_04 | 라이트닝 실버 | LIMITED | 은색, 번개 무늬 — 뽑기 극악 확률 |
| kc_05 | 핑크 플라워 | LIMITED | 핑크 꽃무늬 — 뽑기 극악 확률 |
| kc_06 | 블랙 오브 | LIMITED | 블랙 구체형 캡 — 뽑기 극악 확률 |
| kc_07 | 선더 크리스탈 | PREMIUM | 홀로그램 크리스탈, 번개 각인 — 상점 전용 |
| kc_08 | 쥬얼 블룸 | PREMIUM | 보석·꽃 장식 — 상점 전용 |
| kc_banana | 바나나 | RARE | 바나나 모양·색 |
| kc_watermelon | 수박 | RARE | 수박 모양·색 |
| kc_grape | 포도 | RARE | 포도 모양·색 |
| kc_mango | 망고 | RARE | 망고 모양·색 |
| kc_lemon | 레몬 | RARE | 레몬 모양·색 |
| kc_peach | 복숭아 | RARE | 복숭아 모양·색 |
| kc_donut | 민트 도넛 | RARE | 민트색 도넛 모양 |
| kc_popsicle | 블루 소다바 | RARE | 파란 소다맛 아이스바 모양 |
| kc_pudding | 카라멜 푸딩 | RARE | 카라멜 푸딩 모양 |
| kc_shell | 라벤더 조개 | LIMITED | 라벤더색 조개 모양 — 뽑기 극악 확률 |
| kc_honey | 허니 드립 | RARE | 꿀 흐르는 무늬 |
| kc_marshmallow | 마시멜로 스트라이프 | RARE | 마시멜로 줄무늬 |
| kc_holostar | 홀로그램 스타더스트 | PREMIUM | 홀로그램 별가루 무늬 — 상점 전용 |
| kc_silveresc | 실버 이스케이프 | COMMON | 은색, ESC 키 각인 |
| kc_hotpink_gloss | 핫핑크 글로시 | RARE | 핫핑크 광택 |
| kc_asterisk | 화이트 아스크 | COMMON | 화이트, 별표(*) 각인 |
| kc_caramel_drizzle | 캐러멜 드리즐 | RARE | 캐러멜 드리즐 무늬 |
| kc_glass | 클리어 글래스 | LIMITED | 투명 유리 질감 — 뽑기 극악 확률 |
| kc_tangerine | 탠저린 젤리 | RARE | 탠저린 젤리 색 |
| kc_smoke_crimson | 스모크 크림슨 | COMMON | 진홍 스모크 톤 |
| kc_pink_geode | 핑크 지오드 | LIMITED | 핑크 지오드(광물) 무늬 — 뽑기 극악 확률 |
| kc_lavender_cushion | 라벤더 쿠션 | RARE | 라벤더색 쿠션형 |
| kc_forest_fur | 포레스트 퍼 | RARE | 포레스트 톤, 퍼(털) 질감 |
| kc_hotpink_fur | 핫핑크 퍼 | RARE | 핫핑크 퍼(털) 질감 |
| kc_puffer | 퍼퍼 재킷 | RARE | 퍼퍼재킷 누빔 질감 |
| kc_lightning | 라이트닝 글로우 | PREMIUM | 홀로그램, 번개 글로우 — 상점 전용 |

---

## 8. 역할 분담 및 AI 활용

바이브 코딩(Claude Code)으로 진행했습니다. 사람이 기획·디자인·검수를 맡고, 코드 작성의 상당 부분은 AI가 담당했습니다. 각 영역의 AI 개입 정도를 아래에 표기합니다.

| 영역 | 담당 | 구현 방식 | AI 개입 |
|---|---|---|---|
| 브랜드 네이밍 (POPPIN ROOM) | 팀 전체 | 회의로 결정 | 없음 |
| 랜딩 페이지 디자인·마크업 | 김민지 | HTML/CSS 직접 작성 (초안) | 없음 |
| 랜딩을 앱 첫 화면으로 통합 | 박준성 | 초안 HTML/CSS → React 컴포넌트 변환, 라우팅 연결 | 코드 전부 AI, 사람이 흐름 지시·검수 |
| 화면 흐름 설계 (시작하기 → 6개 카드 → 각 기능) | 박준성 | 기획 후 AI에게 지시 | 없음 (기획) |
| 팝볼·키캡·뽑기·히든 룸 게임 로직 | 박준성 | React + Web Audio | 코드 전부 AI, 규칙(확률·비용·제한)은 사람이 결정 |
| 상점 + 랭킹 통합 | 박준성 | 두 페이지를 하나로 합침 | 코드 AI |
| 키캡 룸 디자인별 1키 배치 | 박준성 | 기존 8칸 KEY-DECK 재구성 | 코드 AI |
| 컬렉션 = 가방 (보유 오브제 확인·장착) | 박준성 | 도감형 그리드, 미획득 목록 | 코드 전부 AI, 요구사항은 사람 |
| 앱 전체 디자인 시스템 (랜딩 톤 통일) | 박준성 | CSS 변수 토큰 + 테마 오버라이드 | 코드 AI, 방향("랜딩 감성 유지")은 사람 |
| 저장소 정리 (옛 CSL LAB 삭제, 브랜치 통합, Pages 배포) | 박준성 | git, GitHub Actions | AI가 실행, 사람이 결정 |
| 이미지·사운드 에셋 | 팀 | 렌더 이미지, 녹음 파일 제공 | 없음 |
| 테스트·검증 | 박준성 | Playwright로 화면 스크린샷·동작 확인 | AI 실행, 사람이 결과 확인 |

표기 기준: **없음** = 사람이 직접 / **코드 AI** = AI가 코드 작성, 사람이 요구사항 정의와 결과 검수 / **AI 실행** = AI가 작업 수행, 사람이 지시·확인

---

## 9. 미구현 및 다음 단계

| 항목 | 상태 |
|---|---|
| 로그인 (카카오/Google OAuth) | mock — 버튼만 동작 |
| 프리미엄 결제 | mock — 즉시 지급 |
| 광고 SDK | mock — 코인·시크릿 키 즉시 보상 |
| 랭킹 서버 | 없음 — 깬 횟수로 상위 % 시뮬레이션 (`calcRankPercentile`) |
| 팝볼 단계별 파손 사진 | 완료 — 팝볼 18종 전부 크랙 프레임 적용(`public/images/crack/<id>/`), 새 디자인은 `scripts/import_crack_frames.py`로 추가 |
| 키캡 실제 녹음 사운드 | 프리미엄 4종은 `keycap-premium-click.wav` 적용. `public/sounds/keyboard-*.mp3` 6개(타이핑 녹음)는 아직 미연결 — 클릭 1회로 잘라 `toys.json`의 `sound`에 연결하면 됨 |
