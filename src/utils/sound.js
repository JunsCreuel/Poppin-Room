// 효과음 — 왁뿌볼 타격/파괴, 키캡 타건, 뽑기 성공 (Web Audio 합성 + mp3)
// 왁뿌볼 소리는 Web Audio로 노이즈를 필터링해 합성, 키캡 소리는 mp3 파일(없으면 합성음)
import { getVolume } from './volume.js';

let ctx;
let master; // 모든 소리가 거치는 마스터 게인 → 컴프레서 → 출력 (폰 스피커에서 찌그러짐 방지)

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 12;
    comp.ratio.value = 4;
    comp.attack.value = 0.003;
    comp.release.value = 0.15;
    master = ctx.createGain();
    master.gain.value = 1;
    master.connect(comp).connect(ctx.destination);
  }
  return ctx;
}

// 모바일에서는 컨텍스트가 suspended(iOS는 interrupted)인 채로 소리를 예약하면
// 재생이 시작될 때 이미 끝나 있어 묵음이 된다 — running 상태가 된 뒤에 예약한다
function whenRunning(fn) {
  const audioCtx = getCtx();
  if (audioCtx.state === 'running') {
    fn(audioCtx);
    return;
  }
  audioCtx.resume().then(() => fn(audioCtx)).catch(() => {});
}

// ---- 모바일 오디오 언락 ----
// iOS: Web Audio는 측면 무음 스위치를 따르지만, <audio> 미디어를 재생 중이면 세션이
// '재생' 모드로 바뀌어 무음 스위치를 무시한다(게임들이 쓰는 방식). 첫 탭에서 무음 WAV를
// 반복 재생해 두고, 화면을 벗어나면 멈췄다가 돌아오면 다시 켠다.
// Android/iOS 공통: 첫 사용자 제스처에서 AudioContext를 만들고 resume 해둔다.
let silentEl = null;
let unlockInstalled = false;

function silentWavDataUri() {
  const sampleRate = 8000;
  const samples = sampleRate / 10; // 0.1초
  const buf = new ArrayBuffer(44 + samples);
  const v = new DataView(buf);
  const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); v.setUint32(4, 36 + samples, true); str(8, 'WAVE');
  str(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true);
  str(36, 'data'); v.setUint32(40, samples, true);
  for (let i = 0; i < samples; i++) v.setUint8(44 + i, 128);
  let bin = '';
  new Uint8Array(buf).forEach((b) => { bin += String.fromCharCode(b); });
  return `data:audio/wav;base64,${btoa(bin)}`;
}

function getSilentEl() {
  if (!silentEl) {
    silentEl = document.createElement('audio');
    silentEl.src = silentWavDataUri();
    silentEl.loop = true;
    silentEl.setAttribute('playsinline', '');
    silentEl.setAttribute('data-audio-unlock', '');
    silentEl.style.display = 'none';
    document.body.appendChild(silentEl);
  }
  return silentEl;
}

function unlock() {
  const audioCtx = getCtx();
  if (audioCtx.state !== 'running') audioCtx.resume().catch(() => {});
  // iOS 구형 사파리는 제스처 안에서 소리를 한 번 실제로 내야 이후 재생이 풀린다
  const src = audioCtx.createBufferSource();
  src.buffer = audioCtx.createBuffer(1, 1, audioCtx.sampleRate);
  src.connect(audioCtx.destination);
  src.start(0);
  const el = getSilentEl();
  if (el.paused) el.play().catch(() => {});
}

export function installAudioUnlock() {
  if (unlockInstalled || typeof document === 'undefined') return () => {};
  unlockInstalled = true;
  const events = ['pointerdown', 'touchend', 'keydown'];
  events.forEach((e) => document.addEventListener(e, unlock, { capture: true, passive: true }));
  const onVisibility = () => {
    if (!silentEl) return;
    if (document.hidden) silentEl.pause();
    else {
      silentEl.play().catch(() => {});
      if (ctx && ctx.state !== 'running') ctx.resume().catch(() => {});
    }
  };
  document.addEventListener('visibilitychange', onVisibility);
  return () => {
    events.forEach((e) => document.removeEventListener(e, unlock, { capture: true }));
    document.removeEventListener('visibilitychange', onVisibility);
    unlockInstalled = false;
  };
}

function noiseBurst({ duration = 0.08, filterFreq = 1400, gain = 0.5, q = 0.9 }) {
  whenRunning((audioCtx) => {
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

    src.connect(filter).connect(g).connect(master);
    src.start(now);
    src.stop(now + duration + 0.02);
  });
}

// ---- 녹음 샘플 재생 (toys.json hitSound 등) ----
// 파일은 한 번만 받아 디코드해두고, 탭마다 새 소스로 재생(연타해도 겹쳐서 남)
const sampleCache = new Map(); // url → Promise<AudioBuffer>
export function preloadSample(url) {
  if (!url) return null;
  if (!sampleCache.has(url)) {
    const p = fetch(url).then((r) => r.arrayBuffer()).then((buf) => getCtx().decodeAudioData(buf));
    p.catch(() => sampleCache.delete(url));
    sampleCache.set(url, p);
  }
  return sampleCache.get(url);
}

