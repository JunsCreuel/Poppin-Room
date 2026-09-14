const GRADE_LABEL = { common: 'COMMON', rare: 'RARE', limited: 'LIMITED' };
const LOCK_HINT = { paid: '뽑기에서 획득', premium: '스토어에서 구매' };

export default function ToyCard({ toy, owned, equipped, onClick }) {
  const locked = !owned;

  return (
    <button
      type="button"
      className={`toy-card grade-${toy.grade} ${equipped ? 'is-equipped' : ''} ${locked ? 'is-locked' : ''}`}
      onClick={onClick}
      disabled={locked && !onClick}
    >
      <div className="toy-swatch">
        {!locked && (
          <img
            src={toy.image}
            alt={toy.name}
            style={{ filter: toy.filter }}
            className={toy.isHolo ? 'is-holo' : ''}
          />
        )}
      </div>
      <div className="toy-name">{locked ? '???' : toy.name}</div>
      <div className="toy-grade">{GRADE_LABEL[toy.grade]}</div>
      {locked && LOCK_HINT[toy.tier] && <div className="toy-lock-hint">{LOCK_HINT[toy.tier]}</div>}
      {equipped && <div className="toy-equipped-tag">장착중</div>}
    </button>
  );
}
