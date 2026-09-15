import { useState } from 'react';
import { useGame } from '../store/useGame';
import ToyCard from './ToyCard';

// 왁뿌볼/키캡 룸에서 바로 디자인을 바꿔 낄 수 있는 인벤토리 —
// 기본은 접혀 있고 "내 디자인 열기"를 누르면 보유한 디자인만 도감 카드
// 형식(기본/유료/프리미엄 등급 배지 포함)으로 펼쳐진다. 고르면 바로
// 장착되고 패널은 닫힌다.
export default function DesignPicker({ category }) {
  const { toys, owned, equipped, equip } = useGame();
  const [open, setOpen] = useState(false);

  const ownedToys = toys[category].filter((t) => owned.includes(t.id));
  if (ownedToys.length <= 1) return null;

  const handlePick = (id) => {
    equip(category, id);
    setOpen(false);
  };

  return (
    <div className="design-picker">
      <button
        type="button"
        className="v2-btn v2-btn-secondary design-picker-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        오브제 변경 ({ownedToys.length}) {open ? '▲' : '▼'}
      </button>
      {open && (
        <div className="design-picker-panel collection-grid">
          {ownedToys.map((toy) => (
            <ToyCard
              key={toy.id}
              toy={toy}
              owned
              equipped={equipped[category] === toy.id}
              onClick={() => handlePick(toy.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
