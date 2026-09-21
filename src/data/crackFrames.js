// 팝볼 크랙 프레임 경로 — toys.json의 crackFrames { dir, count } → [dir/01.webp … dir/NN.webp]
export function crackFrameList(crackFrames) {
  if (!crackFrames?.dir || !crackFrames.count) return null;
  return Array.from({ length: crackFrames.count }, (_, i) => `${crackFrames.dir}/${String(i + 1).padStart(2, '0')}.webp`);
}
