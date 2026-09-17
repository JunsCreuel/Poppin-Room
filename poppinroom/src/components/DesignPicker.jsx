// 디자인 선택 컴포넌트 — 룸 안에서 보유 디자인을 바로 장착
import { useState } from 'react';
import { useGame } from '../store/useGame';
import ToyCard from './ToyCard';

// 기본은 접힘, 열면 보유 디자인 카드 목록, 고르면 즉시 장착 후 닫힘
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
