// 보상 연출 훅 — pressReward 결과를 토스트/히든카드 모달 상태로 변환
import { useState, useCallback, useRef } from 'react';

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
