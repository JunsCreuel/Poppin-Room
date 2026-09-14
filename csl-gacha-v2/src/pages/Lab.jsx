import { Link } from 'react-router-dom';
import { useGame } from '../store/useGame';

export default function Lab() {
  const { gauge, gaugeToPull, canPull, getToy, equipped, owned } = useGame();
  const wakpu = getToy('wakpuball', equipped.wakpuball);
  const keycap = getToy('keycap', equipped.keycap);

  const readyAny = canPull('wakpuball') || canPull('keycap');
  const totalCount = 16;

  return (
    <div className="case-page">
      <div className="case-eyebrow">00 // CSL LAB</div>
      <h1 className="case-title">손이 근질거릴 때 들어오는<br />사이버 피젯 랩</h1>
      <p className="case-sub">놀수록 게이지가 쌓이고, 게이지가 차면 새 토이를 뽑을 수 있어. 뽑은 토이는 도감에 쌓인다.</p>

      <div className="lab-rooms">
        <Link to="/wakpuball" className="lab-room-card">
          <div className="lab-room-swatch">
            {wakpu && <img src={wakpu.image} alt="" style={{ filter: wakpu.filter }} />}
          </div>
          <div className="lab-room-body">
            <div className="lab-room-label">왁뿌볼 룸</div>
            <div className="lab-room-desc">갑자기 치미는 화 — 연타로 깨뜨린다</div>
            <div className="lab-room-gauge">{Math.min(gauge.wakpuball, gaugeToPull)} / {gaugeToPull}</div>
          </div>
        </Link>

        <Link to="/keycap" className="lab-room-card">
          <div className="lab-room-swatch">
            {keycap && <img src={keycap.image} alt="" style={{ filter: keycap.filter }} />}
          </div>
          <div className="lab-room-body">
            <div className="lab-room-label">키캡 룸</div>
            <div className="lab-room-desc">가라앉지 않는 초조함 — 꾹꾹 눌러 소리 낸다</div>
            <div className="lab-room-gauge">{Math.min(gauge.keycap, gaugeToPull)} / {gaugeToPull}</div>
          </div>
        </Link>
      </div>

      <Link to="/gacha" className={`gacha-cta ${readyAny ? 'is-ready' : ''}`}>
        {readyAny ? '캡슐 뽑으러 가기 →' : '뽑기 (게이지를 더 채워야 함) →'}
      </Link>

      <div className="lab-footer-note">
        수집 현황 {owned.length} / {totalCount} · <Link to="/collection">도감 보기 →</Link>
      </div>
    </div>
  );
}
