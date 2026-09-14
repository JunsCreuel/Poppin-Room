import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toysData from '../data/toys.json';

const STORAGE_KEY = 'csl-gacha-state';
const GAUGE_TO_PULL = 100;
const GRADE_ODDS = { common: 0.70, rare: 0.25, limited: 0.05 };
const DUPLICATE_REFUND_RATIO = 0.3;

function defaultState() {
  return {
    gauge: { wakpuball: 0, keycap: 0 },
    owned: ['wb_01', 'kc_01'],
    equipped: { wakpuball: 'wb_01', keycap: 'kc_01' },
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

function rollGrade() {
  const roll = Math.random();
  let cumulative = 0;
  for (const [grade, odds] of Object.entries(GRADE_ODDS)) {
    cumulative += odds;
    if (roll <= cumulative) return grade;
  }
  return 'common';
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addGauge = useCallback((category, amount) => {
    setState((prev) => ({
      ...prev,
      gauge: { ...prev.gauge, [category]: prev.gauge[category] + amount },
    }));
  }, []);

  const canPull = useCallback(
    (category) => state.gauge[category] >= GAUGE_TO_PULL,
    [state.gauge]
  );

  // 뽑기: 등급 롤 -> 해당 등급 중 랜덤 하나. 이미 보유 중이면 게이지 일부 환급.
  const pull = useCallback((category) => {
    let result = null;

    setState((prev) => {
      if (prev.gauge[category] < GAUGE_TO_PULL) return prev;

      const pool = toysData[category];
      const grade = rollGrade();
      const gradePool = pool.filter((t) => t.grade === grade);
      const picked = gradePool[Math.floor(Math.random() * gradePool.length)] || pool[0];

      const isDuplicate = prev.owned.includes(picked.id);
      const remainingGauge = prev.gauge[category] - GAUGE_TO_PULL;
      const refund = isDuplicate ? Math.round(GAUGE_TO_PULL * DUPLICATE_REFUND_RATIO) : 0;

      result = { toy: picked, category, isDuplicate };

      return {
        ...prev,
        gauge: { ...prev.gauge, [category]: remainingGauge + refund },
        owned: isDuplicate ? prev.owned : [...prev.owned, picked.id],
      };
    });

    return result;
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

  const value = {
    gauge: state.gauge,
    owned: state.owned,
    equipped: state.equipped,
    toys: toysData,
    gaugeToPull: GAUGE_TO_PULL,
    addGauge,
    canPull,
    pull,
    equip,
    getToy,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
