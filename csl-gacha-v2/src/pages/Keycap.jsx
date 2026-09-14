import { useState, useEffect, useCallback } from 'react';
import { useGame } from '../store/useGame';
import { playKeyClick } from '../utils/sound';

const GAUGE_PER_PRESS = 4;
const KEY_LAYOUT = ['1', '2', '3', '4', '5', '6', '7', '8'];

export default function Keycap() {
  const { equipped, getToy, addGauge, gauge, gaugeToPull } = useGame();
  const toy = getToy('keycap', equipped.keycap);
  const [pressed, setPressed] = useState({});

  const pressKey = useCallback((key) => {
    playKeyClick();
    addGauge('keycap', GAUGE_PER_PRESS);
    setPressed((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setPressed((prev) => ({ ...prev, [key]: false }));
    }, 110);
  }, [addGauge]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (KEY_LAYOUT.includes(e.key) && !e.repeat) {
        pressKey(e.key);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pressKey]);

  if (!toy) return null;

  return (
    <div className="case-page">
      <div className="case-eyebrow">03 // 키캡 룸</div>
      <h1 className="case-title">{toy.name}</h1>
      <p className="case-sub">아래 키를 클릭하거나, 키보드 숫자 1~8을 직접 눌러도 돼.</p>

      <div className="keycap-board">
        {KEY_LAYOUT.map((key) => (
          <button
            key={key}
            type="button"
            className={`keycap-key ${pressed[key] ? 'is-pressed' : ''}`}
            onMouseDown={() => pressKey(key)}
          >
            <img
              src={toy.image}
              alt=""
              className={`keycap-key-img ${toy.isHolo ? 'is-holo' : ''}`}
              style={{ filter: toy.filter }}
            />
            <span className="keycap-key-label">{key}</span>
          </button>
        ))}
      </div>

      <div className="gauge">
        <div className="gauge-head">
          <span className="gauge-label">키캡 게이지</span>
          <span className="gauge-value">{Math.min(gauge.keycap, gaugeToPull)} / {gaugeToPull}</span>
        </div>
        <div className="gauge-track">
          <div className="gauge-fill" style={{ width: `${Math.min(100, (gauge.keycap / gaugeToPull) * 100)}%` }} />
        </div>
      </div>
    </div>
  );
}
