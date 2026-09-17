// 전역 음량 설정 — localStorage에 저장하고 변경 시 구독자에게 알림
const KEY = 'poppinroom-volume';
const listeners = new Set();
let volume = Number(localStorage.getItem(KEY) ?? '50') / 100;

export function getVolume() {
  return volume;
}

export function setVolume(v) {
  volume = Math.min(1, Math.max(0, v));
  localStorage.setItem(KEY, String(Math.round(volume * 100)));
  listeners.forEach((fn) => fn(volume));
}

export function onVolumeChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
