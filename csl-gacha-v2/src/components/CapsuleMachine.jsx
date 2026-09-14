export default function CapsuleMachine({ stage, result }) {
  return (
    <div className={`capsule-machine stage-${stage} ${result ? `reveal-${result.toy.grade}` : ''}`}>
      {stage === 'idle' && (
        <div className="capsule-orb idle" />
      )}

      {stage === 'shaking' && (
        <div className="capsule-orb shaking" />
      )}

      {stage === 'result' && result && (
        <div className="capsule-result">
          <div className="capsule-toy-swatch">
            <img
              src={result.toy.image}
              alt={result.toy.name}
              style={{ filter: result.toy.filter }}
              className={result.toy.isHolo ? 'is-holo' : ''}
            />
          </div>
          <div className="capsule-grade-tag">{result.toy.grade.toUpperCase()}</div>
          <div className="capsule-toy-name">{result.toy.name}</div>
          {result.isDuplicate && (
            <div className="capsule-dup-note">이미 보유 중 — 게이지 일부 환급됨</div>
          )}
        </div>
      )}
    </div>
  );
}
