// 리워드 광고 모달 — 배너 폴더에서 랜덤 노출, 5초짜리 원형 게이지가 다 차야 닫기 가능
// 게이지가 다 차기 전에 새로고침하거나 다른 페이지로 이동하면 컴포넌트가 그대로 사라져서
// onFinish(보상 지급)가 호출되지 않음 — 별도 저장 없이도 "끝까지 본 경우"만 집계됨
import { useEffect, useState } from 'react';

const AD_DURATION_MS = 5000;
const TICK_MS = 50;
const AD_IMAGES = [
  'images/ads/ad-1.jpg',
  'images/ads/ad-2.jpg',
  'images/ads/ad-3.jpg',
]; // 이 폴더에 이미지를 추가/교체하면 그중 하나가 매번 랜덤으로 노출됨
// 원본 크기가 서로 달라도 .ad-modal-img가 고정 박스(object-fit: contain)로 맞춰서 항상 같은 크기로 보임

const RADIUS = 16;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function AdBannerModal({ onFinish }) {
  const [bannerSrc] = useState(() => AD_IMAGES[Math.floor(Math.random() * AD_IMAGES.length)]);
  const [startedAt] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.min(AD_DURATION_MS, Date.now() - startedAt));
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [startedAt]);

  const progress = elapsed / AD_DURATION_MS; // 0~1
  const canClose = progress >= 1;
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const secondsLeft = Math.ceil((AD_DURATION_MS - elapsed) / 1000);

  const handleClose = () => {
    if (!canClose) return;
    onFinish();
  };

  return (
    <div className="ad-modal-backdrop">
      <div className="ad-modal">
        <div className="ad-modal-head">
          <span className="ad-modal-badge">AD</span>
          <button
            type="button"
            className={`ad-modal-close ${canClose ? 'is-ready' : ''}`}
            disabled={!canClose}
            onClick={handleClose}
            aria-label={canClose ? '광고 닫고 보상 받기' : `${secondsLeft}초 후 닫기 가능`}
          >
            <svg className="ad-modal-gauge" viewBox="0 0 40 40">
              <circle className="ad-modal-gauge-track" cx="20" cy="20" r={RADIUS} />
              <circle
                className="ad-modal-gauge-fill"
                cx="20"
                cy="20"
                r={RADIUS}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <span className="ad-modal-close-icon">{canClose ? '✕' : secondsLeft}</span>
          </button>
        </div>
        <div className="ad-modal-img-wrap">
          <img src={bannerSrc} alt="광고 배너" className="ad-modal-img" />
        </div>
      </div>
    </div>
  );
}
