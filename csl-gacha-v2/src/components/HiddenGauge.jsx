import { useEffect, useState, useCallback } from 'react';
import { useGame } from '../store/useGame';

const HIDDEN_AD_BONUS_LABEL = 20;

function formatRemaining(ms) {
  const totalMin = Math.max(0, Math.ceil(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return `${m}분`;
  return `${h}시간 ${m}분`;
}

// 히든 왁뿌볼/키캡 룸 상단에 띄우는 "오늘 남은 시도" 게이지 — 다 쓰면
// 광고 보고 20회 추가(최대 60회) 버튼과 다음 리셋까지 남은 시간을 보여준다.
export default function HiddenGauge({ category }) {
  const { hiddenAttempts, hiddenCap, hiddenCycleStart, hiddenDailyMax, hiddenCycleMs, isHiddenMaxed, claimHiddenAdBoost } = useGame();
  const [now, setNow] = useState(Date.now());
  const [watchingAd, setWatchingAd] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const attempts = hiddenAttempts[category];
  const cap = hiddenCap[category];
  const cycleStart = hiddenCycleStart[category];
  const remainingMs = cycleStart ? Math.max(0, cycleStart + hiddenCycleMs - now) : 0;
  const isMaxedOut = isHiddenMaxed(category);

  const handleWatchAd = useCallback(() => {
    if (watchingAd || cap >= hiddenDailyMax) return;
    setWatchingAd(true);
    // 실제 광고 SDK가 없어서 30초 광고 재생을 흉내만 낸 뒤 한도를 늘려준다.
    setTimeout(() => {
      claimHiddenAdBoost(category);
      setWatchingAd(false);
    }, 1800);
  }, [watchingAd, cap, hiddenDailyMax, claimHiddenAdBoost, category]);

  return (
    <div className="hidden-gauge">
      <div className="hidden-gauge-row">
        <span className="hidden-gauge-count">오늘 {Math.min(attempts, cap)} / {cap}번 시도</span>
        {cap < hiddenDailyMax && <span className="hidden-gauge-hint">광고로 최대 {hiddenDailyMax}번까지</span>}
      </div>
      <div className="hidden-gauge-track">
        <div className="hidden-gauge-fill" style={{ width: `${Math.min(100, (attempts / cap) * 100)}%` }} />
      </div>
      {isMaxedOut && (
        <div className="hidden-gauge-empty">
          <p className="hidden-gauge-empty-text">
            오늘 시도를 다 썼어 — {formatRemaining(remainingMs)} 후 초기화돼.
          </p>
          {cap < hiddenDailyMax && (
            <button type="button" className="hidden-gauge-ad-btn" onClick={handleWatchAd} disabled={watchingAd}>
              {watchingAd ? '광고 재생 중...' : `광고 보고 ${HIDDEN_AD_BONUS_LABEL}회 더 받기`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