// 녹음 샘플 1회 재생 — 로드 실패 시 onFail(합성음 폴백)
function playSample(url, { rate = 1, gain = 1 } = {}, onFail) {
  const loading = preloadSample(url);
  if (!loading) return;
  loading.then((buffer) => whenRunning((audioCtx) => {
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    src.playbackRate.value = rate;
    const g = audioCtx.createGain();
    g.gain.value = gain * getVolume();
    src.connect(g).connect(master);
    src.start();
  })).catch(() => onFail?.());
}

// 왁뿌볼 타격 녹음 — 깨질수록 살짝 낮고 세게, 매번 미세하게 다른 피치
export function playSampleHit(url, progress = 0) {
  playSample(url, { rate: 0.94 + Math.random() * 0.12 - progress * 0.08, gain: 0.7 + progress * 0.3 }, () => playCrackHit(progress));
}

// ---- 재질별 합성 타격음 (녹음 없는 LIMITED용) ----
// 오디오 시간 기준으로 예약해서 setTimeout보다 타이밍이 정확함
function grain(audioCtx, { at, duration, type = 'bandpass', freq, q = 1.2, gain }) {
  const n = Math.max(1, Math.floor(audioCtx.sampleRate * duration));
  const buffer = audioCtx.createBuffer(1, n, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 1.4;
  const src = audioCtx.createBufferSource();
  src.buffer = buffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = q;
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(gain * getVolume(), at);
  g.gain.exponentialRampToValueAtTime(0.001, at + duration);
  src.connect(filter).connect(g).connect(master);
  src.start(at);
  src.stop(at + duration + 0.02);
}

function tone(audioCtx, { at, duration, freq, freqEnd, gain, type = 'sine', detune = 0 }) {
  const osc = audioCtx.createOscillator();
  osc.type = type;
  osc.detune.value = detune;
  osc.frequency.setValueAtTime(freq, at);
  if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, at + duration);
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(gain * getVolume(), at);
  g.gain.exponentialRampToValueAtTime(0.001, at + duration);
  osc.connect(g).connect(master);
  osc.start(at);
  osc.stop(at + duration + 0.02);
}

// 껍질 깨지는 소리 — 순간 클릭 + 번지는 균열 조각 + 낮은 몸통 울림 + 재질 잔향.
// 깨질수록(progress↑) 조각이 늘고 몸통 음이 낮아지며 전체가 세짐, 매번 ±6% 랜덤
// material: 'crystal'(유리·크리스탈, 맑고 높은 배음) | 'shell'(도자기·조개껍질, 둔하고 바삭)
export function playShellCrack(material = 'crystal', progress = 0) {
  whenRunning((audioCtx) => {
    const t0 = audioCtx.currentTime;
    const vary = () => 0.94 + Math.random() * 0.12;
    const level = (0.5 + progress * 0.3) * vary();

    grain(audioCtx, { at: t0, duration: 0.006, type: 'highpass', freq: 4500 + Math.random() * 1500, q: 0.7, gain: 0.9 * level });

    const count = 3 + Math.round(progress * 3);
    let t = t0 + 0.004;
    for (let i = 0; i < count; i++) {
      const freq = (1200 + Math.random() * 2800) * (1 - i * 0.06);
      grain(audioCtx, { at: t, duration: 0.012 + Math.random() * 0.018, freq, q: 2.5, gain: (0.45 - i * 0.05) * level });
      t += 0.008 + Math.random() * 0.017;
    }

    tone(audioCtx, { at: t0, duration: 0.08 + progress * 0.04, freq: (220 - progress * 60) * vary(), freqEnd: 120, gain: 0.5 * level });

    if (material === 'crystal') {
      [[2600, 0.18, 0.12], [4200, 0.15, 0.08], [6400, 0.12, 0.05]].forEach(([freq, duration, gain], i) => {
        tone(audioCtx, { at: t0 + 0.003 + i * 0.002, duration, freq: freq * vary(), gain: gain * level, detune: (Math.random() - 0.5) * 30 });
      });
    } else {
      grain(audioCtx, { at: t0 + 0.01, duration: 0.06, freq: 900 + Math.random() * 700, q: 1.0, gain: 0.35 * level });
      tone(audioCtx, { at: t0 + 0.005, duration: 0.05, freq: 1900 * vary(), gain: 0.06 * level, type: 'triangle' });
    }
  });
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

// 키캡 — toys.json에 sound 필드(녹음 파일 경로)가 있는 키캡은 그 파일을 Web Audio로
// 재생(연타 겹침 허용, 피치 미세 변주), 없으면 합성음(저가 멤브레인 키보드 느낌)
export function playKeyClick(soundFile = null) {
  if (soundFile) {
    playSample(soundFile, { rate: 0.97 + Math.random() * 0.06, gain: 0.9 }, () => playKeyClick(null));
    return;
  }
  noiseBurst({ duration: 0.035, filterFreq: 2600, gain: 0.33, q: 2.2 });
}

// 뽑기 — 캡슐이 흔들리는 동안 나는 녹음(약 2초), 로드 실패 시 무음
export const GACHA_SHAKE_SOUND = 'sounds/gacha-shake.wav';
export function playGachaShake() {
  playSample(GACHA_SHAKE_SOUND, { gain: 0.9 });
}

// 뽑기 성공 — 실제 에셋이 아직 없어서 합성음으로 대체(등급이 높을수록 음이 높아짐).
export function playGachaSuccess(grade) {
  whenRunning((audioCtx) => {
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
    osc.connect(g).connect(master);
    osc.start(now);
    osc.stop(now + 0.32);
  });
}
