import { useState, useEffect, useCallback } from 'react';
import { useGame } from '../store/useGame';
import { playKeyClick } from '../utils/sound';
import { useRewardEffects } from '../utils/useRewardEffects';
import RewardEffects from '../components/RewardEffects';
import HiddenGauge from '../components/HiddenGauge';

// 히든 키캡 전용 아트 — 내가 장착한 키캡 디자인과 무관하게, 이 룸만의
// 고유한 외형(어둠 속에 떠 있는 보석)으로 항상 고정돼 보인다.
const HIDDEN_KC_IMAGE = 'images/hidden_keycap.png';

// 히든 키캡 룸 — 일반 키캡 룸과 달리 코인은 전혀 안 나오고, 오직
// 히든카드(0.6%)만 노리는 곳. 대신 하루에 누를 수 있는 횟수가 정해져 있다.
export default function HiddenKeycap() {
  const { pressHidden, isHiddenMaxed } = useGame();
  const [pressed, setPressed] = useState(false);
  const { toast, hiddenCard, trigger, closeHidden } = useRewardEffects();

  const maxedOut = isHiddenMaxed('keycap');

  const pressOnce = useCallback(() => {
    if (maxedOut) return;
    playKeyClick(true);
    trigger(pressHidden('keycap'));
    setPressed((p) => !p);
  }, [maxedOut, pressHidden, trigger]);

  const handleClick = () => pressOnce();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code !== 'Escape' || e.repeat) return;
      e.preventDefault();
      pressOnce();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pressOnce]);

  return (
    <div className="case-page">
      <div className="case-eyebrow">10 // 히든 키캡 룸</div>
      <h1 className="case-title">히든 키캡</h1>
      <p className="case-sub">코인은 안 나와 — 대신 누를 때마다 0.6% 확률로 히든카드를 노려볼 수 있어.</p>

      <HiddenGauge category="keycap" />

      <div className="keycap-stage">
        <button
          type="button"
          className={`keycap-single is-hidden-toy ${pressed ? 'is-pressed' : ''} ${maxedOut ? 'is-maxed' : ''}`}
          onClick={handleClick}
          disabled={maxedOut}
          aria-label="히든 키캡"
        >
          <img src={HIDDEN_KC_IMAGE} alt="히든 키캡" className="keycap-single-img is-holo" draggable="false" />
        </button>
      </div>

      <RewardEffects toast={toast} hiddenCard={hiddenCard} onCloseHidden={closeHidden} />
    </div>
  );
}
