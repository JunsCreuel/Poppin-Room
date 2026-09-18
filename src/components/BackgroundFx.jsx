// 배경 스티커 컴포넌트 — 오브제 스티커가 흩어져 살짝 흔들리고, 커서 방향으로 깊이감 있게 밀림
// --x/--y 위치, --d 깊이(클수록 커서에 더 크게 반응), --r 기울기, --dur 흔들림 주기
import { useLocation } from 'react-router-dom';

const STICKERS = [
  { emoji: '🍒', x: '6%', y: '14%', d: 1.4, r: '-10deg', dur: '6s', size: 56 },
  { emoji: '⭐', x: '88%', y: '10%', d: 0.8, r: '12deg', dur: '7s', size: 48 },
  { emoji: '🧸', x: '92%', y: '58%', d: 1.6, r: '-6deg', dur: '8s', size: 60 },
  { emoji: '🪩', x: '4%', y: '62%', d: 0.7, r: '8deg', dur: '9s', size: 50 },
  { emoji: '🫧', x: '14%', y: '88%', d: 1.2, r: '-14deg', dur: '6.5s', size: 44 },
  { emoji: '🍮', x: '86%', y: '82%', d: 1.0, r: '10deg', dur: '7.5s', size: 52 },
  { emoji: '🐰', x: '15%', y: '36%', d: 0.6, r: '6deg', dur: '8.5s', size: 46 },
  { emoji: '🌈', x: '60%', y: '93%', d: 1.8, r: '-8deg', dur: '7s', size: 48 },
  { emoji: '💎', x: '84%', y: '34%', d: 0.9, r: '14deg', dur: '9.5s', size: 44 },
  { emoji: '🎁', x: '7%', y: '40%', d: 1.3, r: '-4deg', dur: '6s', size: 46 },
];

// 랜딩은 글자가 화면 폭 전체를 쓰므로 가장자리(좌우 8% 밖, 아래 88% 아래) 스티커만 표시
const onLandingEdge = (s) => parseFloat(s.x) <= 8 || parseFloat(s.x) >= 90 || parseFloat(s.y) >= 88;

export default function BackgroundFx() {
  const { pathname } = useLocation();
  const stickers = pathname === '/' ? STICKERS.filter(onLandingEdge) : STICKERS;
  return (
    <div className="bg-fx" aria-hidden="true">
      {stickers.map((s) => (
        <span
          key={s.emoji}
          className="bg-sticker"
          style={{ '--x': s.x, '--y': s.y, '--d': s.d, '--r': s.r, '--dur': s.dur, '--size': `${s.size}px` }}
        >
          {s.emoji}
        </span>
      ))}
    </div>
  );
}
