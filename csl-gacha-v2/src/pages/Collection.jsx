import { useGame } from '../store/useGame';
import ToyCard from '../components/ToyCard';

export default function Collection() {
  const { toys, owned, equipped, equip } = useGame();

  const ownedCount = owned.length;
  const totalCount = toys.wakpuball.length + toys.keycap.length;

  return (
    <div className="case-page">
      <div className="case-eyebrow">05 // 컬렉션</div>
      <h1 className="case-title">도감</h1>
      <p className="case-sub">획득한 토이를 클릭하면 장착돼. {ownedCount} / {totalCount} 수집 완료.</p>

      <h3 className="collection-section-title">왁뿌볼</h3>
      <div className="collection-grid">
        {toys.wakpuball.map((toy) => (
          <ToyCard
            key={toy.id}
            toy={toy}
            shape="ball"
            owned={owned.includes(toy.id)}
            equipped={equipped.wakpuball === toy.id}
            onClick={owned.includes(toy.id) ? () => equip('wakpuball', toy.id) : undefined}
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
            onClick={owned.includes(toy.id) ? () => equip('keycap', toy.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
