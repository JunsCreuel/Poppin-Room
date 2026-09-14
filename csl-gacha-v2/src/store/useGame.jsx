import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toysData from '../data/toys.json';

const STORAGE_KEY = 'csl-gacha-state';
const PULL_COST = 10; // 뽑기 1회당 코인 비용
const DUPLICATE_REFUND_RATIO = 0.3;

// 누를 때마다(왁뿌볼 한 대 / 키캡 한 번) 굴리는 보상 확률.
// 코인1(30~40%) · 코인5(5%) · 히든카드(0.6%) · 그 외는 꽝.
const PRESS_REWARD = { hidden: 0.006, coin5: 0.05, coin1: 0.35 };

function freeOwnedIds() {
  const ids = [];
  for (const category of Object.keys(toysData)) {
    for (const toy of toysData[category]) {
      if (toy.tier === 'free') ids.push(toy.id);
    }
  }
  return ids;
}

function defaultState() {
  return {
    coins: 0,
    owned: freeOwnedIds(),
    equipped: { wakpuball: 'wb_01', keycap: 'kc_01' },
    hiddenCards: [], // { code, category, wonAt }
    loggedIn: false,
    loginProvider: null, // 'kakao' | 'google'
    lastVisit: new Date().toISOString().slice(0, 10),
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

function rollPressReward() {
  const r = Math.random();
  if (r < PRESS_REWARD.hidden) return 'hidden';
  if (r < PRESS_REWARD.hidden + PRESS_REWARD.coin5) return 'coin5';
  if (r < PRESS_REWARD.hidden + PRESS_REWARD.coin5 + PRESS_REWARD.coin1) return 'coin1';
  return null;
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

  // 왁뿌볼을 한 대 칠 때, 키캡을 한 번 누를 때마다 호출 — 코인/히든카드 보상을
  // 굴리고 그 결과를 그대로 반환한다(화면에서 토스트/모달 연출용).
  const pressReward = useCallback((category) => {
    const roll = rollPressReward();
    if (!roll) return null;

    let payload = null;
    setState((prev) => {
      if (roll === 'coin1') {
        payload = { type: 'coin', amount: 1 };
        return { ...prev, coins: prev.coins + 1 };
      }
      if (roll === 'coin5') {
        payload = { type: 'coin', amount: 5 };
        return { ...prev, coins: prev.coins + 5 };
      }
      // hidden
      const code = makeHiddenCode(category);
      const card = { code, category, wonAt: new Date().toISOString() };
      payload = { type: 'hidden', card };
      return { ...prev, hiddenCards: [...prev.hiddenCards, card] };
    });
    return payload;
  }, []);

  // 광고 시청 보상 — 실제 광고 SDK가 없어서 지금은 즉시 지급하는 mock.
  // 나중에 광고 SDK가 붙으면 이 함수 안쪽만 실제 재생 로직으로 바꾸면 된다.
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

  // 프리미엄 구매 — 실제 결제 연동 전까지는 "테스트 결제"로 즉시 보유 처리하는 mock.
  const purchasePremium = useCallback((category, id) => {
    let ok = false;
    setState((prev) => {
      if (prev.owned.includes(id)) { ok = true; return prev; }
      ok = true;
      return { ...prev, owned: [...prev.owned, id] };
    });
    return ok;
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

  // 로그인 — 실제 OAuth 연동 전까지는 버튼만 동작하는 mock. 계정 자체가
  // 생기면(카카오/구글) 여기 provider별 실제 로그인 흐름으로 바꿔치기.
  const login = useCallback((provider) => {
    setState((prev) => ({ ...prev, loggedIn: true, loginProvider: provider }));
  }, []);

  const logout = useCallback(() => {
    setState((prev) => ({ ...prev, loggedIn: false, loginProvider: null }));
  }, []);

  const value = {
    coins: state.coins,
    owned: state.owned,
    equipped: state.equipped,
    hiddenCards: state.hiddenCards,
    loggedIn: state.loggedIn,
    loginProvider: state.loginProvider,
    toys: toysData,
    pullCost: PULL_COST,
    pressReward,
    claimAdCoins,
    canPull,
    pull,
    purchasePremium,
    equip,
    getToy,
    login,
    logout,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
