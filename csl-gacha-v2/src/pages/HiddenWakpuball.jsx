import { useState, useCallback } from 'react';
import { useGame } from '../store/useGame';
import { playCrackHit, playCrackBreak } from '../utils/sound';
import { useRewardEffects } from '../utils/useRewardEffects';
import RewardEffects from '../components/RewardEffects';
import HiddenGauge from '../components/HiddenGauge';
import CrackOverlay from '../components/CrackOverlay';

// 히든 왁뿌볼 전용 아트 — 내가 장착한 왁뿌볼 디자인과 무관하게, 이 룸만의
// 고유한 외형(어둠 속에 떠 있는 보석)으로 항상 고정돼 보인다.
const HIDDEN_WB_IMAGE = 'images/hidden_wakpuball.png';
const HIDDEN_WB_ACCENT = '#e0357f';
const HIDDEN_WB_HITS = 14;

// 히든 왁뿌볼 룸 — 일반 왁뿌볼 룸과 달리 코인은 전혀 안 나오고, 오직
// 히든카드(0.6%)만 노리는 곳. 대신 하루에 부실 수 있는 횟수가 정해져 있다.
export default function HiddenWakpuball() {
  const { pressHidden, isHiddenMaxed, recordBreak } = useGame();
  const [hits, setHits] = useState(0);
  const [isBreaking, setIsBreaking] = useState(false);
  const [shake, setShake] = useState(false);
  const { toast, hiddenCard, trigger, closeHidden } = useRewardEffects();

  const maxedOut = isHiddenMaxed('wakpuball');

  const handleHit = useCallback(() => {
    if (isBreaking || maxedOut) return;

    const next = hits + 1;
    const progress = next / HIDDEN_WB_HITS;
    setShake(true);
    setTimeout(() => setShake(false), 90);

    trigger(pressHidden('wakpuball'));

    if (next >= HIDDEN_WB_HITS) {
      playCrackBreak();
      setIsBreaking(true);
      recordBreak();
      setTimeout(() => {
        setIsBreaking(false);
        setHits(0);
      }, 650);
    } else {
      playCrackHit(progress);
      setHits(next);
    }
  }, [hits, isBreaking, maxedOut, pressHidden, trigger, recordBreak]);

  const crackProgress = hits / HIDDEN_WB_HITS;

  return (
    <div className="case-page">
      <div className="case-eyebrow">09 // 히든 왁뿌볼 룸</div>
      <h1 className="case-title">히든 왁뿌볼</h1>
      <p className="case-sub">코인은 안 나와 — 대신 칠 때마다 0.6% 확률로 히든카드를 노려볼 수 있어.</p>

      <HiddenGauge category="wakpuball" />

      <div className="wakpu-stage">
        <button
          type="button"
          className={`wakpu-ball is-hidden-toy ${shake ? 'is-shaking' : ''} ${isBreaking ? 'is-breaking' : ''} ${maxedOut ? 'is-maxed' : ''}`}
          onClick={handleHit}
          disabled={maxedOut}
          aria-label="히든 왁뿌볼 터뜨리기"
        >
          <img src={HIDDEN_WB_IMAGE} alt="히든 왁뿌볼" className="wakpu-ball-img is-holo-strong" />
          <CrackOverlay progress={crackProgress} />
          {isBreaking && (
            <div className="wakpu-shatter">
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} className="shard" style={{
                  '--angle': `${(i / 12) * 360}deg`,
                  background: HIDDEN_WB_ACCENT,
                }} />
              ))}
            </div>
          )}
        </button>
        <div className="wakpu-progress">{hits} / {HIDDEN_WB_HITS} 회</div>
      </div>

      <RewardEffects toast={toast} hiddenCard={hiddenCard} onCloseHidden={closeHidden} />
    </div>
  );
}
