// 뽑기 페이지 — 코인 10개로 유료 등급 오브제 랜덤 획득, 광고 보고 코인 받기
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../store/useGame';
import CapsuleMachine from '../components/CapsuleMachine';
import { playGachaSuccess } from '../utils/sound';

const CATEGORY_LABEL = { wakpuball: '왁뿌볼', keycap: '키캡' };

export default function Gacha() {
  const { coins, pullCost, canPull, pull, equip, equipped, claimAdCoins, toys } = useGame();
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
  const pool = toys[category].filter((t) => t.tier === 'paid');

  return (
    <div className="case-page">
      <div className="case-eyebrow">RANDOM DRAW</div>
      <h1 className="case-title">오브제 뽑기</h1>
      <p className="case-sub">뽑기 비용 코인 {pullCost}개, 유료 등급 디자인 전용, 프리미엄은 스토어에서 구매</p>

      <div className="v2-archive-tabs">
        {['wakpuball', 'keycap'].map((c) => (
          <button
            key={c}
            type="button"
            className={c === category ? 'is-active' : ''}
            onClick={() => { setCategory(c); reset(); }}
          >
            {CATEGORY_LABEL[c]} 캡슐
          </button>
        ))}
      </div>

      <div className="v2-draw-stat-row">
        <span>보유 코인 <b>{coins}</b></span>
        <button type="button" className="v2-btn v2-btn-secondary" onClick={handleWatchAd} disabled={adState !== 'idle'}>
          {adState === 'idle' && '광고 보고 +5 코인'}
          {adState === 'playing' && '광고 재생 중...'}
          {adState === 'done' && '+5 코인 지급 완료'}
        </button>
      </div>

      <CapsuleMachine stage={stage} result={result} />

      {stage === 'result' && result && equipped[result.category] !== result.toy.id && (
        <button
          type="button"
          className="v2-btn v2-btn-secondary"
          style={{ width: '100%', marginBottom: 14 }}
          onClick={() => equip(result.category, result.toy.id)}
        >
          지금 바로 장착하기
        </button>
      )}
      {stage === 'result' && result && equipped[result.category] === result.toy.id && (
        <div className="gacha-equipped-note">장착 완료</div>
      )}

      <div className="v2-draw-odds">
        <div className="v2-draw-odds-label">DRAW RATES</div>
        <div className="v2-draw-odds-line">
          <span>유료 등급 오브제 {pool.length}종 중 균등 확률</span>
          <span>1/{pool.length}</span>
        </div>
      </div>

      {stage === 'result' ? (
        <>
          <button type="button" className="v2-btn v2-btn-primary" style={{ width: '100%', marginBottom: 10 }} onClick={reset}>
            한 번 더 뽑기 ({pullCost}코인)
          </button>
          <Link to="/collection" className="v2-btn v2-btn-secondary" style={{ width: '100%', marginBottom: 10 }}>
            내 컬렉션 확인하기
          </Link>
        </>
      ) : (
        <button
          type="button"
          className="v2-btn v2-btn-primary"
          style={{ width: '100%', marginBottom: 10 }}
          disabled={!ready}
          onClick={handlePull}
        >
          {stage === 'shaking' ? '뽑는 중...' : ready ? `뽑기 (${pullCost}코인)` : '코인 부족'}
        </button>
      )}
    </div>
  );
}
