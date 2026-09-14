import { useGame } from '../store/useGame';

// 왁뿌볼/키캡 룸에서 바로 디자인을 바꿔 낄 수 있는 가로 스와치 목록 —
// 보유한 디자인만 보여주고, 클릭하면 즉시 장착돼서 페이지 이동 없이
// 바로 반영된다.
export default function DesignPicker({ category }) {
  const { toys, owned, equipped, equip } = useGame();

  const ownedToys = toys[category].filter((t) => owned.includes(t.id));
  if (ownedToys.length <= 1) return null;

  return (
    <div className="design-picker">
      <div className="design-picker-label">내 디자인</div>
      <div className="design-picker-row">
        {ownedToys.map((toy) => (
          <button
            key={toy.id}
            type="button"
            className={`design-picker-swatch ${equipped[category] === toy.id ? 'is-equipped' : ''}`}
            onClick={() => equip(category, toy.id)}
            aria-label={toy.name}
            title={toy.name}
          >
            <img
              src={toy.image}
              alt={toy.name}
              style={{ filter: toy.filter }}
              className={toy.isHolo ? 'is-holo' : ''}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
