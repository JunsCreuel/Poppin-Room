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

// 왁뿌볼 — 다 깨진 직후 안에 든 내용물이 찌그러지며 삐져나오는 순간 한 번
// 나는 "찌익" 스퀴시음. CRACK LAB(crack-app/src/crunch.js)의 playSquish를
// 그대로 가져왔다.
export function playOoze() {
  const audioCtx = getCtx();
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = 'sine';
  const now = audioCtx.currentTime;
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(140, now + 0.35);
  const vol = 0.22 * getVolume();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(vol, now + 0.05);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  osc.connect(g).connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.42);
}

// 왁뿌볼 — 다 깨진 뒤에도 계속 눌러서 내용물을 조몰락거릴 때마다 나는
// 가벼운 "뽀드득" 소리. 매번 주파수를 살짝씩 흔들어서 연타해도 질리지
// 않게 한다.
export function playSquishTouch() {
  const audioCtx = getCtx();
  const now = audioCtx.currentTime;
  const vol = (0.16 + Math.random() * 0.08) * getVolume();

  const size = Math.max(1, Math.floor(audioCtx.sampleRate * 0.11));
  const buffer = audioCtx.createBuffer(1, size, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < size; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / size) ** 1.3;
  }
  const src = audioCtx.createBufferSource();
  src.buffer = buffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 450 + Math.random() * 550;
  filter.Q.value = 0.7;
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(vol, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  src.connect(filter).connect(g).connect(audioCtx.destination);
  src.start(now);
  src.stop(now + 0.11);

  const osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(170 + Math.random() * 70, now);
  osc.frequency.exponentialRampToValueAtTime(90, now + 0.09);
  const g2 = audioCtx.createGain();
  g2.gain.setValueAtTime(vol * 0.5, now);
  g2.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  osc.connect(g2).connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.11);
}

// 키캡 — 실제 녹음 파일이 배정된 키캡(베이직 핑크/펄 화이트/선더 크리스탈/
// 쥬얼 블룸/히든 키캡)은 그 파일을 그대로 재생하고, 나머지(스모크 클리어/
// 라이트닝 실버/핑크 플라워/블랙 오브)는 합성음(저가 멤브레인 키보드 느낌)
// 으로 구분한다. 파일마다 Audio 객체를 하나씩만 만들어 재사용한다.
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
