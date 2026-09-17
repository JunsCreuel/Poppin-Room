// 키캡 룸 페이지 — 보유 디자인별 키 1개씩, 누르면 장착 + 사운드 + 코인 보상
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../store/useGame';
import { playKeyClick } from '../utils/sound';
import { useRewardEffects } from '../utils/useRewardEffects';
import RewardEffects from '../components/RewardEffects';

const PRESS_HOLD_MS = 90; // 실제 키보드처럼 눌렸다가 짧게 있다 자동으로 올라옴

// 누른 키가 곧 장착 키가 된다
export default function Keycap() {
  const { toys, owned, equipped, equip, pressReward, coins, dailyKeyCoins, keyDailyGoal } = useGame();
  const ownedKeycaps = toys.keycap.filter((t) => owned.includes(t.id));
  const equippedToy = toys.keycap.find((t) => t.id === equipped.keycap) || ownedKeycaps[0] || null;

  const [pressedId, setPressedId] = useState(null);
  const [asmrOn, setAsmrOn] = useState(true);
  const [lastPress, setLastPress] = useState(null); // { name, amount }
  const { toast, hiddenCard, trigger, closeHidden } = useRewardEffects();

  const releaseTimeoutRef = useRef(null);
  const bannerTimeoutRef = useRef(null);

  const pressKey = useCallback((toy) => {
    if (!toy) return;
    equip('keycap', toy.id);
    if (asmrOn) playKeyClick(toy.sound);
    const reward = pressReward('keycap');
    trigger(reward);

    setLastPress({ name: toy.name, amount: reward?.amount });
    clearTimeout(bannerTimeoutRef.current);
    bannerTimeoutRef.current = setTimeout(() => setLastPress(null), 2200);

    setPressedId(toy.id);
    clearTimeout(releaseTimeoutRef.current);
    releaseTimeoutRef.current = setTimeout(() => setPressedId(null), PRESS_HOLD_MS);
  }, [equip, asmrOn, pressReward, trigger]);

  useEffect(() => () => {
    clearTimeout(releaseTimeoutRef.current);
    clearTimeout(bannerTimeoutRef.current);
  }, []);

  useEffect(() => {
    // 실제 키보드의 ESC를 눌러도 지금 장착중인 키로 같은 반응.
    const handleKeyDown = (e) => {
      if (e.code !== 'Escape' || e.repeat) return;
      e.preventDefault();
      pressKey(equippedToy);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pressKey, equippedToy]);

  if (!equippedToy) return null;

  const goalPct = Math.min(100, Math.round((dailyKeyCoins / keyDailyGoal) * 100));

  return (
    <div className="case-page">
      <div className="case-eyebrow">PLAY MODE · 탭키 타건</div>
      <h1 className="case-title">키캡 룸</h1>

      <div className="v2-keydeck-banner">
        {lastPress
          ? `⌨️ ${lastPress.name} 클릭!${lastPress.amount ? ` 게이지 +${lastPress.amount} 코인 적립` : ''}`
          : '⌨️ 원하는 키를 눌러 타건 시작'}
      </div>

      <div className="v2-card v2-keydeck-card">
        <div className="v2-keydeck-head">
          <div>
            <div className="v2-keydeck-name">KEY-DECK {ownedKeycaps.length}</div>
            <div className="v2-keydeck-sub">POPPIN ROOM SERIES</div>
          </div>
          <span className="v2-badge is-active">CONNECTED</span>
        </div>

        <div className="v2-keydeck-grid is-designs">
          {ownedKeycaps.map((toy) => (
            <button
              key={toy.id}
              type="button"
              onClick={() => pressKey(toy)}
              className={[
                'v2-key',
                equipped.keycap === toy.id ? 'is-selected' : '',
                pressedId === toy.id ? 'is-pressed' : '',
              ].filter(Boolean).join(' ')}
              aria-label={toy.name}
            >
              <div className="v2-key-thumb">
                <img
                  src={toy.image}
                  alt=""
                  style={{ filter: toy.filter }}
                  className={toy.isHolo ? 'is-holo' : ''}
                />
              </div>
              <span className="v2-key-letter">{toy.name}</span>
            </button>
          ))}
        </div>

        <div className="v2-keydeck-toggle-row">
          <span>타건 ASMR 사운드 활성화</span>
          <button
            type="button"
            className={`v2-switch ${asmrOn ? 'is-on' : ''}`}
            onClick={() => setAsmrOn((v) => !v)}
            role="switch"
            aria-checked={asmrOn}
            aria-label="타건 ASMR 사운드"
          >
            <span className="v2-switch-knob" />
          </button>
        </div>
      </div>

      <div className="v2-keydeck-stat">
        <span>오늘의 타건 게이지 적립</span>
        <b>{dailyKeyCoins} / {keyDailyGoal} 코인</b>
      </div>
      <div className="v2-progress-track" style={{ marginBottom: 18 }}>
        <div className="v2-progress-fill" style={{ width: `${goalPct}%` }} />
      </div>
      <div className="v2-keydeck-note">
        디자인별 키 1개, 누르면 그 키캡 장착 + 고유 사운드, ESC 키는 장착중인 키캡으로 타건
      </div>

      <div className="coin-inline">🪙 {coins} 코인</div>

      <Link to="/hidden/keycap" className="hidden-room-cta">
        히든 키캡 룸 · 히든카드 도전 →
      </Link>

      <RewardEffects toast={toast} hiddenCard={hiddenCard} onCloseHidden={closeHidden} />
    </div>
  );
}
