// 키캡 룸 페이지 — 장착한 키캡 1개를 타건, 누를 때마다 사운드 + 코인 보상, 오브제 변경으로 디자인 교체
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../store/useGame';
import { playKeyClick } from '../utils/sound';
import { useRewardEffects } from '../utils/useRewardEffects';
import RewardEffects from '../components/RewardEffects';
import DesignPicker from '../components/DesignPicker';

const PRESS_HOLD_MS = 90; // 눌렸다가 자동으로 올라오는 시간
const STRESS_LABEL = { common: 'LOW', rare: 'MEDIUM', limited: 'HIGH' };

// 왁뿌볼 룸과 같은 구성: 코인 pill → 카드(오브제 헤더 + 무대 + 게이지) → 오브제 변경/게이지 수확 → 히든 룸 CTA
export default function Keycap() {
  const { equipped, getToy, pressReward, coins, dailyKeyCoins, keyDailyGoal } = useGame();
  const toy = getToy('keycap', equipped.keycap);
  const { toast, hiddenCard, trigger, closeHidden } = useRewardEffects();

  const [pressed, setPressed] = useState(false);
  const [combo, setCombo] = useState(0);
  const releaseTimeoutRef = useRef(null);
  const comboTimeoutRef = useRef(null);

  const pressOnce = useCallback(() => {
    if (!toy) return;
    playKeyClick(toy.sound);
    trigger(pressReward('keycap'));

    setPressed(true);
    clearTimeout(releaseTimeoutRef.current);
    releaseTimeoutRef.current = setTimeout(() => setPressed(false), PRESS_HOLD_MS);

    // 1.2초 안에 연달아 누르면 콤보 유지
    setCombo((c) => c + 1);
    clearTimeout(comboTimeoutRef.current);
    comboTimeoutRef.current = setTimeout(() => setCombo(0), 1200);
  }, [toy, pressReward, trigger]);

  useEffect(() => () => {
    clearTimeout(releaseTimeoutRef.current);
    clearTimeout(comboTimeoutRef.current);
  }, []);

  useEffect(() => {
    // 실제 키보드 ESC로도 타건
    const handleKeyDown = (e) => {
      if (e.code !== 'Escape' || e.repeat) return;
      e.preventDefault();
      pressOnce();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pressOnce]);

  if (!toy) return null;

  const no = toy.id.replace(/\D/g, '').padStart(2, '0');
  const goalPct = Math.min(100, Math.round((dailyKeyCoins / keyDailyGoal) * 100));

  return (
    <div className="case-page">
      <div className="case-eyebrow">PLAY MODE · 탭키 타건</div>
      <h1 className="case-title">{toy.name}</h1>

      <div className="v2-live-pill">
        <span className="dot" />
        {coins} 코인 적립중
      </div>

      <div className="v2-card">
        <div className="v2-object-head">
          <span>NO. {no} {toy.name.toUpperCase()}</span>
          <span>STRESS: {STRESS_LABEL[toy.grade] || 'LOW'}</span>
        </div>

        <div className="keycap-stage">
          <button
            type="button"
            className={`keycap-single ${pressed ? 'is-pressed' : ''}`}
            onClick={pressOnce}
            aria-label={`${toy.name} 타건`}
          >
            <img
              src={toy.image}
              alt={toy.name}
              className={`keycap-single-img ${toy.isHolo ? 'is-holo' : ''}`}
              style={{ filter: toy.filter }}
              draggable="false"
            />
            {combo > 0 && <span className="v2-combo-badge">⌨️ 콤보 x{combo} 타건중!</span>}
          </button>
        </div>

        <div className="v2-progress-row" style={{ width: '100%' }}>
          <span className="v2-progress-label">오늘의 타건 게이지</span>
          <span className="v2-progress-pct">{goalPct}%</span>
        </div>
        <div className="v2-progress-track" style={{ width: '100%' }}>
          <div className="v2-progress-fill" style={{ width: `${goalPct}%` }} />
        </div>
      </div>

      <div className="v2-btn-row">
        <DesignPicker category="keycap" />
        <Link to="/shop" className="v2-btn v2-btn-primary">게이지 수확하기</Link>
      </div>

      <Link to="/hidden/keycap" className="hidden-room-cta">
        히든 키캡 룸 · 히든카드 도전 →
      </Link>
      <div className="lab-footer-note">오늘 {dailyKeyCoins}코인 적립 · <Link to="/shop">랭킹 보기</Link></div>

      <RewardEffects toast={toast} hiddenCard={hiddenCard} onCloseHidden={closeHidden} />
    </div>
  );
}
