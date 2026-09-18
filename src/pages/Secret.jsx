// 시크릿 룸 입구 페이지 — 시크릿 키 1개로 히든 팝볼 룸 또는 히든 키캡 룸 중 하나 1회 입장
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '../store/useGame';

const ROOMS = [
  { category: 'wakpuball', to: '/hidden/wakpuball', img: 'images/hidden_wakpuball.png', title: '히든 팝볼 룸' },
  { category: 'keycap', to: '/hidden/keycap', img: 'images/hidden_keycap.png', title: '히든 키캡 룸' },
];

export default function Secret() {
  const { hiddenCards, secretKeys, secretKeyPrice, secretEntry, enterSecretRoom } = useGame();
  const navigate = useNavigate();
  const hasKey = secretKeys > 0;

  const handleEnter = (room) => {
    if (enterSecretRoom(room.category)) navigate(room.to);
  };

  return (
    <div className="case-page">
      <div className="case-eyebrow">SECRET ROOM</div>
      <h1 className="case-title">시크릿 룸</h1>
      <p className="case-sub">시크릿 키 1개 = 룸 1곳 1회 입장, 카드 1장 획득</p>

      {secretEntry ? (
        <div className="v2-keydeck-banner">🎟️ 입장권 있음 — {secretEntry === 'wakpuball' ? '히든 팝볼 룸' : '히든 키캡 룸'} 입장 가능</div>
      ) : hasKey ? (
        <div className="v2-keydeck-banner">🔑 보유 시크릿 키 {secretKeys}개 — 들어갈 룸 선택</div>
      ) : (
        <div className="v2-keydeck-banner">🔒 시크릿 키 필요 — 상점 {secretKeyPrice}코인 구매, 광고 보고 받기(하루 3개), 팝볼·키캡 타격 시 0.06% 드롭</div>
      )}

      <div className="v2-section-label">Secret Rooms</div>
      <div className="v2-playroom-list">
        {ROOMS.map((room) => {
          const isEntry = secretEntry === room.category;
          const locked = !isEntry && (!hasKey || !!secretEntry);
          return (
            <button
              key={room.category}
              type="button"
              className={`v2-playroom-row ${locked ? 'is-locked' : ''}`}
              onClick={() => (isEntry ? navigate(room.to) : handleEnter(room))}
              disabled={locked}
            >
              <div className="v2-playroom-thumb">
                <img src={room.img} alt="" className="is-holo-strong" />
              </div>
              <div className="v2-playroom-body">
                <div className="v2-playroom-title">{room.title}</div>
                <div className="v2-playroom-desc">카드 1장 — 코인·키·히든카드 중 하나</div>
                {isEntry
                  ? <span className="v2-badge is-active">키 사용하기</span>
                  : locked
                    ? <span className="v2-badge is-locked">LOCKED 🔒</span>
                    : <span className="v2-badge is-limited">키 1개 사용</span>}
              </div>
              <span className="v2-playroom-arrow">{locked ? '🔒' : '→'}</span>
            </button>
          );
        })}
      </div>

      {!hasKey && !secretEntry && (
        <div className="v2-btn-row">
          <Link to="/shop" className="v2-btn v2-btn-primary">상점에서 키 구매</Link>
        </div>
      )}

      <div className="lab-footer-note">
        획득한 히든카드 {hiddenCards.length}장 · <Link to="/account">내 계정에서 확인</Link>
      </div>
    </div>
  );
}
