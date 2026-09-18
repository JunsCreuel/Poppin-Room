// 게임 상태 저장소 — 코인, 보유/장착 오브제, 히든카드를 localStorage에 저장
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toysData from '../data/toys.json';
import { weightedPick, computeGradeOdds } from '../data/gradeOdds';

const STORAGE_KEY = 'poppinroom-state'; // 진행 상황 저장 키(localStorage)
const LEGACY_STORAGE_KEY = 'csl-gacha-state'; // 이름 변경 전 저장 키, 남아 있으면 읽어옴
const PULL_COST = 200; // 뽑기 1회당 코인 비용
const DUPLICATE_REFUND_RATIO = 0.3;
const KEY_DAILY_GOAL = 500; // 키캡 룸 "오늘의 타건 게이지" 표시 목표치(코인 기준)
// 시크릿 키 — 상점에서 코인 구매 / 하루 3개까지 광고 시청 / 팝볼·키캡 타격 시 0.06% 드롭
// 키 1개 = 히든 팝볼 룸 또는 히든 키캡 룸 중 하나에 1회 입장
const SECRET_KEY_PRICE = 300;
const SECRET_KEY_DROP = 0.0006;
const AD_KEY_DAILY_MAX = 3;
// 시크릿 룸 카드 확률(%) — 위에서부터 순서대로 판정, 나머지는 기본 보상(SECRET_CARD_BASE) — 꽝 없음
const SECRET_CARD_TABLE = [
  { type: 'hidden', pct: 0.01 },
  { type: 'keys', amount: 5, pct: 0.5 },
  { type: 'coins', amount: 500, pct: 1 },
  { type: 'coins', amount: 200, pct: 5 },
  { type: 'coins', amount: 100, pct: 10 },
];
const SECRET_CARD_BASE = { type: 'coins', amount: 50 };

