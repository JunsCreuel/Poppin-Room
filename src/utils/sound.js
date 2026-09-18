// 효과음 — 왁뿌볼 타격/파괴, 키캡 타건, 뽑기 성공 (Web Audio 합성 + mp3)
// 왁뿌볼 소리는 Web Audio로 노이즈를 필터링해 합성, 키캡 소리는 mp3 파일(없으면 합성음)
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
// 세져서 점점 더 크게 금이 가는 느낌을 준다. 프리미엄 등급은 아직 실제 녹음
// 파일이 없어서(왁뿌볼 크런치 녹음 자체가 팀에 아직 없음) 레이어를 한 겹 더
// 얹어 "더 꽉 찬" 느낌만 흉내낸다 — 진짜 녹음이 생기면 이 조건 분기를 <audio>
// 재생으로 바꿔치기하면 된다.
export function playCrackHit(progress = 0, isPremium = false) {
  const base = 2000 - progress * 900;
  noiseBurst({ duration: 0.055, filterFreq: base + Math.random() * 300, gain: 0.32 + progress * 0.18, q: 1.1 });
  setTimeout(() => {
    noiseBurst({ duration: 0.05, filterFreq: base * 0.6 + Math.random() * 200, gain: 0.22 + progress * 0.12, q: 1.4 });
  }, 18 + Math.random() * 12);
  if (isPremium) {
    setTimeout(() => {
      noiseBurst({ duration: 0.06, filterFreq: base * 1.3 + Math.random() * 250, gain: 0.16, q: 1.8 });
    }, 6);
  }
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

// 키캡 — toys.json에 sound 필드(실제 녹음 파일 경로)가 있는 키캡은 그
// 파일을 재생하고, 없으면 합성음(저가 멤브레인 키보드 느낌)으로 대체한다.
// 파일마다 Audio 객체를 하나씩만 만들어 재사용한다.
const keySoundCache = new Map();
function getKeySound(file) {
  let audio = keySoundCache.get(file);
  if (!audio) {
    audio = new Audio(file);
    keySoundCache.set(file, audio);
  }
  return audio;
}

export function playKeyClick(soundFile = null) {
  if (soundFile) {
    const audio = getKeySound(soundFile);
    audio.currentTime = 0;
    audio.volume = getVolume();
    audio.play().catch(() => {});
    return;
  }
  noiseBurst({ duration: 0.035, filterFreq: 2600, gain: 0.22, q: 2.2 });
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
