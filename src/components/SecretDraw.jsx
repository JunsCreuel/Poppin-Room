// 시크릿 룸 무대 컴포넌트 — 입장권 확인, 클릭 1번에 흔들흔들 → 카드 결과(코인/키/히든카드/꽝), 확률표
import { useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useGame } from '../store/useGame';
import { playCrackHit, playGachaSuccess } from '../utils/sound';

const WOBBLE_MS = 1200; // 흔들리는 시간, CSS secretWobble과 맞출 것

const RESULT_VIEW = {
  coins: (r) => ({ emoji: '🪙', title: `+${r.amount} 코인`, desc: '코인 지급 완료', cls: '' }),
  keys: (r) => ({ emoji: '🔑', title: `시크릿 키 ${r.amount}개`, desc: '키 지급 완료', cls: '' }),
  hidden: () => ({ emoji: '🎉', title: '히든카드!', desc: '내 계정에 보관, 실물 경품 수령 안내는 내 계정에서 확인', cls: 'is-hidden' }),
  miss: () => ({ emoji: '💨', title: '꽝', desc: '다음 기회에', cls: 'is-miss' }),
};

export default function SecretDraw({ category, image, alt }) {
  const { secretEntry, drawSecretCard, secretCardTable, secretKeys } = useGame();
  const [phase, setPhase] = useState('ready'); // ready | shaking | result
  const [result, setResult] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  // 입장권 없이 주소로 직접 들어오면 시크릿 입구로 (결과 화면은 예외)
  if (phase === 'ready' && secretEntry !== category) {
    return <Navigate to="/secret" replace />;
  }

  const handleClick = () => {
    if (phase !== 'ready') return;
    setPhase('shaking');
    playCrackHit(0.5, true);
    timeoutRef.current = setTimeout(() => {
      const r = drawSecretCard(category);
      setResult(r ?? { type: 'miss' });
      setPhase('result');
      if (r && r.type !== 'miss') playGachaSuccess();
    }, WOBBLE_MS);
  };

  const view = result ? RESULT_VIEW[result.type](result) : null;

  return (
    <>
      <div className="v2-card">
        <div className="secret-stage">
          <button
            type="button"
            className={`secret-toy ${phase === 'shaking' ? 'is-shaking' : ''}`}
            onClick={handleClick}
            disabled={phase !== 'ready'}
            aria-label={alt}
          >
            <img src={image} alt={alt} className="is-holo-strong" draggable="false" />
          </button>

          {phase === 'ready' && <div className="v2-keydeck-banner">👆 클릭 1번, 흔들린 뒤 카드 1장</div>}
          {phase === 'shaking' && <div className="v2-keydeck-banner">✨ 흔들흔들...</div>}
          {phase === 'result' && view && (
            <div className={`secret-card ${view.cls}`}>
              <div className="secret-card-emoji">{view.emoji}</div>
              <div className="secret-card-title">{view.title}</div>
              <div className="secret-card-desc">{view.desc}</div>
              {result.type === 'hidden' && <div className="secret-card-code">{result.card.code}</div>}
            </div>
          )}
        </div>

        <div className="secret-odds">
          <div className="secret-odds-row"><span>CARD RATES</span><span>1회 입장 = 키 1개</span></div>
          {secretCardTable.map((row) => (
            <div key={`${row.type}-${row.amount ?? ''}`} className="secret-odds-row">
              <span>{row.type === 'coins' ? `${row.amount} 코인` : row.type === 'keys' ? `시크릿 키 ${row.amount}개` : '히든카드'}</span>
              <b>{row.pct}%</b>
            </div>
          ))}
          <div className="secret-odds-row"><span>꽝</span><b>{(100 - secretCardTable.reduce((a, r) => a + r.pct, 0)).toFixed(2)}%</b></div>
        </div>
      </div>

      {phase === 'result' && (
        <div className="v2-btn-row">
          <Link to="/secret" className="v2-btn v2-btn-primary">시크릿 룸으로 (보유 키 {secretKeys})</Link>
          <Link to="/shop" className="v2-btn v2-btn-secondary">상점에서 키 구매</Link>
        </div>
      )}
    </>
  );
}
