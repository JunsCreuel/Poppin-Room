import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../store/useGame';

export default function Lab() {
  const { coins, pullCost, canPull, getToy, equipped, owned, toys, hiddenAttempts, hiddenCap } = useGame();
  const wakpu = getToy('wakpuball', equipped.wakpuball);
  const keycap = getToy('keycap', equipped.keycap);
  const [roomTab, setRoomTab] = useState('normal'); // normal | hidden

  const readyAny = canPull('wakpuball') || canPull('keycap');
  const totalCount = toys.wakpuball.length + toys.keycap.length;

  const wbLeft = Math.max(0, hiddenCap.wakpuball - hiddenAttempts.wakpuball);
  const kcLeft = Math.max(0, hiddenCap.keycap - hiddenAttempts.keycap);

  return (
    <div className="case-page">
      <div className="case-eyebrow">00 // CSL LAB</div>
      <h1 className="case-title">손이 근질거릴 때 들어오는<br />사이버 피젯 랩</h1>
      <p className="case-sub">놀 때마다 코인 획득, 코인으로 뽑기, 뽑은 토이는 도감에 저장</p>

      <div className="gacha-tabs lab-room-tabs">
        <button type="button" className={roomTab === 'normal' ? 'is-active' : ''} onClick={() => setRoomTab('normal')}>
          일반 룸
        </button>
        <button type="button" className={roomTab === 'hidden' ? 'is-active' : ''} onClick={() => setRoomTab('hidden')}>
          히든 룸
        </button>
      </div>

      {roomTab === 'normal' ? (
        <div className="lab-rooms">
          <Link to="/wakpuball" className="lab-room-card">
            <div className="lab-room-swatch">
              {wakpu && <img src={wakpu.image} alt="" style={{ filter: wakpu.filter }} />}
            </div>
            <div className="lab-room-body">
              <div className="lab-room-label">왁뿌볼 룸</div>
              <div className="lab-room-desc">갑자기 치미는 화 — 연타로 파괴</div>
            </div>
          </Link>

          <Link to="/keycap" className="lab-room-card">
            <div className="lab-room-swatch">
              {keycap && <img src={keycap.image} alt="" style={{ filter: keycap.filter }} />}
            </div>
            <div className="lab-room-body">
              <div className="lab-room-label">키캡 룸</div>
              <div className="lab-room-desc">가라앉지 않는 초조함 — 꾹꾹 눌러 소리내기</div>
            </div>
          </Link>
        </div>
      ) : (
        <div className="lab-rooms">
          <Link to="/hidden/wakpuball" className="lab-room-card is-hidden-card">
            <div className="lab-room-swatch">
              <img src="images/hidden_wakpuball.png" alt="" className="is-holo-strong" />
            </div>
            <div className="lab-room-body">
              <div className="lab-room-label">히든 왁뿌볼 룸</div>
              <div className="lab-room-desc">코인 없이 0.6% 히든카드 도전</div>
              <div className="lab-room-gauge">오늘 {wbLeft}번 남음</div>
            </div>
          </Link>

          <Link to="/hidden/keycap" className="lab-room-card is-hidden-card">
            <div className="lab-room-swatch">
              <img src="images/hidden_keycap.png" alt="" className="is-holo-strong" />
            </div>
            <div className="lab-room-body">
              <div className="lab-room-label">히든 키캡 룸</div>
              <div className="lab-room-desc">코인 없이 0.6% 히든카드 도전</div>
              <div className="lab-room-gauge">오늘 {kcLeft}번 남음</div>
            </div>
          </Link>
        </div>
      )}

      <div className="lab-coin-row">
        <span className="lab-coin-balance">🪙 {coins} 코인</span>
        <Link to="/gacha" className={`gacha-cta ${readyAny ? 'is-ready' : ''}`}>
          {readyAny ? `뽑으러 가기 (${pullCost}코인) →` : `뽑기 (코인 ${pullCost}개 필요) →`}
        </Link>
      </div>

      <div className="lab-footer-note">
        수집 현황 {owned.length} / {totalCount} · <Link to="/collection">도감 보기</Link> · <Link to="/store">프리미엄 스토어</Link>
      </div>
    </div>
  );
}
