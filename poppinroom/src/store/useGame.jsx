// 게임 상태 저장소 — 코인, 보유/장착 오브제, 히든카드, 내 방 배치를 localStorage에 저장
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toysData from '../data/toys.json';

const STORAGE_KEY = 'poppinroom-state'; // 진행 상황 저장 키(localStorage)
const LEGACY_STORAGE_KEY = 'csl-gacha-state'; // 이름 변경 전 저장 키, 남아 있으면 읽어옴
const PULL_COST = 10; // 뽑기 1회당 코인 비용
const DUPLICATE_REFUND_RATIO = 0.3;
const KEY_DAILY_GOAL = 500; // 키캡 룸 "오늘의 타건 게이지" 표시 목표치(코인 기준)
const ROOM_SLOTS = 6; // 컬렉션 "내 방"에 동시에 놓을 수 있는 오브제 수
// 방에 새로 놓을 때의 기본 위치(방 기준 % 좌표), 비어 있는 자리부터 순서대로
const ROOM_PRESET_SPOTS = [
  { x: 50, y: 50 }, { x: 22, y: 30 }, { x: 78, y: 32 },
  { x: 24, y: 74 }, { x: 76, y: 74 }, { x: 50, y: 18 },
];

// 일반 왁뿌볼/키캡 룸에서 누를 때마다 굴리는 보상 확률 — 코인만 나온다.
// 히든카드는 히든 룸(HiddenWakpuball/HiddenKeycap) 전용.
const PRESS_REWARD = { coin5: 0.05, coin1: 0.35 };

// 히든 룸: 누를 때마다 0.6% 확률로 히든카드. 하루 40번까지 무료로 시도할
// 수 있고, 광고 1편(30초)당 20번씩 최대 60번까지 늘릴 수 있다. 그 날의
// 시도가 다 떨어지면 첫 시도로부터 24시간이 지나야 다시 40번으로 풀린다.
const HIDDEN_CHANCE = 0.006;
const HIDDEN_DAILY_BASE = 40;
const HIDDEN_DAILY_MAX = 60;
const HIDDEN_AD_BONUS = 20;
const HIDDEN_CYCLE_MS = 24 * 60 * 60 * 1000;

