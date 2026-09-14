// 왁뿌볼 크런치 효과음은 CRACK LAB(crack-app/src/crunch.js)에서 그대로 가져왔다 —
// 실제 녹음 파일 없이 Web Audio로 노이즈를 필터링해 "빠직" 소리를 만드는 방식.
// 키캡 타건음은 CLICK LAB에 이미 있는 실제 녹음 파일(keyboard.mp3)을 그대로 쓴다.
import { getVolume } from './volume.js';

let ctx;
function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function noiseBurst({ duration = 0.08, filterFreq = 1400, gain = 0.5, q = 0.9 }) {
  const audioCtx = getCtx();
  const bufferSize = Math.max(1, Math.floor(audioCtx.sampleRate * duration));
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) ** 1.6;
  }

  const src = audioCtx.createBufferSource();
  src.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = filterFreq;
  filter.Q.value = q;

  const g = audioCtx.createGain();
  const now = audioCtx.currentTime;
  const vol = gain * getVolume();
  g.gain.setValueAtTime(vol, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + duration);

  src.connect(filter).connect(g).connect(audioCtx.destination);
  src.start(now);
  src.stop(now + duration + 0.02);
}

// 왁뿌볼 — 누를 때마다 나는 크런치. progress(0~1)가 올라갈수록 톤이 낮아지고
// 세져서 점점 더 크게 금이 가는 느낌을 준다.
export function playCrackHit(progress = 0) {
  const base = 2000 - progress * 900;
  noiseBurst({ duration: 0.055, filterFreq: base + Math.random() * 300, gain: 0.32 + progress * 0.18, q: 1.1 });
  setTimeout(() => {
    noiseBurst({ duration: 0.05, filterFreq: base * 0.6 + Math.random() * 200, gain: 0.22 + progress * 0.12, q: 1.4 });
  }, 18 + Math.random() * 12);
}

// 왁뿌볼 — 완전히 깨지는 순간. 저음 "퍽" + 잔파편이 튀는 고음 크랙을 겹친다.
export function playCrackBreak() {
  noiseBurst({ duration: 0.22, filterFreq: 260, gain: 0.6, q: 0.6 });
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      noiseBurst({ duration: 0.05 + Math.random() * 0.04, filterFreq: 1600 + Math.random() * 1800, gain: 0.28, q: 1.6 });
    }, 30 + i * 35 + Math.random() * 20);
  }
}

// 키캡 — CLICK LAB에 이미 있는 실제 기계식 키보드 녹음을 재생한다. 연타로 빠르게
// 반복 재생될 때도 끊기지 않고 다시 시작하도록 currentTime을 매번 되감는다.
const keySound = new Audio('sounds/keyboard.mp3');
export function playKeyClick() {
  keySound.currentTime = 0;
  keySound.volume = getVolume();
  keySound.play().catch(() => {});
}

// 뽑기 성공 — 실제 에셋이 아직 없어서 합성음으로 대체(등급이 높을수록 음이 높아짐).
export function playGachaSuccess(grade) {
  const audioCtx = getCtx();
  const base = grade === 'limited' ? 700 : grade === 'rare' ? 550 : 440;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = 'triangle';
  const now = audioCtx.currentTime;
  osc.frequency.setValueAtTime(base, now);
  osc.frequency.exponentialRampToValueAtTime(base * 1.6, now + 0.3);
  const vol = 0.16 * getVolume();
  g.gain.setValueAtTime(vol, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  osc.connect(g).connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.32);
}
