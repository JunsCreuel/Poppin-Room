// 히든 왁뿌볼 룸 페이지 — 코인 없이 0.6% 확률 히든카드만, 하루 시도 제한
import { useGame } from '../store/useGame';
import { useRewardEffects } from '../utils/useRewardEffects';
import RewardEffects from '../components/RewardEffects';
import HiddenGauge from '../components/HiddenGauge';
import WakpuStage from '../components/WakpuStage';

// 히든 룸 전용 고정 아트 (장착 디자인과 무관)
const HIDDEN_WB_IMAGE = 'images/hidden_wakpuball.png';
const HIDDEN_WB_ACCENT = '#e0357f';
const HIDDEN_WB_HITS = 14;

// 히든 왁뿌볼 룸 — 일반 왁뿌볼 룸과 달리 코인은 전혀 안 나오고, 오직
// 히든카드(0.6%)만 노리는 곳. 대신 하루에 부실 수 있는 횟수가 정해져 있다.
export default function HiddenWakpuball() {
  const { pressHidden, isHiddenMaxed, recordBreak } = useGame();
  const { toast, hiddenCard, trigger, closeHidden } = useRewardEffects();

  const maxedOut = isHiddenMaxed('wakpuball');

  return (
    <div className="case-page">
      <div className="case-eyebrow">SECRET ROOM · 팝볼</div>
      <h1 className="case-title">히든 왁뿌볼</h1>
      <p className="case-sub">코인 없음 — 칠 때마다 0.6% 확률로 히든카드 도전</p>

      <HiddenGauge category="wakpuball" />

      <div className="v2-card">
        <WakpuStage
          image={HIDDEN_WB_IMAGE}
          isHolo
          holoClassName="is-holo-strong"
          accent={HIDDEN_WB_ACCENT}
          hitsToBreak={HIDDEN_WB_HITS}
          disabled={maxedOut}
          onPress={() => trigger(pressHidden('wakpuball'))}
          onBreak={recordBreak}
          extraClassName="is-hidden-toy"
        />
      </div>

      <RewardEffects toast={toast} hiddenCard={hiddenCard} onCloseHidden={closeHidden} />
    </div>
  );
}
