import { getCrackImage } from '../data/crackStages';

// 왁뿌볼이 깨지는 진행도를 보여주는 오버레이. 해당 단계의 실제 금가는
// 사진이 준비되면 그 사진을, 아직 없으면 기존처럼 SVG 선 + 안에서
// 비치는 흰 왁스로 대신 그린다 — 일반/히든 왁뿌볼 룸이 공유해서 쓴다.
//
// 다 깨질 때까지 기다렸다가 한 번에 왁스를 보여주는 게 아니라, 때릴
// 때마다 금이 넓어지면서 그 틈으로 왁스가 조금씩 비치도록 진행도에
// 비례해서 자연스럽게 늘어난다.
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
