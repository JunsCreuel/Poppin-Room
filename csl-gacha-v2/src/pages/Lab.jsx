import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../store/useGame';

const HOME_GAUGE_GOAL = 500; // 홈 화면 스트레스 게이지 상단 목표치(코인 기준)

export default function Lab() {
  const { coins, pullCost, canPull, getToy, equipped, owned, toys, hiddenAttempts, hiddenCap } = useGame();
  const wakpu = getToy('wakpuball', equipped.wakpuball);
  const keycap = getToy('keycap', equipped.keycap);
  const [roomTab, setRoomTab] = useState('normal'); // normal | hidden

  const readyAny = canPull('wakpuball') || canPull('keycap');
  const totalCount = toys.wakpuball.length + toys.keycap.length;
  const gaugePct = Math.min(100, Math.round((coins / HOME_GAUGE_GOAL) * 100));

  const wbLeft = Math.max(0, hiddenCap.wakpuball - hiddenAttempts.wakpuball);
  const kcLeft = Math.max(0, hiddenCap.keycap - hiddenAttempts.keycap);

  return (
    <div className="case-page">
      <div className="case-eyebrow">00 // CSL LAB</div>
      <h1 className="case-title">손이 근질거릴 때 들어오는<br />사이버 피젯 랩</h1>

      <div className="v2-card v2-home-gauge">
        <div className="v2-progress-row">
          <span className="v2-progress-label">오늘 누적된 스트레스 게이지</span>
          <span className="v2-progress-pct">{gaugePct}%</span>
        </div>
        <div className="v2-progress-track">
          <div className="v2-progress-fill" style={{ width: `${gaugePct}%` }} />
        </div>
        <div className="v2-home-gauge-foot">
          <span>수확 가능 코인: <b>{coins}</b></span>
          <span>목표 {HOME_GAUGE_GOAL}</span>
        </div>
      </div>

      <div className="gacha-tabs lab-room-tabs">
        <button type="button" className={roomTab === 'normal' ? 'is-active' : ''} onClick={() => setRoomTab('normal')}>
          일반 룸
        </button>
        <button type="button" className={roomTab === 'hidden' ? 'is-active' : ''} onClick={() => setRoomTab('hidden')}>
          히든 룸
        </button>
      </div>

      <div className="v2-section-label">Active Playrooms</div>

      {roomTab === 'normal' ? (
        <div className="v2-playroom-list">
          <Link to="/wakpuball" className="v2-playroom-row">
            <div className="v2-playroom-thumb">
              {wakpu && <img src={wakpu.image} alt="" style={{ filter: wakpu.filter }} />}
            </div>
            <div className="v2-playroom-body">
              <div className="v2-playroom-title">왁뿌볼 룸</div>
              <div className="v2-playroom-desc">말랑한 오브제를 연타하여 파괴</div>
              {wakpu && <span className="v2-badge is-active">장착중: {wakpu.name}</span>}
            </div>
            <span className="v2-playroom-arrow">→</span>
          </Link>

          <Link to="/keycap" className="v2-playroom-row">
            <div className="v2-playroom-thumb">
              {keycap && <img src={keycap.image} alt="" style={{ filter: keycap.filter }} />}
            </div>
            <div className="v2-playroom-body">
              <div className="v2-playroom-title">키캡 룸</div>
              <div className="v2-playroom-desc">8키 미니 키보드 무한 타건</div>
              {keycap && <span className="v2-badge is-active">장착중: {keycap.name}</span>}
            </div>
            <span className="v2-playroom-arrow">→</span>
          </Link>
        </div>
      ) : (
        <div className="v2-playroom-list">
          <Link to="/hidden/wakpuball" className="v2-playroom-row">
            <div className="v2-playroom-thumb">
              <img src="images/hidden_wakpuball.png" alt="" className="is-holo-strong" />
            </div>
            <div className="v2-playroom-body">
              <div className="v2-playroom-title">히든 왁뿌볼 룸</div>
              <div className="v2-playroom-desc">코인 없이 0.6% 히든카드 도전</div>
              <span className="v2-badge is-limited">오늘 {wbLeft}번 남음</span>
            </div>
            <span className="v2-playroom-arrow">→</span>
          </Link>

          <Link to="/hidden/keycap" className="v2-playroom-row">
            <div className="v2-playroom-thumb">
              <img src="images/hidden_keycap.png" alt="" className="is-holo-strong" />
            </div>
            <div className="v2-playroom-body">
              <div className="v2-playroom-title">히든 키캡 룸</div>
              <div className="v2-playroom-desc">코인 없이 0.6% 히든카드 도전</div>
              <span className="v2-badge is-limited">오늘 {kcLeft}번 남음</span>
            </div>
            <span className="v2-playroom-arrow">→</span>
          </Link>
        </div>
      )}

      <div className="v2-draw-panel">
        <div className="v2-draw-panel-title">STRESS RELIEVING DRAW</div>
        <div className="v2-draw-panel-sub">축적된 스트레스 게이지로 새로운 오브제 획득</div>
        <Link to="/gacha" className="v2-btn v2-btn-primary">
          {readyAny ? `오브제 뽑기 실행 (${pullCost}코인)` : `코인 ${pullCost}개 필요`}
        </Link>
      </div>

      <div className="lab-footer-note">
        수집 현황 {owned.length} / {totalCount} · <Link to="/collection">도감 보기</Link> · <Link to="/store">프리미엄 스토어</Link>
      </div>
    </div>
  );
}
