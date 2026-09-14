import { useState, useCallback, useRef } from 'react';

// pressReward()가 반환한 결과를 받아서 토스트/히든카드 모달 상태로 바꿔주는
// 작은 훅. 왁뿌볼 룸과 키캡 룸에서 동일하게 재사용한다.
export function useRewardEffects() {
  const [toast, setToast] = useState(null);
  const [hiddenCard, setHiddenCard] = useState(null);
  const toastTimeoutRef = useRef(null);

  const trigger = useCallback((payload) => {
    if (!payload) return;

    if (payload.type === 'hidden') {
      setHiddenCard(payload.card);
      return;
    }

    setToast(payload);
    clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 1400);
  }, []);

  const closeHidden = useCallback(() => setHiddenCard(null), []);

  return { toast, hiddenCard, trigger, closeHidden };
}
