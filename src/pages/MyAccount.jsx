// 내 계정 페이지 — Google 로그인, 코인·히든카드·프리미엄 보유 내역, 진행 상황 초기화
import { useState } from 'react';
import { useGame } from '../store/useGame';
import AuthButton from '../components/AuthButton';

const CATEGORY_LABEL = { wakpuball: '왁뿌볼', keycap: '키캡' };

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
  const { loggedIn, displayName, email, syncError, logout, coins, hiddenCards, owned, toys, resetProgress, addTestCoins, addTestKeys, addTestAllSkins, secretKeys } = useGame();

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

        <AuthButton />

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
      {syncError && (
        <p className="account-note" style={{ color: 'var(--red)' }}>
          계정 데이터 연결 실패, 지금 진행 상황 저장 안 됨, 새로고침 후 재시도 ({syncError})
        </p>
      )}

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
