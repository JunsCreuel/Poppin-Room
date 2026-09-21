#!/usr/bin/env python3
"""효과음 WAV 정리 — 48kHz 모노 16bit로 변환, 무음 꼬리 잘라내고 피크 정규화해 public/sounds/에 저장

사용법:
  python3 scripts/import_sound.py <원본.wav> <저장이름> [최대초]   # → public/sounds/<저장이름>.wav (최대 길이 기본 0.6초)
예:
  python3 scripts/import_sound.py ~/Downloads/common_hit.wav wakpuball-common-hit

이후 toys.json의 해당 오브제에 hitSound(팝볼) 또는 sound(키캡)로 "sounds/<저장이름>.wav" 연결
"""
import array
import os
import sys
import wave

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_SR = 48000
MAX_SEC = 0.6
TAIL_SEC = 0.08
FADE_SEC = 0.02


def main(src, name, max_sec=MAX_SEC):
    with wave.open(src) as w:
        ch, sw, sr, n = w.getnchannels(), w.getsampwidth(), w.getframerate(), w.getnframes()
        raw = w.readframes(n)
    if sw == 2:
        a = array.array('h', raw)
    elif sw == 3:  # 24bit → 상위 16bit
        a = array.array('h', (int.from_bytes(raw[i:i + 3], 'little', signed=True) >> 8 for i in range(0, len(raw), 3)))
    elif sw == 4:  # 32bit int → 상위 16bit
        a = array.array('h', (x >> 16 for x in array.array('i', raw)))
    elif sw == 1:  # 8bit unsigned
        a = array.array('h', ((x - 128) << 8 for x in raw))
    else:
        sys.exit(f"지원하지 않는 샘플 크기: {sw * 8}bit")
    mono = [sum(a[i:i + ch]) // ch for i in range(0, len(a), ch)] if ch > 1 else list(a)

    if sr == OUT_SR:
        out = mono
    elif sr % OUT_SR == 0:
        f = sr // OUT_SR
        out = [sum(mono[i:i + f]) // f for i in range(0, len(mono) - f + 1, f)]
    else:
        ratio = sr / OUT_SR
        out = []
        for k in range(int(len(mono) / ratio)):
            x = k * ratio
            i = int(x)
            t = x - i
            j = min(i + 1, len(mono) - 1)
            out.append(int(mono[i] * (1 - t) + mono[j] * t))

    win = OUT_SR // 100
    env = []
    for i in range(0, len(out) - win, win):
        s = 0
        for j in range(i, i + win):
            s += out[j] * out[j]
        env.append((s / win) ** 0.5)
    peak_rms = max(env)
    last_active = max(i for i, e in enumerate(env) if e > peak_rms * 0.05)
    keep = min(len(out), int((last_active + 1) * win + OUT_SR * TAIL_SEC), int(OUT_SR * max_sec))
    out = out[:keep]

    peak = max(abs(x) for x in out)
    scale = (0.9 * 32767) / peak if peak else 1
    out = [max(-32768, min(32767, int(x * scale))) for x in out]

    fade = int(OUT_SR * FADE_SEC)
    for k in range(fade):
        i = len(out) - fade + k
        out[i] = int(out[i] * (1 - k / fade))

    dst = os.path.join(ROOT, 'public', 'sounds', f'{name}.wav')
    with wave.open(dst, 'wb') as o:
        o.setnchannels(1)
        o.setsampwidth(2)
        o.setframerate(OUT_SR)
        o.writeframes(array.array('h', out).tobytes())
    print(f"{os.path.basename(src)}: {ch}ch {sr}Hz {n / sr:.2f}s → {os.path.relpath(dst, ROOT)} "
          f"{len(out) / OUT_SR:.2f}s, 정규화 x{scale:.1f}, {os.path.getsize(dst)} bytes")
    print(f'toys.json 연결값: "sounds/{name}.wav"')


if __name__ == '__main__':
    if len(sys.argv) not in (3, 4):
        print(__doc__)
        sys.exit(2)
    main(sys.argv[1], sys.argv[2], float(sys.argv[3]) if len(sys.argv) == 4 else MAX_SEC)
