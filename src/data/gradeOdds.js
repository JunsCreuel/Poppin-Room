// 뽑기 가중치 — grade별 상대 가중치, limited는 rare보다 훨씬 낮은 확률로 나옴
export const GRADE_WEIGHT = { rare: 20, limited: 1 };

function weightOf(toy) {
  return GRADE_WEIGHT[toy.grade] ?? 1;
}

export function weightedPick(pool) {
  const total = pool.reduce((sum, toy) => sum + weightOf(toy), 0);
  let r = Math.random() * total;
  for (const toy of pool) {
    r -= weightOf(toy);
    if (r <= 0) return toy;
  }
  return pool[pool.length - 1];
}

export function computeGradeOdds(pool) {
  const rare = pool.filter((t) => t.grade === 'rare');
  const limited = pool.filter((t) => t.grade === 'limited');
  const total = pool.reduce((sum, toy) => sum + weightOf(toy), 0);
  const rareWeight = rare.reduce((sum, toy) => sum + weightOf(toy), 0);
  const limitedWeight = limited.reduce((sum, toy) => sum + weightOf(toy), 0);
  return {
    rareCount: rare.length,
    limitedCount: limited.length,
    rarePct: total ? (rareWeight / total) * 100 : 0,
    limitedPct: total ? (limitedWeight / total) * 100 : 0,
  };
}
