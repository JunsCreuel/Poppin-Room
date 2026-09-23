// 내 계정 페이지 — 로그인(mock), 코인·히든카드·프리미엄 보유 내역, 진행 상황 초기화
import { useState } from 'react';
import { useGame } from '../store/useGame';

const CATEGORY_LABEL = { wakpuball: '왁뿌볼', keycap: '키캡' };

// Google 공식 "G" 로고 — Google Identity 브랜드 가이드라인 규격, 색상·비율 임의 변경 금지
function GoogleLogo() {
  return (
    <svg viewBox="0 0 18 18" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.8741 2.6836-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.806.5401-1.8368.8591-3.0477.8591-2.3436 0-4.3282-1.5831-5.0359-3.7104H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z" />
      <path fill="#FBBC05" d="M3.9641 10.71c-.18-.5401-.2823-1.1168-.2823-1.71s.1023-1.1699.2823-1.71V4.9582H.9573C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.9573 4.0418L3.9641 10.71z" />
      <path fill="#EA4335" d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.9641 7.29C4.6718 5.1627 6.6564 3.5795 9 3.5795z" />
    </svg>
  );
}

// 브라우저 confirm 창 대신 화면 안에서 2단계 확인 — 일부 모바일 브라우저에서 confirm 결과가 늦거나 무시되는 문제 회피
// step 상태는 부모(MyAccount)가 들고 있음 — 초기화 직후 로그아웃 화면으로 바뀌어도 '초기화 완료' 표시가 유지되도록
function ResetSection({ onReset, step, setStep }) {
  const handleConfirm = () => {
    onReset();
    setStep('done');
    setTimeout(() => setStep('idle'), 2000);
  };

  return (
    <section className="account-section account-danger">
      <h3 className="collection-section-title">데이터 초기화</h3>
      <p className="account-empty">지금까지 쌓은 코인·보유 디자인·히든카드·랭킹 기록 삭제, 처음 상태로 초기화, 복구 불가</p>
      {step === 'confirm' ? (
        <div className="v2-btn-row" style={{ margin: 0 }}>
          <button type="button" className="v2-btn v2-btn-secondary" onClick={() => setStep('idle')}>취소</button>
          <button type="button" className="reset-btn" onClick={handleConfirm}>정말 초기화</button>
        </div>
      ) : (
        <button type="button" className="reset-btn" onClick={() => setStep('confirm')} disabled={step === 'done'}>
          {step === 'done' ? '초기화 완료' : '진행 상황 초기화'}
        </button>
      )}
    </section>
  );
}

export default function MyAccount() {
  const { loggedIn, displayName, email, authError, login, logout, coins, hiddenCards, owned, toys, resetProgress, addTestCoins, addTestKeys, addTestAllSkins, secretKeys } = useGame();

  const [resetStep, setResetStep] = useState('idle'); // idle | confirm | done

  const premiumOwned = ['wakpuball', 'keycap'].flatMap((category) =>
    toys[category].filter((t) => t.tier === 'premium' && owned.includes(t.id)).map((t) => ({ ...t, category }))
  );

  if (!loggedIn) {
    return (
      <div className="case-page">
        <div className="case-eyebrow">MY ACCOUNT</div>
        <h1 className="case-title">계정 연결</h1>
        <p className="case-sub">히든카드 보관, 실물 경품 수령 안내는 계정 연결 후 확인 가능, Google에서 로그인</p>

        <div className="login-box">
          <button type="button" className="gsi-material-button" onClick={login}>
            <div className="gsi-material-button-state" />
            <div className="gsi-material-button-content-wrapper">
              <div className="gsi-material-button-icon"><GoogleLogo /></div>
              <span className="gsi-material-button-contents">Google 계정으로 로그인</span>
            </div>
          </button>
          {authError && <p className="account-note" style={{ color: 'var(--red)' }}>로그인 실패: {authError}</p>}
        </div>

        <section className="account-section">
        <h3 className="collection-section-title">테스트 (임시)</h3>
        <p className="account-empty">시연·개발용, 보유 코인 {coins} · 시크릿 키 {secretKeys}</p>
        <div className="v2-btn-row" style={{ margin: 0 }}>
          <button type="button" className="v2-btn v2-btn-secondary" onClick={() => addTestCoins(200)}>테스트 코인 +200</button>
          <button type="button" className="v2-btn v2-btn-secondary" onClick={() => addTestKeys(1)}>테스트 시크릿 키 +1</button>
          <button type="button" className="v2-btn v2-btn-secondary" onClick={addTestAllSkins}>테스트 모든 스킨 추가</button>
        </div>
      </section>

      <ResetSection onReset={resetProgress} step={resetStep} setStep={setResetStep} />
      </div>
    );
  }

  return (
    <div className="case-page">
      <div className="case-eyebrow">MY ACCOUNT</div>
      <div className="account-head">
        <h1 className="case-title">내 계정</h1>
        <button type="button" className="logout-btn" onClick={logout}>로그아웃</button>
      </div>
      <p className="case-sub">{displayName || email} 계정으로 로그인됨</p>

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
              <div key={toy.id} className="toy-card grade-premium">
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

      <section className="account-section">
        <h3 className="collection-section-title">테스트 (임시)</h3>
        <p className="account-empty">시연·개발용, 보유 코인 {coins} · 시크릿 키 {secretKeys}</p>
        <div className="v2-btn-row" style={{ margin: 0 }}>
          <button type="button" className="v2-btn v2-btn-secondary" onClick={() => addTestCoins(200)}>테스트 코인 +200</button>
          <button type="button" className="v2-btn v2-btn-secondary" onClick={() => addTestKeys(1)}>테스트 시크릿 키 +1</button>
          <button type="button" className="v2-btn v2-btn-secondary" onClick={addTestAllSkins}>테스트 모든 스킨 추가</button>
        </div>
      </section>

      <ResetSection onReset={resetProgress} step={resetStep} setStep={setResetStep} />
    </div>
  );
}