function freeOwnedIds() {
  const ids = [];
  for (const category of Object.keys(toysData)) {
    for (const toy of toysData[category]) {
      if (toy.tier === 'free') ids.push(toy.id);
    }
  }
  return ids;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function defaultState() {
  return {
    coins: 0,
    owned: freeOwnedIds(),
    equipped: { wakpuball: 'wb_01', keycap: 'kc_01' },
    hiddenCards: [], // { code, category, wonAt }
    loggedIn: false,
    loginProvider: null, // 'kakao' | 'google'
    dailyBreaks: 0, // 오늘 왁뿌볼을 완전히 깬 횟수 — 랭킹 계산에 사용
    totalBreaks: 0,
    dailyKeyCoins: 0, // 오늘 키캡 룸에서 적립한 코인 — 키캡 룸 상단 게이지 표시용
    lastVisit: todayStr(),
    hiddenAttempts: { wakpuball: 0, keycap: 0 }, // 히든 룸에서 오늘 시도한 횟수
    hiddenCap: { wakpuball: HIDDEN_DAILY_BASE, keycap: HIDDEN_DAILY_BASE }, // 광고로 최대 60까지 늘어남
    hiddenCycleStart: { wakpuball: null, keycap: null }, // 이번 24시간 주기가 시작된 시각(ms)
    room: [], // 내 방에 놓인 오브제 — { id, x, y } (x/y는 방 기준 0~100 % 좌표, 드래그로 이동)
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const merged = { ...defaultState(), ...parsed };
    // 날짜가 바뀌었으면 오늘 깬 횟수만 리셋(누적 총합은 유지).
    if (merged.lastVisit !== todayStr()) {
      merged.dailyBreaks = 0;
      merged.dailyKeyCoins = 0;
      merged.lastVisit = todayStr();
    }
    // 방 배치 정리 — 옛 형식(id 배열)은 좌표 형식으로 변환, 미보유·중복 제거, 최대 수 제한
    const rawRoom = Array.isArray(merged.room) ? merged.room : [];
    const seen = new Set();
    const room = [];
    rawRoom.forEach((entry, i) => {
      const item = typeof entry === 'string' ? { id: entry, ...ROOM_PRESET_SPOTS[i % ROOM_PRESET_SPOTS.length] } : entry;
      if (!item || !item.id || seen.has(item.id) || !merged.owned.includes(item.id)) return;
      seen.add(item.id);
      room.push({ id: item.id, x: clampPct(item.x, 50), y: clampPct(item.y, 50) });
    });
    merged.room = room.slice(0, ROOM_SLOTS);
    return merged;
  } catch {
    return defaultState();
  }
}

function clampPct(v, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(100, Math.max(0, n));
}

function rollPressReward() {
  const r = Math.random();
  if (r < PRESS_REWARD.coin5) return 'coin5';
  if (r < PRESS_REWARD.coin5 + PRESS_REWARD.coin1) return 'coin1';
  return null;
}

// 실제 다른 유저 데이터가 없어서(백엔드 없음) 오늘 깬 횟수를 그럴듯한
// 분포에 대입해 "상위 N%"를 계산하는 시뮬레이션 공식이다 — 진짜 랭킹
// 서버가 붙으면 이 함수를 API 응답으로 바꿔치기하면 된다. 많이 깰수록
// 지수적으로 상위(%가 작아짐)로 수렴.
export function calcRankPercentile(dailyBreaks) {
  const pct = 92 * Math.exp(-dailyBreaks / 14);
  return Math.max(1, Math.round(pct));
}

function makeHiddenCode(category) {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const prefix = category === 'wakpuball' ? 'WB' : 'KC';
  return `HIDDEN-${prefix}-${rand}`;
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // 왁뿌볼을 한 대 칠 때, 키캡을 한 번 누를 때마다 호출 — 코인 보상만 굴리고
  // 그 결과를 그대로 반환한다(화면에서 토스트 연출용). 히든카드는 여기서
  // 안 나온다 — 히든 룸(pressHidden) 전용.
  const pressReward = useCallback((category) => {
    const roll = rollPressReward();
    if (!roll) return null;

    const amount = roll === 'coin1' ? 1 : 5;
    let payload = null;
    setState((prev) => ({
      ...prev,
      coins: prev.coins + amount,
      dailyKeyCoins: category === 'keycap' ? prev.dailyKeyCoins + amount : prev.dailyKeyCoins,
    }));
    payload = { type: 'coin', amount };
    return payload;
  }, []);

  // 히든 왁뿌볼/키캡 룸 전용 — 코인은 전혀 안 나오고, 누를 때마다 0.6%
  // 확률로만 히든카드가 나온다. 하루 시도 횟수가 정해져 있어서(기본 40,
  // 광고로 최대 60) 다 쓰면 24시간이 지나야 다시 리셋된다.
  const pressHidden = useCallback((category) => {
    let payload = null;
    setState((prev) => {
      let attempts = prev.hiddenAttempts[category];
      let cap = prev.hiddenCap[category];
      let cycleStart = prev.hiddenCycleStart[category];

      // 마지막 주기가 시작된 지 24시간이 지났으면 그 카테고리만 리셋.
      if (cycleStart && Date.now() - cycleStart >= HIDDEN_CYCLE_MS) {
        attempts = 0;
        cap = HIDDEN_DAILY_BASE;
        cycleStart = null;
      }

      if (attempts >= cap) {
        // 오늘 시도 다 씀 — 롤오버 결과만 반영하고 시도 자체는 늘리지 않는다.
        return {
          ...prev,
          hiddenAttempts: { ...prev.hiddenAttempts, [category]: attempts },
          hiddenCap: { ...prev.hiddenCap, [category]: cap },
          hiddenCycleStart: { ...prev.hiddenCycleStart, [category]: cycleStart },
        };
      }

      const nextCycleStart = cycleStart ?? Date.now();
      let nextHiddenCards = prev.hiddenCards;
      if (Math.random() < HIDDEN_CHANCE) {
        const code = makeHiddenCode(category);
        const card = { code, category, wonAt: new Date().toISOString() };
        payload = { type: 'hidden', card };
        nextHiddenCards = [...prev.hiddenCards, card];
      }

      return {
        ...prev,
        hiddenAttempts: { ...prev.hiddenAttempts, [category]: attempts + 1 },
        hiddenCap: { ...prev.hiddenCap, [category]: cap },
        hiddenCycleStart: { ...prev.hiddenCycleStart, [category]: nextCycleStart },
        hiddenCards: nextHiddenCards,
      };
    });
    return payload;
  }, []);

  // 오늘 시도를 다 썼는지 판정 — 저장된 attempts/cap만 보면 24시간이 지나도
  // 계속 "다 썼음"으로 보이는 문제가 있어서, 마지막 주기 시작 시각 기준으로
  // 24시간이 지났으면(=다음 누름에서 실제로 리셋될 상태) 아직 안 막힌 걸로
  // 본다. HiddenGauge와 히든 룸 페이지(HiddenWakpuball/HiddenKeycap)가 공유.
  const isHiddenMaxed = useCallback(
    (category) => {
      const cap = state.hiddenCap[category];
      const attempts = state.hiddenAttempts[category];
      const cycleStart = state.hiddenCycleStart[category];
      const expired = cycleStart && Date.now() - cycleStart >= HIDDEN_CYCLE_MS;
      return !expired && attempts >= cap;
    },
    [state.hiddenAttempts, state.hiddenCap, state.hiddenCycleStart]
  );

  // 히든 룸에서 오늘 시도가 다 떨어졌을 때 광고 한 편(30초)을 보면 그
  // 카테고리의 오늘 한도를 20 늘려준다 (최대 60). 실제 광고 SDK가 없어서
  // UI 쪽(HiddenGauge.jsx)에서 재생되는 흉내만 낸 뒤 이 함수를 호출한다.
  const claimHiddenAdBoost = useCallback((category) => {
    let newCap = null;
    setState((prev) => {
      const cap = Math.min(HIDDEN_DAILY_MAX, prev.hiddenCap[category] + HIDDEN_AD_BONUS);
      newCap = cap;
      return { ...prev, hiddenCap: { ...prev.hiddenCap, [category]: cap } };
    });
    return newCap;
  }, []);

  // 광고 시청 보상 mock — 광고 SDK 연동 전까지 5코인 즉시 지급
  const claimAdCoins = useCallback(() => {
    setState((prev) => ({ ...prev, coins: prev.coins + 5 }));
    return 5;
  }, []);

  const canPull = useCallback(
    (category) => {
      const hasPaidLeft = toysData[category].some((t) => t.tier === 'paid');
      return hasPaidLeft && state.coins >= PULL_COST;
    },
    [state.coins]
  );

  // 뽑기: 코인 소비 -> 해당 카테고리의 '유료(paid)' 등급 중 랜덤 하나.
  // 이미 보유 중이면 코인 일부 환급.
  const pull = useCallback((category) => {
    let result = null;

    setState((prev) => {
      if (prev.coins < PULL_COST) return prev;

      const pool = toysData[category].filter((t) => t.tier === 'paid');
      const picked = pool[Math.floor(Math.random() * pool.length)];
      if (!picked) return prev;

      const isDuplicate = prev.owned.includes(picked.id);
      const refund = isDuplicate ? Math.round(PULL_COST * DUPLICATE_REFUND_RATIO) : 0;

      result = { toy: picked, category, isDuplicate };

      return {
        ...prev,
        coins: prev.coins - PULL_COST + refund,
        owned: isDuplicate ? prev.owned : [...prev.owned, picked.id],
      };
    });

    return result;
  }, []);

  // 프리미엄 구매 mock — 실제 결제 연동 전까지 즉시 보유 처리
  const purchasePremium = useCallback((category, id) => {
    let ok = false;
    setState((prev) => {
      if (prev.owned.includes(id)) { ok = true; return prev; }
      ok = true;
      return { ...prev, owned: [...prev.owned, id] };
    });
    return ok;
  }, []);

  // 왁뿌볼이 완전히 깨질 때마다 호출 — 오늘 깬 횟수를 쌓는다(랭킹 계산용).
  const recordBreak = useCallback(() => {
    setState((prev) => ({
      ...prev,
      dailyBreaks: prev.dailyBreaks + 1,
      totalBreaks: prev.totalBreaks + 1,
    }));
  }, []);

  const equip = useCallback((category, id) => {
    setState((prev) => ({
      ...prev,
      equipped: { ...prev.equipped, [category]: id },
    }));
  }, []);

  // 방에 놓기 — 보유 오브제만, 같은 오브제는 하나만, 최대 ROOM_SLOTS개
  const placeInRoom = useCallback((id) => {
    let ok = false;
    setState((prev) => {
      if (!prev.owned.includes(id) || prev.room.some((r) => r.id === id)) return prev;
      if (prev.room.length >= ROOM_SLOTS) return prev;
      const taken = (spot) => prev.room.some((r) => Math.abs(r.x - spot.x) < 12 && Math.abs(r.y - spot.y) < 12);
      const spot = ROOM_PRESET_SPOTS.find((sp) => !taken(sp)) || ROOM_PRESET_SPOTS[0];
      ok = true;
      return { ...prev, room: [...prev.room, { id, x: spot.x, y: spot.y }] };
    });
    return ok;
  }, []);

  // 방 안 위치 이동 — x/y는 방 기준 0~100 % 좌표
  const moveInRoom = useCallback((id, x, y) => {
    setState((prev) => {
      if (!prev.room.some((r) => r.id === id)) return prev;
      return {
        ...prev,
        room: prev.room.map((r) => (r.id === id ? { ...r, x: clampPct(x, r.x), y: clampPct(y, r.y) } : r)),
      };
    });
  }, []);

  const removeFromRoom = useCallback((id) => {
    setState((prev) => {
      if (!prev.room.some((r) => r.id === id)) return prev;
      return { ...prev, room: prev.room.filter((r) => r.id !== id) };
    });
  }, []);

  const getToy = useCallback((category, id) => {
    return toysData[category].find((t) => t.id === id) || null;
  }, []);

  // 로그인 mock — 실제 OAuth 연동 전까지 버튼만 동작
  const login = useCallback((provider) => {
    setState((prev) => ({ ...prev, loggedIn: true, loginProvider: provider }));
  }, []);

  const logout = useCallback(() => {
    setState((prev) => ({ ...prev, loggedIn: false, loginProvider: null }));
  }, []);

  // 진행 상황 초기화 — 처음 상태(무료 등급만 보유, 코인 0)로 되돌림, 복구 불가
  const resetProgress = useCallback(() => {
    setState(defaultState());
  }, []);

  const value = {
    coins: state.coins,
    owned: state.owned,
    equipped: state.equipped,
    hiddenCards: state.hiddenCards,
    loggedIn: state.loggedIn,
    loginProvider: state.loginProvider,
    dailyBreaks: state.dailyBreaks,
    totalBreaks: state.totalBreaks,
    dailyKeyCoins: state.dailyKeyCoins,
    hiddenAttempts: state.hiddenAttempts,
    hiddenCap: state.hiddenCap,
    hiddenCycleStart: state.hiddenCycleStart,
    room: state.room,
    roomSlots: ROOM_SLOTS,
    toys: toysData,
    pullCost: PULL_COST,
    keyDailyGoal: KEY_DAILY_GOAL,
    hiddenDailyMax: HIDDEN_DAILY_MAX,
    hiddenCycleMs: HIDDEN_CYCLE_MS,
    pressReward,
    pressHidden,
    isHiddenMaxed,
    claimHiddenAdBoost,
    claimAdCoins,
    canPull,
    pull,
    purchasePremium,
    equip,
    placeInRoom,
    moveInRoom,
    removeFromRoom,
    getToy,
    login,
    logout,
    recordBreak,
    resetProgress,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
