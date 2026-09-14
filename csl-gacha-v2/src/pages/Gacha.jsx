import { useState, useCallback } from 'react';
import { useGame } from '../store/useGame';
import CapsuleMachine from '../components/CapsuleMachine';
import { playGachaSuccess } from '../utils/sound';

const CATEGORY_LABEL = { wakpuball: '왁뿌볼', keycap: '키캡' };

export default function Gacha() {
  const { coins, pullCost, canPull, pull, equip, equipped, claimAdCoins } = useGame();
  const [category, setCategory] = useState('wakpuball');
  const [stage, setStage] = useState('idle'); // idle | shaking | result
  const [result, setResult] = useState(null);
  const [adState, setAdState] = useState('idle'); // idle | playing | done

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

  const handleWatchAd = () => {
    if (adState !== 'idle') return;
    setAdState('playing');
    // 실제 광고 SDK가 없어서 재생되는 흉내만 낸 뒤 코인을 지급하는 mock.
    setTimeout(() => {
      claimAdCoins();
      setAdState('done');
      setTimeout(() => setAdState('idle'), 1200);
    }, 1800);
  };

  const ready = canPull(category) && stage === 'idle';

  return (
    <div className="case-page">
      <div className="case-eyebrow">04 // 뽑기</div>
      <h1 className="case-title">캡슐 뽑기</h1>
      <p className="case-sub">뽑기 비용 코인 {pullCost}개, 유료 등급 디자인 전용, 프리미엄은 스토어에서 구매</p>

      <div className="coin-bar">
        <span className="coin-bar-balance">🪙 {coins} 코인</span>
        <button type="button" className="ad-btn" onClick={handleWatchAd} disabled={adState !== 'idle'}>
          {adState === 'idle' && '광고 보고 5코인 받기'}
          {adState === 'playing' && '광고 재생 중...'}
          {adState === 'done' && '+5 코인 지급 완료'}
        </button>
      </div>

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

      {stage === 'result' && result && equipped[result.category] !== result.toy.id && (
        <button
          type="button"
          className="gacha-equip-btn"
          onClick={() => equip(result.category, result.toy.id)}
        >
          지금 바로 장착하기
        </button>
      )}
      {stage === 'result' && result && equipped[result.category] === result.toy.id && (
        <div className="gacha-equipped-note">장착 완료</div>
      )}

      {stage === 'result' ? (
        <button type="button" className="gacha-btn" onClick={reset}>확인</button>
      ) : (
        <button type="button" className="gacha-btn" disabled={!ready} onClick={handlePull}>
          {stage === 'shaking' ? '뽑는 중...' : ready ? `뽑기 (${pullCost}코인)` : '코인 부족'}
        </button>
      )}
    </div>
  );
}
