import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../store/useGame';
import { playKeyClick } from '../utils/sound';
import { useRewardEffects } from '../utils/useRewardEffects';
import RewardEffects from '../components/RewardEffects';
import DesignPicker from '../components/DesignPicker';
import { resizeImageFile } from '../utils/resizeImage';

const PRESS_HOLD_MS = 90; // 실제 키보드처럼 눌렸다가 짧게 있다 자동으로 올라옴

export default function Keycap() {
  const { equipped, getToy, pressReward, coins, customSticker, setCustomSticker, clearCustomSticker } = useGame();
  const toy = getToy('keycap', equipped.keycap);
  // 클릭 한 번 = 눌렸다가 자동으로 올라오는 것까지 한 번의 이벤트(실제
  // 키보드 키와 동일). 다시 눌러야 올라오는 토글이 아니라, 누르면 바로
  // 눌린 상태가 됐다가 일정 시간 뒤 스스로 원상태로 복귀한다. 코인/히든카드
  // 굴림은 클릭할 때마다 한 번.
  const [pressed, setPressed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast, hiddenCard, trigger, closeHidden } = useRewardEffects();

  const fileInputRef = useRef(null);
  const releaseTimeoutRef = useRef(null);

  const sticker = customSticker?.keycap || null;

  const pressOnce = useCallback(() => {
    if (!toy) return;
    playKeyClick(toy.sound);
    trigger(pressReward('keycap'));
    setPressed(true);
    clearTimeout(releaseTimeoutRef.current);
    releaseTimeoutRef.current = setTimeout(() => setPressed(false), PRESS_HOLD_MS);
  }, [toy, pressReward, trigger]);

  useEffect(() => () => clearTimeout(releaseTimeoutRef.current), []);

  const handleClick = () => pressOnce();

  useEffect(() => {
    // 실제 키보드의 ESC를 눌러도 같은 반응 — CLICK LAB과 동일하게 지원.
    // OS 키 반복(계속 누르고 있을 때 연속 발생하는 keydown)은 무시해서
    // 꾹 누르고 있어도 한 번만 눌림-복귀가 발생하게 한다.
    const handleKeyDown = (e) => {
      if (e.code !== 'Escape' || e.repeat) return;
      e.preventDefault();
      pressOnce();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
      <p className="case-sub">클릭할 때마다 눌렸다가 바로 올라와. 실제 키보드 ESC를 눌러도 돼. 누를 때마다 코인을 얻을 수도 있어.</p>

      <DesignPicker category="keycap" />

      <div className="keycap-stage">
        <button
          type="button"
          className={`keycap-single ${pressed ? 'is-pressed' : ''}`}
          onClick={handleClick}
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
            <div className="keycap-sticker-overlay" aria-hidden="true">
              <img src={sticker} alt="" className="keycap-sticker-overlay-img" draggable="false" />
            </div>
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

      <Link to="/hidden/keycap" className="hidden-room-cta">
        히든카드가 궁금해? 히든 키캡 룸으로 →
      </Link>

      <RewardEffects toast={toast} hiddenCard={hiddenCard} onCloseHidden={closeHidden} />
    </div>
  );
}
