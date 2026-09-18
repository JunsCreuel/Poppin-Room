// 커서 위치를 CSS 변수(--mx, --my, -1~1)로 흘려보내는 훅 — 배경 스티커·랜딩 히어로 파랄락스용
// 마우스 같은 정밀 포인터에서만 동작, 모션 감소 설정 시 비활성, React 리렌더 없음
import { useEffect } from 'react';

export function usePointerParallax() {
  useEffect(() => {
    const root = document.documentElement;
    const finePointer = window.matchMedia?.('(pointer: fine)').matches;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reduceMotion) return undefined;

    let frame = null;
    let next = { x: 0, y: 0 };

    const apply = () => {
      frame = null;
      root.style.setProperty('--mx', next.x.toFixed(3));
      root.style.setProperty('--my', next.y.toFixed(3));
    };

    const onMove = (e) => {
      next = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      };
      if (frame === null) frame = requestAnimationFrame(apply);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (frame !== null) cancelAnimationFrame(frame);
      root.style.setProperty('--mx', '0');
      root.style.setProperty('--my', '0');
    };
  }, []);
}
