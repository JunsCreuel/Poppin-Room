import { useState, useCallback, useRef } from 'react';
import { playCrackHit, playCrackBreak, playOoze, playSquishTouch } from '../utils/sound';
import CrackOverlay from './CrackOverlay';

const SQUISH_LINGER_MS = 1500; // 다 깨진 뒤 찌그러진 채로 머무는 기본 시간
const SQUISH_EXTEND_MS = 550; // 찌그러진 상태에서 한 번 더 누르면 늘어나는 시간

// 왁뿌볼 인터랙션 본체 — 일반/히든 왁뿌볼 룸이 공유한다. 그냥 때리다가
// 다 깨지면 끝나는 게 아니라, 깨진 뒤에도 안에 든 내용물(칩 색깔 = 그
// 디자인의 accent)이 찌그러져 삐져나온 채로 잠깐 남아서 계속 조몰락거릴
// 수 있다 — 매번 누를 때마다 살짝씩 더 짓눌리는 손맛을 주는 게 핵심.
export default function WakpuStage({
  image, filter, isHolo, holoClassName = 'is-holo', accent, hitsToBreak,
  disabled, onPress, onBreak, extraClassName = '',
}) {
  const [hits, setHits] = useState(0);
  const [phase, setPhase] = useState('idle'); // idle | breaking | squish
  const [shake, setShake] = useState(false);
  const [squishPulse, setSquishPulse] = useState(false);

  const shakeTimeoutRef = useRef(null);
  const squishPulseTimeoutRef = useRef(null);
  const squishResetTimeoutRef = useRef(null);
  const breakTimeoutRef = useRef(null);

  const scheduleSquishReset = (ms) => {
    clearTimeout(squishResetTimeoutRef.current);
    squishResetTimeoutRef.current = setTimeout(() => {
      setPhase('idle');
      setHits(0);
    }, ms);
  };

  const handlePress = useCallback(() => {
    if (disabled) return;

    if (phase === 'squish') {
      // 다 깨진 뒤에도 계속 만지작 — 진행은 더 안 늘고 찌그러지는 손맛만 반복
      setSquishPulse(false);
      clearTimeout(squishPulseTimeoutRef.current);
      requestAnimationFrame(() => setSquishPulse(true));
      squishPulseTimeoutRef.current = setTimeout(() => setSquishPulse(false), 180);
      playSquishTouch();
      onPress?.();
      scheduleSquishReset(SQUISH_EXTEND_MS);
      return;
    }
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
        playOoze();
        setPhase('squish');
        scheduleSquishReset(SQUISH_LINGER_MS);
      }, 480);
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
          phase === 'squish' ? 'is-squish' : '',
          squishPulse ? 'is-squish-pulse' : '',
          extraClassName,
          disabled ? 'is-maxed' : '',
        ].filter(Boolean).join(' ')}
        style={phase === 'idle' ? { '--hit-squash': squashAmount } : undefined}
        onClick={handlePress}
        disabled={disabled}
        aria-label="왁뿌볼 터뜨리기"
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
          </>
        )}

        {phase === 'breaking' && (
          <div className="wakpu-shatter">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="shard" style={{ '--angle': `${(i / 12) * 360}deg`, background: accent }} />
            ))}
          </div>
        )}

        {/* 겉껍질이 깨지고 나면 안에 든 하얀 왁스 내용물이 찌그러져
            삐져나온 모습만 남는다 — 디자인마다 다른 색인 껍질과 달리
            내용물은 항상 이 흰색/크림색 왁스로 통일돼 있다 */}
        {phase === 'squish' && (
          <div className="wakpu-wax">
            <span className="wax-blob blob-1" />
            <span className="wax-blob blob-2" />
            <span className="wax-blob blob-3" />
            <span className="wax-blob blob-4" />
            <span className="wax-core" />
          </div>
        )}
      </button>
      <div className="wakpu-progress">
        {phase === 'squish' ? '말랑말랑 — 계속 눌러봐' : `${hits} / ${hitsToBreak} 회`}
      </div>
    </div>
  );
}
