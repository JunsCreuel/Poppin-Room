import { useGame } from '../store/useGame';

const CATEGORY_LABEL = { wakpuball: '왁뿌볼', keycap: '키캡' };

export default function MyAccount() {
  const { loggedIn, loginProvider, login, logout, coins, hiddenCards, owned, toys } = useGame();

  const premiumOwned = ['wakpuball', 'keycap'].flatMap((category) =>
    toys[category].filter((t) => t.tier === 'premium' && owned.includes(t.id)).map((t) => ({ ...t, category }))
  );

  if (!loggedIn) {
    return (
      <div className="case-page">
        <div className="case-eyebrow">07 // 내 계정</div>
        <h1 className="case-title">로그인이 필요해</h1>
        <p className="case-sub">히든카드 보관·실물 수령 안내는 계정에 연결돼야 볼 수 있어. 지금은 실제 로그인 연동 전이라 버튼을 누르면 바로 로그인된 것처럼 보여줘.</p>

        <div className="login-box">
          <button type="button" className="login-btn is-kakao" onClick={() => login('kakao')}>
            카카오로 로그인
          </button>
          <button type="button" className="login-btn is-google" onClick={() => login('google')}>
            Google로 로그인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="case-page">
      <div className="case-eyebrow">07 // 내 계정</div>
      <div className="account-head">
        <h1 className="case-title">내 계정</h1>
        <button type="button" className="logout-btn" onClick={logout}>로그아웃</button>
      </div>
      <p className="case-sub">{loginProvider === 'kakao' ? '카카오' : 'Google'} 계정으로 로그인됨 (mock)</p>

      <section className="account-section">
        <h3 className="collection-section-title">보유 코인</h3>
        <div className="account-coin-balance">🪙 {coins} 코인</div>
      </section>

      <section className="account-section">
        <h3 className="collection-section-title">히든카드 ({hiddenCards.length})</h3>
        {hiddenCards.length === 0 ? (
          <p className="account-empty">아직 없어 — 왁뿌볼·키캡을 계속 누르다 보면 아주 가끔(0.6%) 나와.</p>
        ) : (
          <div className="hidden-card-list">
            {hiddenCards.map((card) => (
              <div key={card.code} className="hidden-card-row">
                <span className="hidden-card-cat">{CATEGORY_LABEL[card.category]}</span>
                <span className="hidden-card-code">{card.code}</span>
                <span className="hidden-card-date">{new Date(card.wonAt).toLocaleDateString('ko-KR')}</span>
              </div>
            ))}
          </div>
        )}
        {hiddenCards.length > 0 && (
          <p className="account-note">실물 상품 수령 절차는 계정 시스템이 실제로 연동되면 이 화면에서 안내될 예정이야.</p>
        )}
      </section>

      <section className="account-section">
        <h3 className="collection-section-title">구매한 프리미엄 ({premiumOwned.length})</h3>
        {premiumOwned.length === 0 ? (
          <p className="account-empty">아직 없어 — 스토어에서 구매할 수 있어.</p>
        ) : (
          <div className="collection-grid">
            {premiumOwned.map((toy) => (
              <div key={toy.id} className="toy-card grade-limited">
                <div className="toy-swatch">
                  <img src={toy.image} alt={toy.name} style={{ filter: toy.filter }} className={toy.isHolo ? 'is-holo' : ''} />
                </div>
                <div className="toy-name">{toy.name}</div>
                <div className="toy-grade">PREMIUM</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
