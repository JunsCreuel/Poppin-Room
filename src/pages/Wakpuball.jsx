// 팝볼 룸 페이지 — 팝볼 연타로 파괴, 칠 때마다 코인 보상, 디자인 변경
import { Link } from 'react-router-dom';
import { useGame } from '../store/useGame';
import { useRewardEffects } from '../utils/useRewardEffects';
import RewardEffects from '../components/RewardEffects';
import DesignPicker from '../components/DesignPicker';
import WakpuStage from '../components/WakpuStage';

const STRESS_LABEL = { common: 'LOW', rare: 'MEDIUM', premium: 'HIGH', limited: 'HIGH' };

export default function Wakpuball() {
  const { equipped, getToy, pressReward, coins, recordBreak, dailyBreaks } = useGame();
  const toy = getToy('wakpuball', equipped.wakpuball);
  const { toast, hiddenCard, trigger, closeHidden } = useRewardEffects();

  if (!toy) return null;

  const no = toy.id.replace(/\D/g, '').padStart(2, '0');

  return (
    <div className="case-page">
      <div className="case-eyebrow">PLAY MODE · 팝볼 누르기</div>
      <h1 className="case-title">{toy.name}</h1>

      <div className="v2-live-pill">
        <span className="dot" />
        {coins} 코인 적립중
      </div>

      <div className="v2-card">
        <div className="v2-object-head">
          <span>NO. {no} {toy.name.toUpperCase()}</span>
          <span>STRESS: {STRESS_LABEL[toy.grade] || 'LOW'}</span>
        </div>

        <WakpuStage
          key={toy.id}
          image={toy.image}
          filter={toy.filter}
          isHolo={toy.isHolo}
          accent={toy.accent}
          hitsToBreak={toy.hitsToBreak}
          crackFrames={toy.crackFrames}
          hitSound={toy.hitSound}
          onPress={() => trigger(pressReward('wakpuball'))}
          onBreak={recordBreak}
        />
      </div>

      <div className="v2-btn-row">
        <DesignPicker category="wakpuball" />
        <Link to="/shop" className="v2-btn v2-btn-primary">상점으로 이동하기</Link>
      </div>

      <div className="lab-footer-note">오늘 {dailyBreaks}번 파괴 · <Link to="/shop">랭킹 보기</Link></div>

      <RewardEffects toast={toast} hiddenCard={hiddenCard} onCloseHidden={closeHidden} />
    </div>
  );
}
