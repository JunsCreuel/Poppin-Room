import { useGame } from '../store/useGame';

const CATEGORY_LABEL = { wakpuball: '왁뿌볼', keycap: '키캡' };

export default function MyAccount() {
  const { loggedIn, loginProvider, login, logout, coins, hiddenCards, owned, toys, resetProgress } = useGame();

  const premiumOwned = ['wakpuball', 'keycap'].flatMap((category) =>
    toys[category].filter((t) => t.tier === 'premium' && owned.includes(t.id)).map((t) => ({ ...t, category }))
  );

  const handleReset = () => {
    const ok = window.confirm('코인·보유 디자인·히든카드·랭킹 기록 전체 삭제, 처음 상태로 초기화, 복구 불가');
    if (ok) resetProgress();
  };

  if (!loggedIn) {
    return (
      <div className="case-page">
        <div className="case-eyebrow">07 // 내 계정</div>
        <h1 className="case-title">계정 연결</h1>
        <p className="case-sub">히든카드 보관, 실물 경품 수령 안내는 계정 연결 후 확인 가능, 카카오 또는 Google에서 로그인</p>

        <div className="login-box">
          <button type="button" className="login-btn is-kakao" onClick={() => login('kakao')}>
            카카오 계정 로그인
          </button>
          <button type="button" className="login-btn is-google" onClick={() => login('google')}>
            Google 계정 로그인
          </button>
        </div>

        <section className="account-section account-danger">
          <h3 className="collection-section-title">데이터 초기화</h3>
          <p className="account-empty">지금까지 쌓은 코인·보유 디자인 기록 삭제, 처음 상태로 초기화</p>
          <button type="button" className="reset-btn" onClick={handleReset}>진행 상황 초기화</button>
        </section>
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
      <p className="case-sub">{loginProvider === 'kakao' ? '카카오' : 'Google'} 계정으로 로그인됨</p>

      <section className="account-section">
        <h3 className="collection-section-title">보유 코인</h3>
        <div className="account-coin-balance">🪙 {coins} 코인</div>
      </section>

      <section className="account-section">
        <h3 className="collection-section-title">히든카드 ({hiddenCards.length})</h3>
        {hiddenCards.length === 0 ? (
          <p className="account-empty">아직 없음 — 왁뿌볼·키캡을 계속 누르면 아주 가끔(0.6%) 획득 가능</p>
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
          <p className="account-note">히든카드 수집 시 실물 경품 수령 절차, 이 화면에서 순서대로 안내</p>
        )}
      </section>

      <section className="account-section">
        <h3 className="collection-section-title">구매한 프리미엄 ({premiumOwned.length})</h3>
        {premiumOwned.length === 0 ? (
          <p className="account-empty">아직 없음 — 스토어에서 구매 획득 가능</p>
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

      <section className="account-section account-danger">
        <h3 className="collection-section-title">데이터 초기화</h3>
        <p className="account-empty">지금까지 쌓은 코인·보유 디자인·히든카드·랭킹 기록 삭제, 처음 상태로 초기화</p>
        <button type="button" className="reset-btn" onClick={handleReset}>진행 상황 초기화</button>
      </section>
    </div>
  );
}
