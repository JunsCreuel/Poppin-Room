// 상점 & 랭킹 페이지 — 프리미엄 오브제 구매(mock) + 오늘 깬 횟수 기준 랭킹
import { useState } from 'react';
import { useGame, calcRankPercentile } from '../store/useGame';

const CATEGORY_LABEL = { wakpuball: '왁뿌볼', keycap: '키캡' };

export default function Shop() {
  return (
    <div className="case-page">
      <div className="case-eyebrow">SHOP & RANKING</div>
      <h1 className="case-title">상점 & 랭킹</h1>
      <p className="case-sub">프리미엄 오브제 구매, 오늘 왁뿌볼 깬 횟수 기준 순위 확인</p>

      <KeyShopSection />
      <StoreSection />
      <RankingSection />
    </div>
  );
}

// 코인 상점 — 시크릿 키 구매
function KeyShopSection() {
  const { coins, secretKeys, secretKeyPrice, buySecretKey, claimAdKey, dailyAdKeys, adKeyDailyMax } = useGame();
  const [justBought, setJustBought] = useState(false);
  const [adPlaying, setAdPlaying] = useState(false);
  const canBuy = coins >= secretKeyPrice;
  const adLeft = Math.max(0, adKeyDailyMax - dailyAdKeys);

  const handleBuy = () => {
    if (!buySecretKey()) return;
    setJustBought(true);
    setTimeout(() => setJustBought(false), 2000);
  };

  // 광고 mock — 광고 SDK 연동 전까지 1.8초 재생 흉내 후 키 지급
  const handleAd = () => {
    if (adPlaying || adLeft <= 0) return;
    setAdPlaying(true);
    setTimeout(() => {
      claimAdKey();
      setAdPlaying(false);
    }, 1800);
  };

  return (
    <section className="account-section">
      <h3 className="collection-section-title">코인 상점</h3>
      <p className="account-empty">보유 코인 {coins} · 시크릿 키 {secretKeys}개, 키 1개 = 시크릿 룸 1회 입장</p>

      <div className="store-grid">
        <div className="store-card">
          <div className="store-card-swatch store-card-emoji">🔑</div>
          <div className="store-card-cat">SECRET · KEY</div>
          <div className="store-card-name">시크릿 키</div>
          <div className="store-card-note">코인으로 구매 · 타격 시 0.06% 드롭</div>
          <div className="store-card-foot">
            <span className="store-card-price">🪙 {secretKeyPrice}</span>
            <button type="button" className="store-buy-btn" onClick={handleBuy} disabled={!canBuy}>
              {justBought ? '구매 완료' : canBuy ? '구매하기' : '코인 부족'}
            </button>
          </div>
        </div>

        <div className="store-card">
          <div className="store-card-swatch store-card-emoji">📺</div>
          <div className="store-card-cat">SECRET · AD</div>
          <div className="store-card-name">광고 보고 키 받기</div>
          <div className="store-card-note">오늘 {dailyAdKeys} / {adKeyDailyMax}개 수령</div>
          <div className="store-card-foot">
            <span className="store-card-price">무료</span>
            <button type="button" className="store-buy-btn" onClick={handleAd} disabled={adPlaying || adLeft <= 0}>
              {adPlaying ? '광고 재생 중...' : adLeft > 0 ? '광고 보기 +1' : '오늘 소진'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function StoreSection() {
  const { toys, owned, purchasePremium, equip } = useGame();
  const [purchasing, setPurchasing] = useState(null); // toy.id 진행 중
  const [justBought, setJustBought] = useState(null);

  const handleBuy = (toy) => {
    if (owned.includes(toy.id) || purchasing) return;
    setPurchasing(toy.id);
    // 결제 mock — 실제 결제 연동 전까지 0.9초 뒤 즉시 지급
    setTimeout(() => {
      purchasePremium(toy.category, toy.id);
      setPurchasing(null);
      setJustBought(toy.id);
      setTimeout(() => setJustBought(null), 2000);
    }, 900);
  };

  const renderCard = (toy) => {
    const isOwned = owned.includes(toy.id);
    const isBuying = purchasing === toy.id;
    return (
      <div key={toy.id} className={`store-card ${toy.isHolo ? 'is-holo-card' : ''}`}>
        <div className="store-card-swatch">
          <img src={toy.image} alt={toy.name} style={{ filter: toy.filter }} className={toy.isHolo ? 'is-holo' : ''} />
        </div>
        <div className="store-card-cat">{CATEGORY_LABEL[toy.category]} · PREMIUM</div>
        <div className="store-card-name">{toy.name}</div>
        {toy.category === 'keycap' && <div className="store-card-note">실제 녹음 사운드 적용</div>}
        <div className="store-card-foot">
          <span className="store-card-price">₩{toy.price.toLocaleString()}</span>
          {isOwned ? (
            <button type="button" className="store-buy-btn is-owned" onClick={() => equip(toy.category, toy.id)}>
              {justBought === toy.id ? '구매 완료 · 장착' : '보유 중 · 장착'}
            </button>
          ) : (
            <button type="button" className="store-buy-btn" onClick={() => handleBuy(toy)} disabled={isBuying}>
              {isBuying ? '결제 중...' : '구매하기'}
            </button>
          )}
        </div>
      </div>
    );
  };

  const wakpuballToys = toys.wakpuball.filter((t) => t.tier === 'premium').map((t) => ({ ...t, category: 'wakpuball' }));
  const keycapToys = toys.keycap.filter((t) => t.tier === 'premium').map((t) => ({ ...t, category: 'keycap' }));

  return (
    <section className="account-section">
      <h3 className="collection-section-title">프리미엄 상점 (₩)</h3>
      <p className="account-empty">결제 즉시 지급, 프리미엄 키캡은 실제 녹음 사운드 적용</p>

      <div className="store-subtitle">왁뿌볼</div>
      <div className="store-grid">{wakpuballToys.map(renderCard)}</div>

      <div className="store-subtitle">키캡</div>
      <div className="store-grid">{keycapToys.map(renderCard)}</div>
    </section>
  );
}

function RankingSection() {
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
    ctx.fillText('POPPIN ROOM // RANKING', 540, 260);

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
      a.download = 'poppin-room-ranking.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    }, 'image/png');
  };

  return (
    <section className="account-section">
      <h3 className="collection-section-title">오늘의 랭킹</h3>
      <p className="account-empty">오늘 왁뿌볼 깬 횟수 기준, 다른 유저와 비교한 순위</p>

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
    </section>
  );
}
