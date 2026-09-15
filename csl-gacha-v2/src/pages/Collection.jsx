import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '../store/useGame';

const CATEGORY_LABEL = { wakpuball: '왁뿌볼', keycap: '키캡' };
const GRADE_BADGE = { common: 'is-common', rare: 'is-rare', limited: 'is-limited' };
const GRADE_LABEL = { common: 'COMMON', rare: 'RARE', limited: 'LIMITED' };

export default function Collection() {
  const { toys, owned, equipped, equip } = useGame();
  const navigate = useNavigate();
  const [category, setCategory] = useState('wakpuball');
  const [selectedId, setSelectedId] = useState(null);

  const ownedCount = owned.length;
  const totalCount = toys.wakpuball.length + toys.keycap.length;
  const list = toys[category];
  const selected = list.find((t) => t.id === selectedId) || null;
  const isSelectedOwned = selected && owned.includes(selected.id);
  const isSelectedEquipped = selected && equipped[category] === selected.id;

  return (
    <div className="case-page">
      <div className="case-eyebrow">05 // 도감</div>
      <h1 className="case-title">오브제 도감</h1>
      <p className="case-sub">클릭하면 상세 확인, {ownedCount} / {totalCount} 수집 완료</p>

      <div className="v2-archive-tabs">
        {['wakpuball', 'keycap'].map((c) => (
          <button
            key={c}
            type="button"
            className={c === category ? 'is-active' : ''}
            onClick={() => { setCategory(c); setSelectedId(null); }}
          >
            {CATEGORY_LABEL[c]} ({toys[c].filter((t) => owned.includes(t.id)).length})
          </button>
        ))}
      </div>

      <div className="v2-archive-grid">
        {list.map((toy) => {
          const isOwned = owned.includes(toy.id);
          const isEquipped = equipped[category] === toy.id;
          return (
            <button
              key={toy.id}
              type="button"
              className={`v2-archive-card ${selectedId === toy.id ? 'is-selected' : ''} ${!isOwned ? 'is-locked' : ''}`}
              onClick={() => setSelectedId(toy.id)}
            >
              <div className="v2-archive-thumb">
                {isOwned ? (
                  <img src={toy.image} alt={toy.name} style={{ filter: toy.filter }} className={toy.isHolo ? 'is-holo' : ''} />
                ) : (
                  <>
                    <img src={toy.image} alt="" className="toy-swatch-locked-img" />
                    <span className="lock-icon">🔒</span>
                  </>
                )}
              </div>
              <span className={`v2-badge ${isEquipped ? 'is-active' : isOwned ? (GRADE_BADGE[toy.grade] || 'is-common') : 'is-locked'}`}>
                {isEquipped ? 'ACTIVE' : isOwned ? GRADE_LABEL[toy.grade] : 'LOCKED'}
              </span>
              <span className="v2-archive-name">{isOwned ? toy.name : '미획득'}</span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="v2-card">
          <div className="v2-archive-detail-head">
            <div>
              <div className="v2-archive-detail-name">{isSelectedOwned ? selected.name : '???'}</div>
              <div className="v2-archive-detail-grade">등급: {GRADE_LABEL[selected.grade]}</div>
            </div>
            {isSelectedEquipped && <span className="v2-badge is-active">보유중</span>}
            {isSelectedOwned && !isSelectedEquipped && <span className="v2-badge is-common">보유중</span>}
          </div>
          <p className="v2-archive-detail-desc">
            {isSelectedOwned
              ? `${selected.name} 오브제입니다. 연타하거나 눌러서 고유의 파괴 손맛과 사운드를 즐길 수 있습니다.`
              : selected.tier === 'premium'
                ? '아직 획득하지 못한 프리미엄 오브제입니다. 스토어에서 구매할 수 있습니다.'
                : '아직 획득하지 못한 오브제입니다. 뽑기에서 획득할 수 있습니다.'}
          </p>

          {isSelectedOwned && !isSelectedEquipped && (
            <button type="button" className="v2-btn v2-btn-primary" style={{ width: '100%' }} onClick={() => equip(category, selected.id)}>
              이 오브제로 장착하기
            </button>
          )}
          {!isSelectedOwned && selected.tier === 'premium' && (
            <button type="button" className="v2-btn v2-btn-primary" style={{ width: '100%' }} onClick={() => navigate('/store')}>
              스토어에서 구매하기
            </button>
          )}
          {!isSelectedOwned && selected.tier === 'paid' && (
            <Link to="/gacha" className="v2-btn v2-btn-primary" style={{ width: '100%' }}>
              뽑기에서 획득하기
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
