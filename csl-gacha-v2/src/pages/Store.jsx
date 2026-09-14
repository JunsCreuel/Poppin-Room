import { useState } from 'react';
import { useGame } from '../store/useGame';

const CATEGORY_LABEL = { wakpuball: '왁뿌볼', keycap: '키캡' };

export default function Store() {
  const { toys, owned, purchasePremium, equip } = useGame();
  const [purchasing, setPurchasing] = useState(null); // toy.id 진행 중
  const [justBought, setJustBought] = useState(null);

  const premiumToys = ['wakpuball', 'keycap'].flatMap((category) =>
    toys[category].filter((t) => t.tier === 'premium').map((t) => ({ ...t, category }))
  );

  const handleBuy = (toy) => {
    if (owned.includes(toy.id) || purchasing) return;
    setPurchasing(toy.id);
    // 실제 결제(인앱 결제) 연동 전까지는 "테스트 결제"로 즉시 처리하는 mock.
    setTimeout(() => {
      purchasePremium(toy.category, toy.id);
      setPurchasing(null);
      setJustBought(toy.id);
      setTimeout(() => setJustBought(null), 2000);
    }, 900);
  };

  return (
    <div className="case-page">
      <div className="case-eyebrow">06 // 프리미엄 스토어</div>
      <h1 className="case-title">프리미엄</h1>
      <p className="case-sub">결제 즉시 지급, 프리미엄 키캡은 실제 녹음 사운드 적용</p>

      <div className="store-grid">
        {premiumToys.map((toy) => {
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
        })}
      </div>
    </div>
  );
}
