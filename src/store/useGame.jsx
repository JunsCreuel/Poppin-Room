// 게임 상태 저장소 — 코인, 보유/장착 오브제, 히든카드
// 로그아웃 상태는 localStorage, 로그인 상태는 Firestore users/{uid} 문서에 계정별로 저장
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore/lite';
import { auth, db, googleProvider } from '../lib/firebase';
import toysData from '../data/toys.json';
import { weightedPick, computeGradeOdds } from '../data/gradeOdds';

const STORAGE_KEY = 'poppinroom-state'; // 진행 상황 저장 키(localStorage)
const LEGACY_STORAGE_KEY = 'csl-gacha-state'; // 이름 변경 전 저장 키, 남아 있으면 읽어옴
const PULL_COST = 200; // 뽑기 1회당 코인 비용
const DUPLICATE_REFUND_RATIO = 0.3;
const KEY_DAILY_GOAL = 500; // 키캡 룸 "오늘의 타건 게이지" 표시 목표치(코인 기준)
// 시크릿 키 — 상점에서 코인 구매 / 하루 3개까지 광고 시청 / 왁뿌볼·키캡 타격 시 0.06% 드롭
// 키 1개 = 히든 왁뿌볼 룸 또는 히든 키캡 룸 중 하나에 1회 입장
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

// 일반 왁뿌볼/키캡 룸에서 누를 때마다 굴리는 보상 확률 — 코인만 나온다.
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
    equipped: { wakpuball: 'wb_02', keycap: 'kc_01' },
    hiddenCards: [], // { code, category, wonAt }
    dailyBreaks: 0, // 오늘 왁뿌볼을 완전히 깬 횟수 — 랭킹 계산에 사용
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
    return normalizeState(JSON.parse(raw));
  } catch {
    return defaultState();
  }
}

