// 팝볼 무대 컴포넌트 — 타격 쿨다운, 금가는 연출, 파편 연출, 리셋
import { useState, useCallback, useRef } from 'react';
import { playCrackHit, playCrackBreak } from '../utils/sound';
import CrackOverlay from './CrackOverlay';

const BREAK_SHATTER_MS = 480; // 겉껍질이 파편으로 튀는 연출이 지속되는 시간
const HIT_COOLDOWN_MS = 260; // 이보다 빨리 연속으로 눌러도 무시 — "탁탁탁탁" 연타가 아니라 "탁 탁 탁" 한 번씩 눌리는 느낌

// 일반/히든 팝볼 룸이 공유
export default function WakpuStage({
  image, filter, isHolo, holoClassName = 'is-holo', accent, hitsToBreak,
  disabled, onPress, onBreak, extraClassName = '',
}) {
  const [hits, setHits] = useState(0);
  const [phase, setPhase] = useState('idle'); // idle | breaking
  const [shake, setShake] = useState(false);

  const shakeTimeoutRef = useRef(null);
  const breakTimeoutRef = useRef(null);
  const lastHitAtRef = useRef(0);

  const handlePress = useCallback(() => {
    if (disabled) return;

    const now = Date.now();
    if (now - lastHitAtRef.current < HIT_COOLDOWN_MS) return;
    lastHitAtRef.current = now;

    if (phase === 'breaking') return;

    const next = hits + 1;
    const progress = next / hitsToBreak;
    setShake(false);
    clearTimeout(shakeTimeoutRef.current);
    requestAnimationFrame(() => setShake(true));
    shakeTimeoutRef.current = setTimeout(() => setShake(false), 150);

    onPress?.();

    if (next >= hitsToBreak) {
      playCrackBreak();
      setPhase('breaking');
      onBreak?.();
      breakTimeoutRef.current = setTimeout(() => {
        setPhase('idle');
        setHits(0);
      }, BREAK_SHATTER_MS);
    } else {
      playCrackHit(progress);
      setHits(next);
    }
  }, [disabled, phase, hits, hitsToBreak, onPress, onBreak]);

  const crackProgress = hits / hitsToBreak;
  const squashAmount = 0.02 + crackProgress * 0.05;

  return (
    <div className="wakpu-stage">
      <button
        type="button"
        className={[
          'wakpu-ball',
          shake ? 'is-shaking' : '',
          phase === 'breaking' ? 'is-breaking' : '',
          extraClassName,
          disabled ? 'is-maxed' : '',
        ].filter(Boolean).join(' ')}
        style={phase === 'idle' ? { '--hit-squash': squashAmount } : undefined}
        onClick={handlePress}
        disabled={disabled}
        aria-label="팝볼 터뜨리기"
      >
        {phase === 'idle' && (
          <>
            <img
              src={image}
              alt=""
              className={`wakpu-ball-img ${isHolo ? holoClassName : ''}`}
              style={filter ? { filter } : undefined}
            />
            <CrackOverlay progress={crackProgress} />
            {hits > 0 && <span className="v2-combo-badge">💥 콤보 x{hits} 연타중!</span>}
          </>
        )}

        {phase === 'breaking' && (
          <div className="wakpu-shatter">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="shard" style={{ '--angle': `${(i / 12) * 360}deg`, background: accent }} />
            ))}
          </div>
        )}
      </button>
      <div className="v2-progress-row" style={{ width: '100%' }}>
        <span className="v2-progress-label">팝볼 파괴 균열도</span>
        <span className="v2-progress-pct">{Math.round(crackProgress * 100)}%</span>
      </div>
      <div className="v2-progress-track" style={{ width: '100%' }}>
        <div className="v2-progress-fill" style={{ width: `${Math.round(crackProgress * 100)}%` }} />
      </div>
    </div>
  );
}
