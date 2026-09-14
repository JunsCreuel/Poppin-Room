import { Link } from 'react-router-dom';
import { useGame } from '../store/useGame';
import { useRewardEffects } from '../utils/useRewardEffects';
import RewardEffects from '../components/RewardEffects';
import DesignPicker from '../components/DesignPicker';
import WakpuStage from '../components/WakpuStage';

export default function Wakpuball() {
  const { equipped, getToy, pressReward, coins, recordBreak, dailyBreaks } = useGame();
  const toy = getToy('wakpuball', equipped.wakpuball);
  const { toast, hiddenCard, trigger, closeHidden } = useRewardEffects();

  if (!toy) return null;

  return (
    <div className="case-page">
      <div className="case-eyebrow">02 // 왁뿌볼 룸</div>
      <h1 className="case-title">{toy.name}</h1>
      <p className="case-sub">연타로 파괴, 칠 때마다 코인 획득 가능</p>

      <DesignPicker category="wakpuball" />

      <WakpuStage
        image={toy.image}
        filter={toy.filter}
        isHolo={toy.isHolo}
        accent={toy.accent}
        hitsToBreak={toy.hitsToBreak}
        onPress={() => trigger(pressReward('wakpuball'))}
        onBreak={recordBreak}
      />

      <div className="coin-inline">🪙 {coins} 코인</div>

      <Link to="/ranking" className="ranking-cta">
        오늘 {dailyBreaks}번 파괴 · 랭킹 보기 →
      </Link>
      <Link to="/hidden/wakpuball" className="hidden-room-cta">
        히든 왁뿌볼 룸 · 히든카드 도전 →
      </Link>

      <RewardEffects toast={toast} hiddenCard={hiddenCard} onCloseHidden={closeHidden} />
    </div>
  );
}
