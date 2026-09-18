// 금가는 오버레이 컴포넌트 — 팝볼 파괴 진행도를 SVG 선과 왁스 비침으로 표시
import { getCrackImage } from '../data/crackStages';

// 단계별 사진(crackStages.js)이 있으면 사진, 없으면 SVG 선 + 왁스 비침으로 표시
export default function CrackOverlay({ progress }) {
  const image = getCrackImage(progress);

  if (image) {
    return <img src={image} alt="" className="wakpu-crack-img" />;
  }

  const lineCount = Math.round(progress * 10);
  // 한 대라도 맞으면 아주 살짝, 다 깨지기 직전엔 전체 절반 가까이 은은하게
  // 비치도록 — 0.05~0.5 사이로 스케일.
  const glowOpacity = progress > 0 ? Math.min(0.5, 0.08 + progress * 0.5) : 0;

  return (
    <>
      {glowOpacity > 0 && (
        <span
          className="wakpu-wax-glow"
          style={{ opacity: glowOpacity, transform: `scale(${0.5 + progress * 0.6})` }}
        />
      )}
      <svg className="wakpu-cracks" viewBox="0 0 200 200">
        {Array.from({ length: lineCount }).map((_, i) => {
          const angle = (i / 10) * Math.PI * 2;
          const x2 = 100 + Math.cos(angle) * 90;
          const y2 = 100 + Math.sin(angle) * 90;
          // 금이 간 지 오래된(먼저 생긴) 틈일수록 그 사이로 삐져나온
          // 왁스 방울이 더 커진다.
          const dropletRadius = Math.min(6, 2 + progress * 8);
          return (
            <g key={i}>
              <line x1="100" y1="100" x2={x2} y2={y2} stroke="rgba(0,0,0,.4)" strokeWidth="2" />
              <circle cx={x2} cy={y2} r={dropletRadius} className="wakpu-wax-drop" />
            </g>
          );
        })}
      </svg>
    </>
  );
}
