# 라스트 리퓨지 (Last Refuge)

> **낮에는 짓고, 밤에는 살아남으세요.**
> 포스트 아포칼립스 도시 건설 시뮬레이션 — 브라우저에서 바로 플레이하세요.

[![Play Online](https://img.shields.io/badge/▶_Play_Online-Last_Refuge-4ade80?style=for-the-badge)](https://sigco3111.github.io/city-builder-survival/)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Three.js](https://img.shields.io/badge/Three.js-0.185-black?logo=three.js&logoColor=white)](https://threejs.org)
[![Korean](https://img.shields.io/badge/한글화-100%25-22c55e)](#)

---

## 📖 게임 소개

**라스트 리퓨지**는 종말 이후의 세계에서 살아남기 위해 식민지를 짓고 키워나가는 **브라우저 기반 도시 건설 시뮬레이션**입니다. 낮 동안에는 자원을 모아 식량·물·에너지를 확보하고, 밤에는 몰려오는 **좀비 떼로부터 살아남아야 합니다**.

원본은 이탈리아 개발자 [D590900](https://github.com/D590900)의 오픈소스 프로젝트 [city-builder-survival](https://github.com/D590900/city-builder-survival) (MIT License)을 한국어로 완전 한글이화한 포크입니다. Vite + Three.js로 빌드되었으며 **UI 프레임워크 없이** 풀스크린 WebGL 캔버스와 미니멀한 DOM 오버레이로 동작합니다.

---

## ✨ 핵심 특징

| | | |
|---|---|---|
| 🌅 **낮에는 건설, 밤에는 생존** | ⚙️ **6종 자원 경제** | 🌦️ **날씨·계절 시뮬** |
| 낮 동안 자원을 모아 식민지를 키우고, 어두워지면 방어선에서 좀비 떼를 막아내세요 | 식량·물·목재·금속·에너지·연료, 6자원을 관리하며 작업자를 건물에 배치합니다 | 맑음·비·폭풍·안개·폭염이 매일 바뀌며 채굴·에너지·전투에 영향을 줍니다 |
| 🌲 **자원 재생·연구 트리** | 🚧 **다층 방어 시스템** | 🗺️ **공유 가능한 맵 시드** |
| 벌목·식림·재활용 등 8단계 기술 트리로 건물을 해금하세요 | 목책·고철·벽돌·콘크리트 벽, 망루, 함정, 조명, 도로까지 조합하세요 | `seed #N` 라벨을 클릭해 같은 맵을 친구에게 공유하고 기록 경쟁 |
| 👷 **자동·수동 작업자 시스템** | 🏗️ **건물 업그레이드 (★3)** | 📦 **자동 저장·재개** |
| 자동 배정을 사용하거나 작업자 패널에서 +/−로 직접 관리하세요 | 각 건물을 최대 3단계까지 강화해 생산·피해·HP를 늘릴 수 있습니다 | 매 새벽 localStorage에 자동 저장되어 다음 접속에서 이어하기 |
| 🎵 **합성 사운드 (외부 파일 0)** | 📷 **입지 수율 시스템** | 🎓 **첫 실행 튜토리얼** |
| WebAudio로 합성한 효과음·환경음, 파일 의존성 0 | 우물·사냥·낚시·목장은 지형 근접도에 따라 효율이 달라집니다 | 6단계 가이드 카드로 첫 1일차를 차근차근 안내합니다 |

---

## 🎮 빠른 시작

### 라이브 데모 (1초 시작)

> **👉 [https://sigco3111.github.io/city-builder-survival/](https://sigco3111.github.io/city-builder-survival/)**

설치·로그인 없이 **모바일·데스크탑 브라우저에서 바로** 플레이할 수 있습니다. 새 게임은 자동으로 진행됩니다.

### 로컬 개발

```bash
# 저장소 클론
git clone https://github.com/sigco3111/city-builder-survival.git
cd city-builder-survival

# 의존성 설치 (Vite + Three.js + Vitest)
npm install

# 개발 서버 시작 (http://localhost:5173)
npm run dev

# 운영 빌드 → dist/
npm run build

# 빌드 미리보기
npm run preview

# 테스트 실행 (Vitest)
npm test
```

진행 상황은 매 새벽 자동으로 `localStorage`에 저장됩니다. 새 게임은 URL 끝에 `?new=1`을, 특정 맵 시드는 `?seed=N`을 추가하세요.

---

## 🕹️ 조작법

| 입력 | 동작 |
|---|---|
| `W A S D` / 방향키 | 카메라 이동 |
| 마우스 휠 | 줌 인/아웃 |
| `Q` / `E` | 카메라 90° 회전 |
| 좌클릭 | 선택한 건물 배치 (또는 철거 모드에서 건물 제거) |
| 좌드래그 | 벽·도로를 잡고 한 방향으로 연속 배치 |
| `R` | 배치 중 고스트 건물 회전 |
| 우클릭 / `ESC` | 배치 또는 철거 취소 |
| `Space` | 일시정지 / 재개 |
| `1` / `2` / `3` | 게임 속도 (1× / 2× / 3×) |
| 🔍 버튼 (HUD) | 우물·사냥·낚시·목장 입지 수율 오버레이 토글 |
| 🔄 버튼 (HUD) | 게임 재시작 (확인 다이얼로그) |
| `seed #N` 라벨 (우하단) | 현재 맵 공유 링크 클립보드 복사 |

---

## 🏗️ 빌드 메뉴 카테고리

> 모든 건물 이름·설명·툴팁이 **한국어**로 표시됩니다. 영문명도 괄호 안에 함께 표기됩니다.

| 카테고리 | 건물 | 용도 |
|---|---|---|
| 🏠 **주거** | 천막 · 판잣집 · 주택 | 생존자 수용 (침대) |
| 🥫 **식량·물** | 농장 · 텃밭 · 온실 · 빗물 수집기 · 우물 · 물탱크 · 사냥 오두막 · 낚시 오두막 · 목장 | 식량·물 생산 (일부 입지 효율) |
| 🪵 **자원** | 벌목장 · 식림장 · 고철 수거장 · 광산 · 제련소 · 정유소 · 차고 · 창고 | 목재·금속·연료 채굴·제조 |
| ⚡ **에너지** | 태양광 패널 · 태양광 발전소 · 풍력 터빈 · 발전기 · 전동 모터 · 축전지 | 에너지 생산·저장 |
| 🛡️ **방어** | 목책 · 고철 벽 · 벽돌 담장 · 콘크리트 벽 · 망루 · 저격포탑 · 야간 조명등 · 가로등 · 함정 지대 | 좀비 차단·자동 사격·효율 증가 |
| 🏛️ **기반시설** | 연구소 · 진료소 · 비상 무선 · 도로 | 연구·생존·신규 생존자 모집·물류 |

---

## 🌦️ 날씨 시스템

5가지 날씨가 매일 (맵 시드 + 일차) 기반으로 결정론적으로 등장합니다.

| 날씨 | 효과 |
|---|---|
| ☀️ **맑음** | 효과 없음 (기본) |
| 🌧️ **비** | 빗물 수집 ×2, 농장·풍력 ×1.25, 좀비 이동속도 감소 |
| ⛈️ **폭풍** | 빗물 수집 ×3, 풍력 ×2, 태양광 ×0.5, 타워 사거리 −25% |
| 🌫️ **안개** | 타워 사거리 −30% |
| 🔥 **폭염** | 갈증 ×1.5, 빗물 수집 ×0.25, 농장 ×0.75, 태양광 ×1.25 |

---

## 🔬 연구 트리

연구소(Lab)에서 생산되는 연구 포인트로 다음 8가지 기술을 잠금 해제할 수 있습니다:

| 기술 | 비용 | 효과 |
|---|---|---|
| 🌲 식림 (Forestry) | 10 | 식림장 해금 |
| 🔋 에너지 저장 (Energy Storage) | 15 | 축전지 해금 |
| ☀️ 고급 태양광 (Advanced Photovoltaics) | 15 | 태양광 발전소 해금 |
| ⛏️ 심층 채굴 (Deep Mining) | 20 | 광산 해금 |
| 📈 효율 (Efficiency) | 20 | 채굴 시설 +25% |
| 💊 의학 (Medicine) | 25 | 배고픔·갈증 증가 +30% 감소 |
| 🎯 사격학 (Ballistics) | 25 | 타워 피해 +50%, 사거리 +17%, 저격포탑 해금 |
| 🧱 철근 콘크리트 (Reinforced Concrete) | 25 | 콘크리트 벽 해금 |

---

## 🏛️ 아키텍처

```
src/
├── bootstrap.js          ← URL 파라미터 (?seed, ?new, ?autostart) 처리 + boot
├── main.js               ← 엔트리: 메인 루프 + UI 와이어링 + 게임오버 흐름
├── persistence.js        ← localStorage v4 세이브 + 최고 기록 (생존한 밤)
├── style.css             ← 전역 스타일
│
├── core/                 ← 렌더·씬·카메라·입력·낮/밤·파티클·사운드
│   ├── engine.js         ← Three.js 엔진 (renderer, scene)
│   ├── camera.js         ← isometric 카메라 (90° 회전)
│   ├── input.js          ← 키보드·마우스 입력 통합
│   ├── daynight.js       ← 낮·밤 라이팅 (새벽·황혼 트위라잇)
│   ├── fx.js             ← 파티클 이펙트 (총격·파괴·먼지·연기·날씨)
│   └── audio.js          ← WebAudio 합성 사운드 (외부 파일 0)
│
├── sim/                  ← DOM/three.js 의존성 0인 순수 시뮬레이션
│   ├── state.js          ← 게임 상태 (자원·건물·생존자·연구·평판)
│   ├── economy.js        ← 자원 균형·저장 용량·업그레이드 비용
│   ├── survivors.js      ← 배고픔·갈증·자동 작업자 배정·신규 모집·평판
│   ├── research.js       ← 연구 포인트 진행·잠금 해제·기술 트리
│   ├── extraction.js     ← 자원 노드 채굴·식림·입지 효율
│   ├── weather.js        ← 5종 날씨 + 수정자
│   ├── modifiers.js      ← 모든 모디파이어를 한 곳에 집계
│   ├── waves.js          ← 밤마다 점점 강해지는 좀비 웨이브
│   ├── repair.js         ← 건물 수리 시스템
│   └── trails.js         ← 생존자들이 닦아놓는 흙길 (물류 보너스)
│
├── world/                ← 그리드·맵 생성·3D 지형·오버레이·워커 비주얼
│   ├── grid.js           ← 논리 타일 그리드 (점유·함정·자원 노드)
│   ├── mapgen.js         ← 시드 기반 절차적 맵 생성
│   ├── terrain.js        ← 3D 지형 메시 (잔디·물·숲·길)
│   ├── overlay.js        ← 입지 수율 디스크 + 타워 사거리 링
│   └── workers.js        ← 건물 사이를 거니드는 3D 워커
│
├── buildings/            ← 건물 정의·배치·비주얼
│   ├── definitions.js    ← 32종 건물 정적 데이터 (한글 name/desc)
│   ├── placement.js      ← 고스트 배치·드래그 행·철거 환불
│   └── visuals.js        ← GLB 모델 로딩·HP 손상 틴트·ON/OFF 표시
│
├── zombies/              ← 좀비 매니저·경로 탐색·타워 전투
│   ├── zombie.js         ← 좀비 스폰·이동·애니메이션
│   ├── pathfinding.js    ← A*-스타일 그리드 경로 탐색
│   └── combat.js         ← 타워 사격·수비대·일일 균형 반영
│
├── ui/                   ← HUD·빌드 메뉴·인스펙터·패널·튜토리얼
│   ├── hud.js            ← 상단 바 (일차·낮/밤·자원·속도·패널 토글)
│   ├── buildmenu.js      ← 카테고리 탭 + 건물 버튼 + 비용 + 툴팁
│   ├── inspector.js      ← 우측 건물 상세 패널 (HP·생산·수리·업그레이드)
│   ├── laborpanel.js     ← 모든 작업자 슬롯 일괄 관리
│   ├── researchpanel.js  ← 기술 트리 카드
│   ├── screens.js        ← 타이틀·패배·확인 다이얼로그
│   ├── tutorial.js       ← 첫 실행 6단계 가이드
│   └── ui.css            ← UI 전용 스타일
│
├── game/                 ← 게임 흐름
│   └── phase-controller.js ← 낮/밤 전환 + 좀비 웨이브 + 일일 콜백
│
└── assets/               ← GLB 모델 로더 (manifest 기반)
    └── loader.js

tests/                    ← Vitest: 시뮬레이션·정의 단위 테스트 (DOM 의존성 0)
e2e/                      ← Playwright 엔드투엔드 (옵션)
```

---

## 💾 데이터 모델 (요약)

```javascript
// 게임 상태 (src/sim/state.js)
{
  day: 1,                  // 1부터 시작
  phase: 'day' | 'night',  // 낮/밤
  timeInPhase: 0,          // 현재 페이즈 진행 시간(초)
  mapSeed: 0,              // 맵 시드 (공유용)
  resources: { food, water, wood, metal, energy, fuel },  // 6종 자원
  caps: { ... },           // 기본 저장 한도 (건물 capBonus로 증가)
  survivors: [{ id, hunger, thirst, buildingId }],       // NPC
  buildings: [{ id, defId, x, z, w, h, hp, maxHp, workers, level, priority, ... }],
  weather: { current: 'clear' | 'rain' | 'storm' | 'fog' | 'heat' },
  researchPoints: 0,
  researched: [],          // 해금된 tech id 배열
  kills: 0,
  reputation: 0,           // 0~100: 생존자 모집률
}
```

---

## 📦 NPM 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | Vite 개발 서버 (`localhost:5173`) |
| `npm run build` | 프로덕션 빌드 (`dist/`) |
| `npm run preview` | 빌드된 결과 로컬 미리보기 |
| `npm test` | Vitest 단위 테스트 실행 |
| `npm run test:e2e` | Playwright 엔드투엔드 테스트 (옵션) |

---

## 🧪 테스트

```bash
# 시뮬레이션·정의 단위 테스트 (Vitest)
npm test

# 엔드투엔드 (Playwright, headless)
npm run test:e2e
```

`src/sim/`은 DOM·three.js 의존성이 0이라 Vitest로 빠르게 단위 테스트할 수 있습니다 (총 11+ 시나리오).

---

## 🎨 3D 모델 · 사운드 크레딧

3D 모델은 모두 **CC0 / CC-BY 3.0** 자산입니다:

- **Kenney** · [kenney.nl](https://kenney.nl) — CC0
- **KayKit** · [kaylousberg.itch.io/kaykit-medieval-builder-pack](https://kaylousberg.itch.io/kaykit-medieval-builder-pack) — CC0
- **Quaternius** · [quaternius.com](https://quaternius.com) — CC0

자세한 라이선스 정보는 [CREDITS.md](CREDITS.md)를 참고하세요. 모든 사운드는 WebAudio로 **실시간 합성**됩니다 — 외부 오디오 파일 의존성 0개.

---

## 🌐 한글화 노트

원본 [city-builder-survival](https://github.com/D590900/city-builder-survival)은 영어 + 이탈리아어 혼합 UI였습니다. 본 포크는 다음 원칙으로 **100% 한국어화**를 진행했습니다:

| 한글화 범위 | 파일 | 상태 |
|---|---|---|
| 32종 건물 `name` + `desc` | `src/buildings/definitions.js` | ✅ 완전 번역 |
| 8종 기술 `name` + `desc` | `src/sim/research.js` | ✅ 완전 번역 |
| 5종 날씨 `name` | `src/sim/weather.js` | ✅ 완전 번역 |
| 빌드 카테고리 (`Housing` 등) | `src/buildings/definitions.js` | ✅ 완전 번역 |
| HUD 자원·날씨·속도·버튼 툴팁 | `src/ui/hud.js` | ✅ 완전 번역 |
| 빌드 메뉴 툴팁 (생산/소비/작업자 등) | `src/ui/buildmenu.js` | ✅ 완전 번역 |
| 인스펙터 패널 (HP/작업자/수리/업그레이드) | `src/ui/inspector.js` | ✅ 완전 번역 |
| 작업자 패널 | `src/ui/laborpanel.js` | ✅ 완전 번역 |
| 연구 패널 (효과 %) | `src/ui/researchpanel.js` | ✅ 완전 번역 |
| 시작/패배/확인 화면 | `src/ui/screens.js` | ✅ 완전 번역 |
| 6단계 튜토리얼 | `src/ui/tutorial.js` | ✅ 완전 번역 |
| 토스트 메시지 (밤 알림 / 자원 고갈 / 나무 심기 등) | `src/main.js`, `src/game/phase-controller.js` | ✅ 완전 번역 |
| 페이지 `<title>` · 메타 description | `index.html` | ✅ 완전 번역 |

### 보존된 식별자 (한글화하지 않음)

- **건물 `id`** — `'hq'`, `'tent'`, `'well'`, `'farm'` 등 영문 코드 (코드 의존성 보존)
- **자원 키** — `'food'`, `'water'`, `'wood'`, `'metal'`, `'energy'`, `'fuel'`
- **날씨 ID** — `'clear'`, `'rain'`, `'storm'`, `'fog'`, `'heat'`
- **기술 ID** — `'forestry'`, `'batteries'`, `'solar2'` 등
- **내부 enum** — `phase: 'day' | 'night'`, `state: 'idle' | 'placing' | 'demolish'`
- **이벤트 타입** — `'build'`, `'depleted'`, `'planted'`, `'research'` 등
- **CSS 클래스** — `hud-top`, `build-menu`, `inspector` 등
- **localStorage 키** — `cbs-save`, `cbs-record`, `cbs-tutorial-seen`

식별자는 영문 그대로 두어 빌드·테스트·시드 호환성을 유지했습니다.

---

## 📄 라이선스

이 포크의 코드는 원본과 동일한 [MIT License](LICENSE) 하에 배포됩니다. 단, 3D 모델 자산은 각각의 라이선스(CC0 / CC-BY 3.0)를 따릅니다 — 자세한 내용과 작성자 표기는 [CREDITS.md](CREDITS.md)를 참고하세요.

원본 저작자: **[D590900](https://github.com/D590900)** ([city-builder-survival](https://github.com/D590900/city-builder-survival))

---

## 💡 팁

- **첫 번째 밤 전에** 본부(Refuge) 근처에 **벽 + 망루**를 최소 1개씩 세워 두면 안정적입니다.
- **우물**은 물 타일 근처에 지으면 +60% 효율, **사냥 오두막**은 숲 근처에서 +100% 효율입니다.
- **목장**의 가축은 농장에도 +15%, 채굴에도 +10% 보너스를 줍니다.
- **자원이 부족할 땐** 메뉴를 잠시 꺼서 좀비가 안 뚫고 들어오는지 확인하세요. ⚠️
- **맵 시드를 공유**해 친구와 같은 시작 조건에서 경쟁할 수 있습니다 — 우하단 `seed #N` 클릭으로 링크 복사.

행운을 빕니다. 🍀
