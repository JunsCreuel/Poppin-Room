// 팝볼 금가는 단계 데이터 — 진행도별 이미지 자리(비어 있으면 SVG로 대체)
// image에 'images/파일명.png' 경로를 채우면 그 단계부터 사진으로 표시
// threshold = 진행도(0~1) 기준
export const CRACK_STAGES = [
  { threshold: 0.25, label: '살짝 금감', image: null },
  { threshold: 0.5, label: '금 많이 감', image: null },
  { threshold: 0.75, label: '깨지기 직전', image: null },
];

// progress(0~1)에 맞는 금가는 이미지를 찾는다. 해당 단계에 아직 이미지가
// 없으면(image: null) null을 돌려주고, 호출한 쪽(CrackOverlay)이 기존
// SVG 선 방식으로 대신 그린다 — 이미지가 하나씩 채워져도 다른 단계는
// 계속 SVG로 자연스럽게 대체된다.
export function getCrackImage(progress) {
  let match = null;
  for (const stage of CRACK_STAGES) {
    if (progress >= stage.threshold) match = stage;
  }
  return match?.image ?? null;
}
