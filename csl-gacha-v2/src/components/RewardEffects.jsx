// 왁뿌볼 룸 / 키캡 룸 양쪽에서 똑같이 쓰는 보상 연출 — 코인은 작은 토스트,
// 히든카드는 화면을 덮는 축하 모달로 보여준다.
export default function RewardEffects({ toast, hiddenCard, onCloseHidden }) {
  return (
    <>
      {toast && (
        <div className={`reward-toast ${toast.type === 'hidden' ? 'is-hidden' : ''}`}>
          {toast.type === 'coin' ? `+${toast.amount} 코인` : '히든카드 획득!'}
        </div>
      )}

      {hiddenCard && (
        <div className="hidden-modal-backdrop" onClick={onCloseHidden}>
          <div className="hidden-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hidden-modal-badge">HIDDEN CARD</div>
            <div className="hidden-modal-emoji">🎉</div>
            <h2>히든카드 획득!</h2>
            <p className="hidden-modal-code">{hiddenCard.code}</p>
            <p className="hidden-modal-desc">
              이 카드는 내 계정에 고유 저장, 실물 경품 수령 안내는 「내 계정」 탭에서 확인 가능
            </p>
            <button type="button" className="hidden-modal-close" onClick={onCloseHidden}>확인</button>
          </div>
        </div>
      )}
    </>
  );
}
