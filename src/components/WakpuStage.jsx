// 팝볼 무대 컴포넌트 — 타격 쿨다운, 타격마다 크랙 프레임 전환, 파괴 연출, 리셋
import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { playCrackHit, playCrackBreak, playSampleHit, playShellCrack, preloadSample } from '../utils/sound';
import { crackFrameList } from '../data/crackFrames';

const BREAK_SHATTER_MS = 480; // 조각 파편 폴백 연출 시간(크랙 프레임 없는 오브제)
const BREAK_FRAME_MS = 700; // 마지막 크랙 프레임(완전 파편)을 보여주고 사라지는 시간
const HIT_COOLDOWN_MS = 260; // 이보다 빨리 연속으로 눌러도 무시 — "탁탁탁탁" 연타가 아니라 "탁 탁 탁" 한 번씩 눌리는 느낌

// 프레임 있는 오브제: 타격 0회 = 01(멀쩡), k회 = k+1, 마지막 타격은 N 위에서 파괴 연출
export default function WakpuStage({
  image, filter, isHolo, holoClassName = 'is-holo', accent, hitsToBreak, crackFrames, hitSound, hitSynth,
  disabled, onPress, onBreak, extraClassName = '',
}) {
  const [hits, setHits] = useState(0);
  const [phase, setPhase] = useState('idle'); // idle | breaking
  const [shake, setShake] = useState(false);

  const shakeTimeoutRef = useRef(null);
  const shakeRafRef = useRef(null);
  const breakTimeoutRef = useRef(null);
  const lastHitAtRef = useRef(0);
  const preloadedRef = useRef([]);

  const frames = useMemo(() => crackFrameList(crackFrames), [crackFrames]);

  // 프레임을 미리 받아 디코드까지 해둠 — 첫 교체 때 한 프레임 비는 것 방지
  useEffect(() => {
    if (!frames) return;
    preloadedRef.current = frames.map((src) => {
      const img = new Image();
      img.src = src;
      img.decode?.().catch(() => {});
      return img;
    });
  }, [frames]);

  useEffect(() => {
    if (hitSound) preloadSample(hitSound);
  }, [hitSound]);

  useEffect(() => () => {
    clearTimeout(shakeTimeoutRef.current);
    clearTimeout(breakTimeoutRef.current);
    cancelAnimationFrame(shakeRafRef.current);
  }, []);

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
    shakeRafRef.current = requestAnimationFrame(() => setShake(true));
    shakeTimeoutRef.current = setTimeout(() => setShake(false), 150);

    onPress?.();

    if (next >= hitsToBreak) {
      playCrackBreak();
      setPhase('breaking');
      onBreak?.();
      breakTimeoutRef.current = setTimeout(() => {
        setPhase('idle');
        setHits(0);
      }, frames ? BREAK_FRAME_MS : BREAK_SHATTER_MS);
    } else {
      // 타격음 우선순위: 녹음 파일 → 재질별 합성(껍질 깨짐) → 기본 합성
      if (hitSound) playSampleHit(hitSound, progress);
      else if (hitSynth) playShellCrack(hitSynth, progress);
      else playCrackHit(progress);
      setHits(next);
    }
  }, [disabled, phase, hits, hitsToBreak, frames, hitSound, hitSynth, onPress, onBreak]);

  const crackProgress = hits / hitsToBreak;
  const squashAmount = 0.02 + crackProgress * 0.05;
  const imgClassName = `wakpu-ball-img ${isHolo ? holoClassName : ''}`;
  const imgStyle = filter ? { filter } : undefined;
  const idleSrc = frames ? frames[Math.min(hits, frames.length - 1)] : image;

  return (
    <div className="wakpu-stage">
      <button
        type="button"
        className={[
          'wakpu-ball',
          frames ? 'has-frames' : '',
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
          <img src={idleSrc} alt="" className={imgClassName} style={imgStyle} />
        )}

        {phase === 'breaking' && (frames ? (
          <img src={frames[frames.length - 1]} alt="" className={imgClassName} style={imgStyle} />
        ) : (
          <div className="wakpu-shatter">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="shard" style={{ '--angle': `${(i / 12) * 360}deg`, background: accent }} />
            ))}
          </div>
        ))}
      </button>
      <div className="v2-combo-row">
        {hits > 0 && <span className="v2-combo-badge">💥 콤보 x{hits} 연타중!</span>}
      </div>
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
