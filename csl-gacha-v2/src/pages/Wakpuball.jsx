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
      <p className="case-sub">연타해서 깨뜨려. 다 깨진 뒤에도 계속 눌러서 내용물을 조몰락거릴 수 있어. 칠 때마다 코인을 얻을 수도 있어.</p>

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
        오늘 {dailyBreaks}번 깼어 · 랭킹 보기 →
      </Link>
      <Link to="/hidden/wakpuball" className="hidden-room-cta">
        히든카드가 궁금해? 히든 왁뿌볼 룸으로 →
      </Link>

      <RewardEffects toast={toast} hiddenCard={hiddenCard} onCloseHidden={closeHidden} />
    </div>
  );
}
