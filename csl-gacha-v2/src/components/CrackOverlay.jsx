import { getCrackImage } from '../data/crackStages';

// 왁뿌볼이 깨지는 진행도를 보여주는 오버레이. 해당 단계의 실제 금가는
// 사진이 준비되면 그 사진을, 아직 없으면 기존처럼 SVG 선으로 대신
// 그린다 — 일반/히든 왁뿌볼 룸이 공유해서 쓴다.
export default function CrackOverlay({ progress }) {
  const image = getCrackImage(progress);

  if (image) {
    return <img src={image} alt="" className="wakpu-crack-img" />;
  }

  const lineCount = Math.round(progress * 10);
  return (
    <svg className="wakpu-cracks" viewBox="0 0 200 200">
      {Array.from({ length: lineCount }).map((_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        const x2 = 100 + Math.cos(angle) * 90;
        const y2 = 100 + Math.sin(angle) * 90;
        return (
          <line
            key={i}
            x1="100" y1="100" x2={x2} y2={y2}
            stroke="rgba(0,0,0,.4)" strokeWidth="2"
          />
        );
      })}
    </svg>
  );
}
