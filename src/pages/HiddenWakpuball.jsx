// 히든 왁뿌볼 룸 페이지 — 시크릿 키 1개로 입장, 클릭 1번에 카드 1장
import SecretDraw from '../components/SecretDraw';

export default function HiddenWakpuball() {
  return (
    <div className="case-page">
      <div className="case-eyebrow">SECRET ROOM · 왁뿌볼</div>
      <h1 className="case-title">히든 왁뿌볼</h1>
      <p className="case-sub">카드 1장 — 코인·시크릿 키·히든카드 중 하나</p>
      <SecretDraw category="wakpuball" image="images/hidden_wakpuball.png" alt="히든 왁뿌볼" />
    </div>
  );
}
