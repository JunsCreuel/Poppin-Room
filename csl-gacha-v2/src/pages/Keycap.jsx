import { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../store/useGame';
import { playKeyClick } from '../utils/sound';
import { useRewardEffects } from '../utils/useRewardEffects';
import RewardEffects from '../components/RewardEffects';

const HOLD_INTERVAL_MS = 90; // 꾹 누르고 있을 때 연속 타건 간격 — CLICK LAB과 동일

export default function Keycap() {
  const { equipped, getToy, pressReward, coins } = useGame();
  const toy = getToy('keycap', equipped.keycap);
  const [pressed, setPressed] = useState(false);
  const { toast, hiddenCard, trigger, closeHidden } = useRewardEffects();

  const holdIntervalRef = useRef(null);
  const pressTimeoutRef = useRef(null);

  const pressOnce = useCallback(() => {
    if (!toy) return;
    playKeyClick(toy.tier === 'premium');
    trigger(pressReward('keycap'));
    setPressed(false);
    clearTimeout(pressTimeoutRef.current);
    requestAnimationFrame(() => setPressed(true));
    pressTimeoutRef.current = setTimeout(() => setPressed(false), 90);
  }, [toy, pressReward, trigger]);

  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    pressOnce();
    clearInterval(holdIntervalRef.current);
    holdIntervalRef.current = setInterval(pressOnce, HOLD_INTERVAL_MS);
  };

  useEffect(() => {
    const stopHolding = () => {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    };
    // 실제 키보드의 ESC를 눌러도 같은 반응 — CLICK LAB과 동일하게 지원
    const handleKeyDown = (e) => {
      if (e.code !== 'Escape') return;
      e.preventDefault();
      pressOnce();
    };
    window.addEventListener('pointerup', stopHolding);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerup', stopHolding);
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(holdIntervalRef.current);
      clearTimeout(pressTimeoutRef.current);
    };
  }, [pressOnce]);

  if (!toy) return null;

  return (
    <div className="case-page">
      <div className="case-eyebrow">03 // 키캡 룸</div>
      <h1 className="case-title">{toy.name}</h1>
      <p className="case-sub">클릭하거나 꾹 누르고 있어. 실제 키보드 ESC를 눌러도 돼. 누를 때마다 코인을 얻을 수도 있어.</p>

      <div className="keycap-stage">
        <button
          type="button"
          className={`keycap-single ${pressed ? 'is-pressed' : ''}`}
          onPointerDown={handlePointerDown}
          aria-label={toy.name}
        >
          <img
            src={toy.image}
            alt={toy.name}
            className={`keycap-single-img ${toy.isHolo ? 'is-holo' : ''}`}
            style={{ filter: toy.filter }}
            draggable="false"
          />
        </button>
      </div>

      <div className="coin-inline">🪙 {coins} 코인</div>

      <RewardEffects toast={toast} hiddenCard={hiddenCard} onCloseHidden={closeHidden} />
    </div>
  );
}
