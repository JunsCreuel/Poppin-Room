// 히든 키캡 룸 페이지 — 시크릿 키 1개로 입장, 클릭 1번에 카드 1장
import SecretDraw from '../components/SecretDraw';

export default function HiddenKeycap() {
  return (
    <div className="case-page">
      <div className="case-eyebrow">SECRET ROOM · 키캡</div>
      <h1 className="case-title">히든 키캡</h1>
      <p className="case-sub">키캡을 한 번 누르면 흔들린 뒤 카드 1장, 코인·시크릿 키·히든카드 중 하나 또는 꽝</p>
      <SecretDraw category="keycap" image="images/hidden_keycap.png" alt="히든 키캡" />
    </div>
  );
}
