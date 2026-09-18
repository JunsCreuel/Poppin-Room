// 시크릿 룸 입구 페이지 — 시크릿 키로 24시간 개방, 열리면 히든 팝볼/키캡 룸으로 이동
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../store/useGame';

function formatRemaining(ms) {
  const totalMin = Math.max(0, Math.ceil(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return `${m}분`;
  return `${h}시간 ${m}분`;
}

export default function Secret() {
  const { hiddenAttempts, hiddenCap, hiddenCards, secretKeys, secretKeyPrice, secretOpen, secretOpenUntil, useSecretKey } = useGame();
  const wbLeft = Math.max(0, hiddenCap.wakpuball - hiddenAttempts.wakpuball);
  const kcLeft = Math.max(0, hiddenCap.keycap - hiddenAttempts.keycap);

  // 남은 개방 시간 표시를 30초마다 갱신
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!secretOpen) return undefined;
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, [secretOpen]);

  const rooms = [
    { to: '/hidden/wakpuball', img: 'images/hidden_wakpuball.png', title: '히든 팝볼 룸', left: wbLeft },
    { to: '/hidden/keycap', img: 'images/hidden_keycap.png', title: '히든 키캡 룸', left: kcLeft },
  ];

  const renderRoomBody = (room) => (
    <>
      <div className="v2-playroom-thumb">
        <img src={room.img} alt="" className="is-holo-strong" />
      </div>
      <div className="v2-playroom-body">
        <div className="v2-playroom-title">{room.title}</div>
        <div className="v2-playroom-desc">코인 없이 0.6% 히든카드 도전</div>
        {secretOpen
          ? <span className="v2-badge is-limited">오늘 {room.left}번 남음</span>
          : <span className="v2-badge is-locked">LOCKED 🔒</span>}
      </div>
      <span className="v2-playroom-arrow">{secretOpen ? '→' : '🔒'}</span>
    </>
  );

  return (
    <div className="case-page">
      <div className="case-eyebrow">SECRET ROOM</div>
      <h1 className="case-title">시크릿 룸</h1>
      <p className="case-sub">코인 없이 0.6% 히든카드만 도전, 하루 40번(광고로 최대 60번)</p>

      {secretOpen ? (
        <div className="v2-keydeck-banner">🔓 시크릿 룸 개방 중 — 남은 시간 {formatRemaining(secretOpenUntil - Date.now())}</div>
      ) : (
        <>
          <div className="v2-keydeck-banner">🔒 시크릿 키 필요 — 상점 {secretKeyPrice}코인 구매 또는 팝볼·키캡 타격 시 1% 드롭</div>
          <div className="v2-card" style={{ marginBottom: 20 }}>
            <div className="v2-archive-detail-head">
              <div>
                <div className="v2-archive-detail-name">보유 시크릿 키 {secretKeys}개</div>
                <div className="v2-archive-detail-grade">키 1개 사용 시 24시간 개방</div>
              </div>
            </div>
            <div className="v2-btn-row" style={{ margin: 0 }}>
              <button type="button" className="v2-btn v2-btn-primary" disabled={secretKeys < 1} onClick={useSecretKey}>
                {secretKeys < 1 ? '키 없음' : '키 사용해 열기'}
              </button>
              <Link to="/shop" className="v2-btn v2-btn-secondary">상점에서 키 구매</Link>
            </div>
          </div>
        </>
      )}

      <div className="v2-section-label">Secret Rooms</div>
      <div className="v2-playroom-list">
        {rooms.map((room) => (
          secretOpen ? (
            <Link key={room.to} to={room.to} className="v2-playroom-row">{renderRoomBody(room)}</Link>
          ) : (
            <div key={room.to} className="v2-playroom-row is-locked" aria-disabled="true">{renderRoomBody(room)}</div>
          )
        ))}
      </div>

      <div className="lab-footer-note">
        획득한 히든카드 {hiddenCards.length}장 · <Link to="/account">내 계정에서 확인</Link>
      </div>
    </div>
  );
}