// 일반 팝볼/키캡 룸에서 누를 때마다 굴리는 보상 확률 — 코인만 나온다.
// 히든카드는 히든 룸(HiddenWakpuball/HiddenKeycap) 전용.
const PRESS_REWARD = { coin5: 0.05, coin1: 0.35 };


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
    dailyBreaks: 0, // 오늘 팝볼을 완전히 깬 횟수 — 랭킹 계산에 사용
    totalBreaks: 0,
    dailyKeyCoins: 0, // 오늘 키캡 룸에서 적립한 코인 — 키캡 룸 상단 게이지 표시용
    lastVisit: todayStr(),
    secretKeys: 0, // 보유 시크릿 키
    secretEntry: null, // 키로 입장한 시크릿 룸 — 'wakpuball' | 'keycap' | null (카드 뽑으면 소모)
    dailyAdKeys: 0, // 오늘 광고 보고 받은 시크릿 키 수 (하루 최대 3)
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
      merged.dailyAdKeys = 0;
      merged.lastVisit = todayStr();
    }
    delete merged.room;
    return merged;
  } catch {
    return defaultState();
  }
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

  // 팝볼을 한 대 칠 때, 키캡을 한 번 누를 때마다 호출 — 시크릿 키 드롭(0.06%)
  // 또는 코인 보상을 굴리고 결과를 반환한다(화면에서 토스트 연출용)
  const pressReward = useCallback((category) => {
    // 낮은 확률로 코인 대신 시크릿 키 드롭
    if (Math.random() < SECRET_KEY_DROP) {
      setState((prev) => ({ ...prev, secretKeys: prev.secretKeys + 1 }));
      return { type: 'key' };
    }

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

  // 광고 시청 보상 mock — 광고 SDK 연동 전까지 5코인 즉시 지급
  const claimAdCoins = useCallback(() => {
    setState((prev) => ({ ...prev, coins: prev.coins + 5 }));
    return 5;
  }, []);

  // 테스트용 코인 지급 — 시연·개발용 임시 기능, 출시 전 제거
  const addTestCoins = useCallback((amount) => {
    setState((prev) => ({ ...prev, coins: prev.coins + amount }));
  }, []);

  // 테스트용 시크릿 키 지급 — 시연·개발용 임시 기능, 출시 전 제거
  const addTestKeys = useCallback((amount) => {
    setState((prev) => ({ ...prev, secretKeys: prev.secretKeys + amount }));
  }, []);

  // 테스트용 전체 스킨 지급 — 시연·개발용 임시 기능, 출시 전 제거
  const addTestAllSkins = useCallback(() => {
    const allIds = Object.keys(toysData).flatMap((category) => toysData[category].map((t) => t.id));
    setState((prev) => ({ ...prev, owned: [...new Set([...prev.owned, ...allIds])] }));
  }, []);

  // 시크릿 키 구매 — 코인 차감
  const buySecretKey = useCallback(() => {
    let ok = false;
    setState((prev) => {
      if (prev.coins < SECRET_KEY_PRICE) return prev;
      ok = true;
      return { ...prev, coins: prev.coins - SECRET_KEY_PRICE, secretKeys: prev.secretKeys + 1 };
    });
    return ok;
  }, []);

  // 광고 보고 시크릿 키 받기 mock — 하루 최대 AD_KEY_DAILY_MAX개, 광고 SDK 연동 전까지 즉시 지급
  const claimAdKey = useCallback(() => {
    let ok = false;
    setState((prev) => {
      if (prev.dailyAdKeys >= AD_KEY_DAILY_MAX) return prev;
      ok = true;
      return { ...prev, dailyAdKeys: prev.dailyAdKeys + 1, secretKeys: prev.secretKeys + 1 };
    });
    return ok;
  }, []);

  // 시크릿 키 사용 — 키 1개 소모, 선택한 룸('wakpuball' | 'keycap') 1회 입장권 발급
  const enterSecretRoom = useCallback((category) => {
    let ok = false;
    setState((prev) => {
      if (prev.secretEntry) { ok = prev.secretEntry === category; return prev; }
      if (prev.secretKeys < 1) return prev;
      ok = true;
      return { ...prev, secretKeys: prev.secretKeys - 1, secretEntry: category };
    });
    return ok;
  }, []);

  // 시크릿 룸 카드 뽑기 — 입장권 소모, 확률표대로 보상 지급(꽝 없음, 기본 50코인), 결과 반환
  // { type: 'coins' | 'keys' | 'hidden', amount?, card? }
  const drawSecretCard = useCallback((category) => {
    let result = null;
    setState((prev) => {
      if (prev.secretEntry !== category) return prev;
      const r = Math.random() * 100;
      let acc = 0;
      let hit = null;
      for (const row of SECRET_CARD_TABLE) {
        acc += row.pct;
        if (r < acc) { hit = row; break; }
      }
      const next = { ...prev, secretEntry: null };
      if (!hit) hit = SECRET_CARD_BASE;
      if (hit.type === 'coins') {
        next.coins = prev.coins + hit.amount;
        result = { type: 'coins', amount: hit.amount };
      } else if (hit.type === 'keys') {
        next.secretKeys = prev.secretKeys + hit.amount;
        result = { type: 'keys', amount: hit.amount };
      } else {
        const card = { code: makeHiddenCode(category), category, wonAt: new Date().toISOString() };
        next.hiddenCards = [...prev.hiddenCards, card];
        result = { type: 'hidden', card };
      }
      return next;
    });
    return result;
  }, []);

  const canPull = useCallback(
    (category) => {
      const hasPaidLeft = toysData[category].some((t) => t.tier === 'paid');
      return hasPaidLeft && state.coins >= PULL_COST;
    },
    [state.coins]
  );

  // 뽑기 확률 표시용 — pull()과 같은 가중치를 써서 화면 표시가 실제 확률과 항상 일치
  const pullOdds = useCallback((category) => {
    const pool = toysData[category].filter((t) => t.tier === 'paid');
    return computeGradeOdds(pool);
  }, []);

  // 뽑기: 코인 소비 -> 해당 카테고리의 '유료(paid)' 등급 중 랜덤 하나.
  // 이미 보유 중이면 코인 일부 환급.
  const pull = useCallback((category) => {
    let result = null;

    setState((prev) => {
      if (prev.coins < PULL_COST) return prev;

      const pool = toysData[category].filter((t) => t.tier === 'paid');
      const picked = weightedPick(pool);
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

  // 팝볼이 완전히 깨질 때마다 호출 — 오늘 깬 횟수를 쌓는다(랭킹 계산용).
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
    secretKeys: state.secretKeys,
    secretEntry: state.secretEntry,
    dailyAdKeys: state.dailyAdKeys,
    adKeyDailyMax: AD_KEY_DAILY_MAX,
    secretKeyPrice: SECRET_KEY_PRICE,
    secretKeyDrop: SECRET_KEY_DROP,
    secretCardTable: SECRET_CARD_TABLE,
    secretCardBase: SECRET_CARD_BASE,
    toys: toysData,
    pullCost: PULL_COST,
    keyDailyGoal: KEY_DAILY_GOAL,
    pressReward,
    claimAdCoins,
    addTestCoins,
    addTestKeys,
    addTestAllSkins,
    buySecretKey,
    claimAdKey,
    enterSecretRoom,
    drawSecretCard,
    canPull,
    pull,
    pullOdds,
    purchasePremium,
    equip,
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
