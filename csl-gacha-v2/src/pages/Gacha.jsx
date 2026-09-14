import { useState, useCallback } from 'react';
import { useGame } from '../store/useGame';
import CapsuleMachine from '../components/CapsuleMachine';
import { playGachaSuccess } from '../utils/sound';

const CATEGORY_LABEL = { wakpuball: '왁뿌볼', keycap: '키캡' };

export default function Gacha() {
  const { gauge, gaugeToPull, canPull, pull } = useGame();
  const [category, setCategory] = useState('wakpuball');
  const [stage, setStage] = useState('idle'); // idle | shaking | result
  const [result, setResult] = useState(null);

  const handlePull = useCallback(() => {
    if (!canPull(category) || stage === 'shaking') return;
    setStage('shaking');
    setResult(null);

    setTimeout(() => {
      const outcome = pull(category);
      if (outcome) {
        playGachaSuccess(outcome.toy.grade);
        setResult(outcome);
        setStage('result');
      } else {
        setStage('idle');
      }
    }, 900);
  }, [category, stage, canPull, pull]);

  const reset = () => {
    setStage('idle');
    setResult(null);
  };

  const ready = canPull(category) && stage === 'idle';

  return (
    <div className="case-page">
      <div className="case-eyebrow">04 // 뽑기</div>
      <h1 className="case-title">캡슐 뽑기</h1>
      <p className="case-sub">게이지가 다 차면 캡슐을 뽑을 수 있어. Common 70% · Rare 25% · Limited 5%.</p>

      <div className="gacha-tabs">
        {['wakpuball', 'keycap'].map((c) => (
          <button
            key={c}
            type="button"
            className={c === category ? 'is-active' : ''}
            onClick={() => { setCategory(c); reset(); }}
          >
            {CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>

      <CapsuleMachine stage={stage} result={result} />

      <div className="gauge" style={{ margin: '24px 0' }}>
        <div className="gauge-head">
          <span className="gauge-label">{CATEGORY_LABEL[category]} 게이지</span>
          <span className="gauge-value">{Math.min(gauge[category], gaugeToPull)} / {gaugeToPull}</span>
        </div>
        <div className="gauge-track">
          <div className="gauge-fill" style={{ width: `${Math.min(100, (gauge[category] / gaugeToPull) * 100)}%` }} />
        </div>
      </div>

      {stage === 'result' ? (
        <button type="button" className="gacha-btn" onClick={reset}>확인</button>
      ) : (
        <button type="button" className="gacha-btn" disabled={!ready} onClick={handlePull}>
          {stage === 'shaking' ? '뽑는 중...' : ready ? '뽑기' : '게이지가 부족해'}
        </button>
      )}
    </div>
  );
}
