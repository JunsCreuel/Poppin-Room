import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '../store/useGame';
import RoomStage from '../components/RoomStage';

const CATEGORY_LABEL = { wakpuball: '왁뿌볼', keycap: '키캡' };
const GRADE_BADGE = { common: 'is-common', rare: 'is-rare', limited: 'is-limited' };
const GRADE_LABEL = { common: 'COMMON', rare: 'RARE', limited: 'LIMITED' };

// 컬렉션 — 위쪽은 "내 방"(뽑기·상점에서 얻은 오브제를 드래그로 자유 배치해
// 꾸미는 공간), 아래쪽은 "가방"(보유한 오브제 인벤토리). 가방에서 오브제를
// 고르면 장착하거나 방에 놓을 수 있고, 방의 오브제는 × 로 다시 가방으로.
export default function Collection() {
  const { toys, owned, equipped, equip, room, roomSlots, placeInRoom, moveInRoom, removeFromRoom } = useGame();
  const navigate = useNavigate();
  const [category, setCategory] = useState('wakpuball');
  const [selectedId, setSelectedId] = useState(null);

  const allToys = ['wakpuball', 'keycap'].flatMap((c) => toys[c].map((t) => ({ ...t, category: c })));
  const findToy = (id) => allToys.find((t) => t.id === id) || null;

  const ownedCount = owned.length;
  const totalCount = allToys.length;
  const isInRoom = (id) => room.some((r) => r.id === id);
  const roomFull = room.length >= roomSlots;

  const bag = toys[category].filter((t) => owned.includes(t.id));
  const locked = toys[category].filter((t) => !owned.includes(t.id));
  const selected = selectedId ? findToy(selectedId) : null;
  const isSelectedOwned = selected && owned.includes(selected.id);
  const isSelectedEquipped = selected && equipped[selected.category] === selected.id;
  const isSelectedPlaced = selected && isInRoom(selected.id);

  const renderCard = (toy, isOwned) => {
    const isEquipped = equipped[category] === toy.id;
    const isPlaced = isInRoom(toy.id);
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
        <span className="v2-archive-name">{isOwned ? toy.name : '미획득'}{isPlaced ? ' · 방' : ''}</span>
      </button>
    );
  };

  return (
    <div className="case-page">
      <div className="case-eyebrow">05 // 컬렉션</div>
      <h1 className="case-title">내 방</h1>
      <p className="case-sub">가방의 오브제를 방에 배치, 드래그로 원하는 위치에 이동, 최대 {roomSlots}개</p>

      <RoomStage items={room} findToy={findToy} onMove={moveInRoom} onRemove={removeFromRoom} maxItems={roomSlots} />

      <h3 className="collection-section-title">가방 ({ownedCount} / {totalCount})</h3>

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
        {bag.map((toy) => renderCard(toy, true))}
      </div>

      {selected && (
        <div className="v2-card">
          <div className="v2-archive-detail-head">
            <div>
              <div className="v2-archive-detail-name">{isSelectedOwned ? selected.name : '???'}</div>
              <div className="v2-archive-detail-grade">{CATEGORY_LABEL[selected.category]} · 등급: {GRADE_LABEL[selected.grade]}</div>
            </div>
            {isSelectedEquipped && <span className="v2-badge is-active">장착중</span>}
            {isSelectedOwned && !isSelectedEquipped && <span className="v2-badge is-common">보유중</span>}
          </div>
          <p className="v2-archive-detail-desc">
            {isSelectedOwned
              ? `${selected.name} 오브제, 장착 시 룸에서 사용, 방에 놓으면 내 방 꾸미기에 표시`
              : selected.tier === 'premium'
                ? '미획득 프리미엄 오브제, 상점에서 구매 획득 가능'
                : '미획득 오브제, 뽑기로 획득 가능'}
          </p>

          {isSelectedOwned && (
            <div className="v2-btn-row" style={{ margin: 0 }}>
              <button
                type="button"
                className="v2-btn v2-btn-primary"
                disabled={isSelectedEquipped}
                onClick={() => equip(selected.category, selected.id)}
              >
                {isSelectedEquipped ? '장착중' : '장착하기'}
              </button>
              {isSelectedPlaced ? (
                <button type="button" className="v2-btn v2-btn-secondary" onClick={() => removeFromRoom(selected.id)}>
                  방에서 빼기
                </button>
              ) : (
                <button
                  type="button"
                  className="v2-btn v2-btn-secondary"
                  disabled={roomFull}
                  onClick={() => placeInRoom(selected.id)}
                >
                  {roomFull ? '방 가득 참' : '방에 놓기'}
                </button>
              )}
            </div>
          )}
          {!isSelectedOwned && selected.tier === 'premium' && (
            <button type="button" className="v2-btn v2-btn-primary" style={{ width: '100%' }} onClick={() => navigate('/shop')}>
              상점에서 구매하기
            </button>
          )}
          {!isSelectedOwned && selected.tier === 'paid' && (
            <Link to="/gacha" className="v2-btn v2-btn-primary" style={{ width: '100%' }}>
              뽑기에서 획득하기
            </Link>
          )}
        </div>
      )}

      {locked.length > 0 && (
        <>
          <h3 className="collection-section-title" style={{ marginTop: 28 }}>아직 없는 오브제 ({locked.length})</h3>
          <div className="v2-archive-grid">
            {locked.map((toy) => renderCard(toy, false))}
          </div>
        </>
      )}
    </div>
  );
}
