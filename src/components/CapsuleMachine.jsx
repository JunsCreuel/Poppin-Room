// 캡슐머신 컴포넌트 — 뽑기 대기/흔들림/결과 카드 표시
const GRADE_BADGE = { common: 'is-common', rare: 'is-rare', premium: 'is-premium', limited: 'is-limited' };

export default function CapsuleMachine({ stage, result }) {
  if (stage === 'result' && result) {
    return (
      <div className={`v2-card v2-draw-result-card reveal-${result.toy.grade}`}>
        <div className="v2-draw-result-badge">
          <span className={`v2-badge ${GRADE_BADGE[result.toy.grade] || 'is-common'}`}>
            {result.toy.grade === 'limited' ? 'LIMITED OBJECT DRAW!' : result.toy.grade.toUpperCase()}
          </span>
        </div>
        <div className="v2-draw-result-ring">
          <img
            src={result.toy.image}
            alt={result.toy.name}
            style={{ filter: result.toy.filter }}
            className={result.toy.isHolo ? 'is-holo' : ''}
          />
        </div>
        <div className="v2-draw-result-name">{result.toy.name}</div>
        <div className="v2-draw-result-grade">{result.toy.grade.toUpperCase()}</div>
        {result.isDuplicate && (
          <div className="capsule-dup-note">이미 보유 중 — 게이지 일부 환급됨</div>
        )}
      </div>
    );
  }

  return (
    <div className={`capsule-machine stage-${stage}`}>
      <img
        src="images/gacha_machine.png"
        alt="캡슐 뽑기 기계"
        className={`capsule-machine-img ${stage === 'shaking' ? 'shaking' : ''}`}
      />
    </div>
  );
}
