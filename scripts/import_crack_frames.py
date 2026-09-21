#!/usr/bin/env python3
"""팝볼 크랙 프레임 가져오기 — 디자인팀 PNG(01.png…NN.png)를 WebP로 변환해 public/images/crack/<id>/에 넣고 toys.json에 연결

사용법:
  pip install pillow
  python3 scripts/import_crack_frames.py <압축 푼 폴더> basic-pink=wb_01 swirl-spark=wb_02 marble=wb_03

프레임 수는 해당 오브제의 hitsToBreak(등급별 10/15/20/20)와 같아야 하고 01부터 빠짐없이 있어야 함
"""
import json
import re
import shutil
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
TOYS_JSON = ROOT / "src" / "data" / "toys.json"
OUT_ROOT = ROOT / "public" / "images" / "crack"
FRAME_RE = re.compile(r"^(\d{2})\.png$", re.IGNORECASE)


def fail(msg):
    print(f"오류: {msg}", file=sys.stderr)
    sys.exit(1)


def collect_frames(folder):
    frames = {}
    for p in folder.iterdir():
        m = FRAME_RE.match(p.name)
        if m and p.is_file():
            frames[int(m.group(1))] = p
    return frames


def main(argv):
    if len(argv) < 3:
        print(__doc__)
        sys.exit(2)

    src_root = Path(argv[1]).expanduser().resolve()
    if not src_root.is_dir():
        fail(f"폴더 없음: {src_root}")

    mappings = []
    for arg in argv[2:]:
        if "=" not in arg:
            fail(f"'이름=toyId' 형식이어야 함: {arg}")
        name, toy_id = arg.split("=", 1)
        mappings.append((name.strip(), toy_id.strip()))

    data = json.loads(TOYS_JSON.read_text(encoding="utf-8"))
    toys_by_id = {t["id"]: t for t in data["wakpuball"]}

    total_files = 0
    total_bytes = 0
    for name, toy_id in mappings:
        toy = toys_by_id.get(toy_id)
        if not toy:
            fail(f"toys.json wakpuball에 없는 id: {toy_id}")
        folder = src_root / name
        if not folder.is_dir():
            fail(f"프레임 폴더 없음: {folder}")

        frames = collect_frames(folder)
        expected = toy["hitsToBreak"]
        missing = [i for i in range(1, expected + 1) if i not in frames]
        extra = sorted(i for i in frames if i < 1 or i > expected)
        if missing or extra:
            fail(
                f"{toy_id}({name}): hitsToBreak={expected}인데 프레임이 안 맞음 — "
                f"빠짐 {[f'{i:02d}' for i in missing]}, 초과 {[f'{i:02d}' for i in extra]}"
            )

        out_dir = OUT_ROOT / toy_id
        if out_dir.exists():
            shutil.rmtree(out_dir)
        out_dir.mkdir(parents=True)

        for i in range(1, expected + 1):
            im = Image.open(frames[i]).convert("RGBA")
            out_path = out_dir / f"{i:02d}.webp"
            im.save(out_path, "WEBP", quality=88, method=6)
            total_files += 1
            total_bytes += out_path.stat().st_size

        toy["crackFrames"] = {"dir": f"images/crack/{toy_id}", "count": expected}
        print(f"{toy_id} ← {name}: {expected}장 → {out_dir.relative_to(ROOT)}")

    TOYS_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"완료: {total_files}장, {total_bytes / 1024:.0f} KB, toys.json 갱신")


if __name__ == "__main__":
    main(sys.argv)
