import { useGame, calcRankPercentile } from '../store/useGame';

export default function Ranking() {
  const { dailyBreaks, totalBreaks } = useGame();
  const percentile = calcRankPercentile(dailyBreaks);

  const handleSaveCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(540, 700, 100, 540, 960, 1400);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.6, '#f7f7f5');
    grad.addColorStop(1, '#ece9e2');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#5a8a17';
    ctx.font = '700 34px "Courier New", monospace';
    ctx.fillText('CSL // WAKPUBALL RANKING', 540, 260);

    ctx.fillStyle = '#16181a';
    ctx.font = '700 60px "Space Grotesk", sans-serif';
    ctx.fillText('오늘의 기록', 540, 420);

    ctx.fillStyle = '#ec1f7f';
    ctx.font = '700 260px "Space Grotesk", sans-serif';
    ctx.fillText(`상위 ${percentile}%`, 540, 780);

    ctx.fillStyle = '#16181a';
    ctx.font = '500 46px "Space Grotesk", sans-serif';
    ctx.fillText(`오늘 왁뿌볼 ${dailyBreaks}번 깸`, 540, 900);
    ctx.fillStyle = '#6d716e';
    ctx.font = '400 34px "Space Grotesk", sans-serif';
    ctx.fillText(`누적 ${totalBreaks}번`, 540, 955);

    ctx.strokeStyle = 'rgba(22,24,26,.25)';
    ctx.lineWidth = 2;
    ctx.strokeRect(340, 1560, 400, 100);
    ctx.fillStyle = '#16181a';
    ctx.font = '700 32px "Courier New", monospace';
    ctx.fillText('DON\'T HOLD IT IN', 540, 1618);

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'csl-wakpuball-ranking.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    }, 'image/png');
  };

  return (
    <div className="case-page">
      <div className="case-eyebrow">08 // 랭킹</div>
      <h1 className="case-title">오늘의 기록</h1>
      <p className="case-sub">오늘 왁뿌볼을 깬 횟수를 다른 유저들과 비교한 순위야.</p>

      <div className="rank-card">
        <div className="rank-card-label">오늘 왁뿌볼 깬 횟수 기준</div>
        <div className="rank-card-percentile">상위 {percentile}%</div>
        <div className="rank-card-stats">
          <div className="rank-stat">
            <div className="rank-stat-value">{dailyBreaks}</div>
            <div className="rank-stat-label">오늘 깬 횟수</div>
          </div>
          <div className="rank-stat">
            <div className="rank-stat-value">{totalBreaks}</div>
            <div className="rank-stat-label">누적 깬 횟수</div>
          </div>
        </div>
      </div>

      <button type="button" className="rank-share-btn" onClick={handleSaveCard}>
        결과 카드 저장하기 →
      </button>
    </div>
  );
}