// 저장된 값(localStorage·Firestore 공통)을 현재 규칙에 맞게 정리
function normalizeState(parsed) {
  try {
    const merged = { ...defaultState(), ...parsed };
    // 날짜가 바뀌었으면 오늘 깬 횟수만 리셋(누적 총합은 유지).
    if (merged.lastVisit !== todayStr()) {
      merged.dailyBreaks = 0;
      merged.dailyKeyCoins = 0;
      merged.dailyAdKeys = 0;
      merged.lastVisit = todayStr();
    }
    delete merged.room;
    // id 체계가 바뀐 뒤 남은 옛 저장값 정리 — 없는 id는 버리고, 장착은 기본 디자인으로 복구
    const known = new Set(Object.keys(toysData).flatMap((c) => toysData[c].map((t) => t.id)));
    merged.owned = [...new Set([...freeOwnedIds(), ...(merged.owned || []).filter((id) => known.has(id))])];
    const defaults = defaultState().equipped;
    merged.equipped = { ...defaults, ...merged.equipped };
    for (const category of Object.keys(defaults)) {
      if (!toysData[category].some((t) => t.id === merged.equipped[category])) merged.equipped[category] = defaults[category];
    }
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
  const [user, setUser] = useState(() => auth.currentUser);
  const [authReady, setAuthReady] = useState(false); // 저장된 로그인 복원 확인 끝났는지
  const [authError, setAuthError] = useState(null); // 로그인 버튼 실패
  const [syncError, setSyncError] = useState(null); // 로그인은 됐지만 계정 데이터 불러오기 실패 — 이 상태에선 저장 안 됨
  // 로그인 직후 계정 데이터 불러오는 중 — 이 사이 변경은 곧 도착할 계정 데이터에 덮여 사라지므로 화면을 가림
  const [accountLoading, setAccountLoading] = useState(false);

  // 지금 state가 누구 데이터인지 — null: 비로그인(localStorage), uid: 그 계정, undefined: 계정 데이터 불러오는 중(저장 금지)
  // 로그인/로그아웃 전환 순간에 한 사람의 데이터가 다른 사람 저장소에 덮어써지지 않게 막는 장치
  const ownerRef = useRef(null);
  const pendingRef = useRef(null); // Firestore에 아직 안 보낸 마지막 상태 { uid, data }
  const timerRef = useRef(null);
  // 저장 요청을 한 줄로 세움 — 먼저 보낸 저장이 나중에 도착해 최신 값을 덮는 일 방지
  const saveChainRef = useRef(Promise.resolve());

  // 대기 중인 저장분을 보내고, 앞서 보낸 것까지 모두 끝나면 완료되는 Promise 반환
  const flush = useCallback(() => {
    clearTimeout(timerRef.current);
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (pending) {
      saveChainRef.current = saveChainRef.current
        .then(() => setDoc(doc(db, 'users', pending.uid), pending.data, { merge: true }))
        .catch((err) => console.error('저장 실패', err));
    }
    return saveChainRef.current;
  }, []);

  // 로그인 상태 구독 — 계정이 바뀔 때마다 그 계정의 데이터로 교체
  // 처음 로그인한 계정은 기본 상태(코인 0)로 새 문서 생성
  useEffect(() => {
    let active = true;
    let seq = 0; // 빠르게 로그인/로그아웃이 겹칠 때 늦게 도착한 옛 결과 무시용
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      const mySeq = ++seq;
      const stale = () => !active || mySeq !== seq;
      flush();
      setUser(nextUser);
      setAuthReady(true);
      setSyncError(null);
      setAccountLoading(!!nextUser);
      if (!nextUser) {
        if (ownerRef.current !== null) {
          ownerRef.current = null;
          setState(loadState());
        }
        return;
      }
      ownerRef.current = undefined;
      const ref = doc(db, 'users', nextUser.uid);

      // 응답도 오류도 없이 멈추는 연결이 있어 15초 넘으면 실패 처리 — 불러오는 중 화면에 갇히지 않게
      const withTimeout = (promise) => Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(Object.assign(new Error('계정 데이터 응답 없음'), { code: 'timeout' })), 15000)),
      ]);

      // 연결이 잠깐 끊겨 'unavailable'이 나는 경우가 있어 1·2·4초 간격으로 다시 시도
      const load = async (attempt = 0) => {
        try {
          const snap = await withTimeout(getDoc(ref));
          const next = snap.exists() ? normalizeState(snap.data()) : defaultState();
          if (!snap.exists()) await withTimeout(setDoc(ref, { ...next, email: nextUser.email ?? null }));
          return next;
        } catch (err) {
          if (err.code !== 'unavailable' || attempt >= 3 || stale()) throw err;
          await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
          return load(attempt + 1);
        }
      };

      load()
        .then((next) => {
          if (stale()) return;
          ownerRef.current = nextUser.uid;
          setState(next);
          setAccountLoading(false);
        })
        .catch((err) => {
          if (stale()) return;
          console.error('계정 데이터 불러오기 실패', err);
          setSyncError(err.code || err.message);
          setAccountLoading(false);
        });
    });
    return () => { active = false; unsubscribe(); };
  }, [flush]);

  // 상태 저장 — 비로그인은 즉시 localStorage, 로그인은 0.8초 모아서 Firestore(연타 때 쓰기 횟수 절약)
  useEffect(() => {
    const owner = ownerRef.current;
    if (owner === undefined) return;
    if (owner === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return;
    }
    pendingRef.current = { uid: owner, data: state };
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flush, 800);
  }, [state, flush]);

  // 탭을 닫거나 다른 앱으로 넘어갈 때 대기 중인 저장분을 바로 보냄
  useEffect(() => {
    const onHide = () => { if (document.visibilityState === 'hidden') flush(); };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [flush]);

  // 왁뿌볼을 한 대 칠 때, 키캡을 한 번 누를 때마다 호출 — 시크릿 키 드롭(0.06%)
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

  const getToy = useCallback((category, id) => {
    return toysData[category].find((t) => t.id === id) || null;
  }, []);

  // Google 로그인 — 팝업 방식. 사이트 주소와 로그인 처리 주소(authDomain)가 같은
  // Firebase Hosting(firebaseapp.com)에서는 팝업이 막히지 않음
  // 성공하면 true, 실패·취소하면 false
  const login = useCallback(async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      return true;
    } catch (err) {
      console.error('로그인 실패', err);
      setAuthError(err.code || err.message);
      return false;
    }
  }, []);

  // 로그인돼 있으면 바로 true, 아니면 구글 로그인 창을 띄우고 결과 반환
  // 첫 화면 로딩 직후엔 저장된 로그인 복원이 끝나기 전일 수 있어 복원부터 기다림
  const requireLogin = useCallback(async () => {
    await auth.authStateReady();
    if (auth.currentUser) return true;
    return login();
  }, [login]);

  // 로그아웃 전에 대기 중인 저장분을 보내고, 서버로 가는 중인 저장까지 끝나길 기다림
  // 로그아웃 후에는 보안 규칙상 본인 문서에 쓸 수 없음 — 연결이 끊긴 경우를 대비해 최대 5초만 기다림
  const logout = useCallback(async () => {
    await Promise.race([flush(), new Promise((r) => setTimeout(r, 5000))]);
    await signOut(auth);
  }, [flush]);

  // 진행 상황 초기화 — 처음 상태(무료 등급만 보유, 코인 0)로 되돌림, 복구 불가
  // 로그인 상태면 저장 effect가 그 계정 문서를 기본값으로 덮어씀
  const resetProgress = useCallback(() => {
    if (ownerRef.current === null) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
    setState(defaultState());
  }, []);

  const value = {
    coins: state.coins,
    owned: state.owned,
    equipped: state.equipped,
    hiddenCards: state.hiddenCards,
    authReady,
    loggedIn: !!user,
    loginProvider: user ? 'google' : null,
    displayName: user?.displayName ?? null,
    email: user?.email ?? null,
    photoURL: user?.photoURL ?? null,
    authError,
    syncError,
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
    requireLogin,
    logout,
    recordBreak,
    resetProgress,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
      {accountLoading && <div className="account-loading-overlay">계정 데이터 불러오는 중</div>}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
