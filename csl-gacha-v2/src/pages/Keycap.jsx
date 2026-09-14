import { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../store/useGame';
import { playKeyClick } from '../utils/sound';
import { useRewardEffects } from '../utils/useRewardEffects';
import RewardEffects from '../components/RewardEffects';
import DesignPicker from '../components/DesignPicker';
import { resizeImageFile } from '../utils/resizeImage';

const HOLD_INTERVAL_MS = 90; // 꾹 누르고 있을 때 연속 타건 간격 — CLICK LAB과 동일

export default function Keycap() {
  const { equipped, getToy, pressReward, coins, customSticker, setCustomSticker, clearCustomSticker } = useGame();
  const toy = getToy('keycap', equipped.keycap);
  const [pressed, setPressed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast, hiddenCard, trigger, closeHidden } = useRewardEffects();

  const holdIntervalRef = useRef(null);
  const pressTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const sticker = customSticker?.keycap || null;

  const pressOnce = useCallback(() => {
    if (!toy) return;
    playKeyClick(toy.tier === 'premium');
    trigger(pressReward('keycap'));
    setPressed(false);
    clearTimeout(pressTimeoutRef.current);
    requestAnimationFrame(() => setPressed(true));
    pressTimeoutRef.current = setTimeout(() => setPressed(false), 90);
  }, [toy, pressReward, trigger]);

  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    pressOnce();
    clearInterval(holdIntervalRef.current);
    holdIntervalRef.current = setInterval(pressOnce, HOLD_INTERVAL_MS);
  };

  useEffect(() => {
    const stopHolding = () => {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    };
    // 실제 키보드의 ESC를 눌러도 같은 반응 — CLICK LAB과 동일하게 지원
    const handleKeyDown = (e) => {
      if (e.code !== 'Escape') return;
      e.preventDefault();
      pressOnce();
    };
    window.addEventListener('pointerup', stopHolding);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerup', stopHolding);
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(holdIntervalRef.current);
      clearTimeout(pressTimeoutRef.current);
    };
  }, [pressOnce]);

  const handleStickerSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await resizeImageFile(file, 240);
      setCustomSticker('keycap', dataUrl);
    } finally {
      setUploading(false);
    }
  };

  if (!toy) return null;

  return (
    <div className="case-page">
      <div className="case-eyebrow">03 // 키캡 룸</div>
      <h1 className="case-title">{toy.name}</h1>
      <p className="case-sub">클릭하거나 꾹 누르고 있어. 실제 키보드 ESC를 눌러도 돼. 누를 때마다 코인을 얻을 수도 있어.</p>

      <DesignPicker category="keycap" />

      <div className="keycap-stage">
        <button
          type="button"
          className={`keycap-single ${pressed ? 'is-pressed' : ''}`}
          onPointerDown={handlePointerDown}
          aria-label={toy.name}
        >
          <img
            src={toy.image}
            alt={toy.name}
            className={`keycap-single-img ${toy.isHolo ? 'is-holo' : ''}`}
            style={{ filter: toy.filter }}
            draggable="false"
          />
          {sticker && (
            <img src={sticker} alt="내 스티커" className="keycap-sticker-overlay" draggable="false" />
          )}
        </button>
      </div>

      <div className="sticker-box">
        <div className="sticker-box-label">키캡 스티커 — 자판에 붙이듯 내 이미지를 올려봐</div>
        <div className="sticker-box-row">
          <button type="button" className="sticker-upload-btn" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? '업로드 중...' : sticker ? '이미지 바꾸기' : '내 이미지 추가'}
          </button>
          {sticker && (
            <button type="button" className="sticker-remove-btn" onClick={() => clearCustomSticker('keycap')}>
              제거
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleStickerSelect}
          className="sticker-file-input"
        />
      </div>

      <div className="coin-inline">🪙 {coins} 코인</div>

      <RewardEffects toast={toast} hiddenCard={hiddenCard} onCloseHidden={closeHidden} />
    </div>
  );
}
