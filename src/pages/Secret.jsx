// 시크릿 룸 입구 페이지 — 히든 왁뿌볼/키캡 룸으로 이동 (진입 조건 미정)
import { Link } from 'react-router-dom';
import { useGame } from '../store/useGame';

// TODO: 진입 조건 확정 후 조건 미달 시 잠금 처리
export default function Secret() {
  const { hiddenAttempts, hiddenCap, hiddenCards } = useGame();
  const wbLeft = Math.max(0, hiddenCap.wakpuball - hiddenAttempts.wakpuball);
  const kcLeft = Math.max(0, hiddenCap.keycap - hiddenAttempts.keycap);

  return (
    <div className="case-page">
      <div className="case-eyebrow">SECRET ROOM</div>
      <h1 className="case-title">시크릿 룸</h1>
      <p className="case-sub">코인 없이 0.6% 히든카드만 도전, 하루 40번(광고로 최대 60번)</p>

      <div className="v2-keydeck-banner">🚪 진입 조건 미정 — 팀 논의 후 확정 예정, 지금은 바로 입장 가능</div>

      <div className="v2-section-label">Secret Rooms</div>
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

      <div className="lab-footer-note">
        획득한 히든카드 {hiddenCards.length}장 · <Link to="/account">내 계정에서 확인</Link>
      </div>
    </div>
  );
}
