import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/useGame';
import ToyCard from '../components/ToyCard';

export default function Collection() {
  const { toys, owned, equipped, equip } = useGame();
  const navigate = useNavigate();

  const ownedCount = owned.length;
  const totalCount = toys.wakpuball.length + toys.keycap.length;

  const cardClick = (category, toy) => {
    if (owned.includes(toy.id)) return () => equip(category, toy.id);
    if (toy.tier === 'premium') return () => navigate('/store');
    return undefined;
  };

  return (
    <div className="case-page">
      <div className="case-eyebrow">05 // 도감</div>
      <h1 className="case-title">도감</h1>
      <p className="case-sub">획득한 토이를 클릭하면 장착돼. 잠긴 프리미엄 카드를 누르면 스토어로 이동해. {ownedCount} / {totalCount} 수집 완료.</p>

      <h3 className="collection-section-title">왁뿌볼</h3>
      <div className="collection-grid">
        {toys.wakpuball.map((toy) => (
          <ToyCard
            key={toy.id}
            toy={toy}
            shape="ball"
            owned={owned.includes(toy.id)}
            equipped={equipped.wakpuball === toy.id}
            onClick={cardClick('wakpuball', toy)}
          />
        ))}
      </div>

      <h3 className="collection-section-title">키캡</h3>
      <div className="collection-grid">
        {toys.keycap.map((toy) => (
          <ToyCard
            key={toy.id}
            toy={toy}
            shape="key"
            owned={owned.includes(toy.id)}
            equipped={equipped.keycap === toy.id}
            onClick={cardClick('keycap', toy)}
          />
        ))}
      </div>
    </div>
  );
}
