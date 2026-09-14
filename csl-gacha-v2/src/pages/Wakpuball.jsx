import { useState, useCallback } from 'react';
import { useGame } from '../store/useGame';
import { playCrackHit, playCrackBreak } from '../utils/sound';

const GAUGE_PER_HIT = 8;

export default function Wakpuball() {
  const { equipped, getToy, addGauge, gauge, gaugeToPull } = useGame();
  const toy = getToy('wakpuball', equipped.wakpuball);
  const [hits, setHits] = useState(0);
  const [isBreaking, setIsBreaking] = useState(false);
  const [shake, setShake] = useState(false);

  const handleHit = useCallback(() => {
    if (isBreaking || !toy) return;

    const next = hits + 1;
    const progress = next / toy.hitsToBreak;
    setShake(true);
    setTimeout(() => setShake(false), 90);

    if (next >= toy.hitsToBreak) {
      playCrackBreak();
      setIsBreaking(true);
      addGauge('wakpuball', GAUGE_PER_HIT);
      setTimeout(() => {
        setIsBreaking(false);
        setHits(0);
      }, 650);
    } else {
      playCrackHit(progress);
      setHits(next);
      addGauge('wakpuball', GAUGE_PER_HIT);
    }
  }, [hits, isBreaking, toy, addGauge]);

  if (!toy) return null;

  const crackProgress = hits / toy.hitsToBreak;
  const crackLineCount = Math.round(crackProgress * 10);

  return (
    <div className="case-page">
      <div className="case-eyebrow">02 // 왁뿌볼 룸</div>
      <h1 className="case-title">{toy.name}</h1>
      <p className="case-sub">연타해서 깨뜨려. 깨질 때마다 게이지가 쌓이고, 다 깨지면 새 볼로 다시 시작돼.</p>

      <div className="wakpu-stage">
        <button
          type="button"
          className={`wakpu-ball ${shake ? 'is-shaking' : ''} ${isBreaking ? 'is-breaking' : ''}`}
          onClick={handleHit}
          aria-label="왁뿌볼 터뜨리기"
        >
          <img
            src={toy.image}
            alt={toy.name}
            className={`wakpu-ball-img ${toy.isHolo ? 'is-holo' : ''}`}
            style={{ filter: toy.filter }}
          />
          <svg className="wakpu-cracks" viewBox="0 0 200 200">
            {Array.from({ length: crackLineCount }).map((_, i) => {
              const angle = (i / 10) * Math.PI * 2;
              const x2 = 100 + Math.cos(angle) * 90;
              const y2 = 100 + Math.sin(angle) * 90;
              return (
                <line
                  key={i}
                  x1="100" y1="100" x2={x2} y2={y2}
                  stroke="rgba(0,0,0,.4)" strokeWidth="2"
                />
              );
            })}
          </svg>
          {isBreaking && (
            <div className="wakpu-shatter">
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} className="shard" style={{
                  '--angle': `${(i / 12) * 360}deg`,
                  background: toy.accent,
                }} />
              ))}
            </div>
          )}
        </button>
        <div className="wakpu-progress">{hits} / {toy.hitsToBreak} 회</div>
      </div>

      <div className="gauge">
        <div className="gauge-head">
          <span className="gauge-label">왁뿌볼 게이지</span>
          <span className="gauge-value">{Math.min(gauge.wakpuball, gaugeToPull)} / {gaugeToPull}</span>
        </div>
        <div className="gauge-track">
          <div className="gauge-fill" style={{ width: `${Math.min(100, (gauge.wakpuball / gaugeToPull) * 100)}%` }} />
        </div>
      </div>
    </div>
  );
}
