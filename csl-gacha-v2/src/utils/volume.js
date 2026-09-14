// 메인 사이트(script.js) 및 다른 CSL 서브 랩들과 같은 localStorage 키(csl-volume)를
// 공유해서, 다른 화면에서 맞춘 음량이 여기서도 그대로 유지되게 한다.
const KEY = 'csl-volume';
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
