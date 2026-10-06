"""Build responsive media without changing artwork, preview duration or frame rate."""
from pathlib import Path
import json
import subprocess
import imageio_ffmpeg
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/optimized'
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
SOURCES = {
    'reel': 'la-reel--min.mp4',
    'accern': 'accern-rhea-cover-big.mp4',
    'blockbeat': 'blockbeat-cover-big-s.mp4',
}

def metadata(path):
    reader = imageio_ffmpeg.read_frames(str(path))
    info = next(reader)
    reader.close()
    return {key: info[key] for key in ('size', 'fps', 'duration')}

def fast_start(path):
    positions = {}
    with path.open('rb') as stream:
        while True:
            offset = stream.tell()
            header = stream.read(8)
            if len(header) != 8:
                break
            size, kind = int.from_bytes(header[:4], 'big'), header[4:].decode('ascii')
            if size == 1:
                size = int.from_bytes(stream.read(8), 'big')
            positions[kind] = offset
            if size < 8:
                break
            stream.seek(offset + size)
    return positions.get('moov', float('inf')) < positions.get('mdat', 0)

manifest = {'previews': {}, 'images': {}}
for name, filename in SOURCES.items():
    source = ROOT / 'assets/videos' / filename
    variants = {}
    desktop = OUT / f'{name}-preview.mp4'
    before = metadata(desktop)
    before_bytes = desktop.stat().st_size
    for width in (1280, 960):
        output = desktop if width == 1280 else OUT / f'{name}-preview-960.mp4'
        temporary = OUT / f'{name}-delivery-{width}.mp4'
        trim = ['-t', '12'] if name == 'reel' else []
        subprocess.run([
            FFMPEG, '-hide_banner', '-loglevel', 'error', '-y', '-i', str(source), *trim,
            '-an', '-vf', f"scale='min({width},iw)':-2,fps=30",
            '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p',
            '-movflags', '+faststart', str(temporary),
        ], check=True)
        after = metadata(temporary)
        assert after['fps'] == before['fps'], (name, 'frame rate changed')
        assert abs(after['duration'] - before['duration']) < 0.08, (name, 'duration changed')
        if width == 1280 and temporary.stat().st_size >= before_bytes:
            temporary.unlink()
        else:
            temporary.replace(output)
        assert fast_start(output), f'{output.name} must stream before download completes'
        variants[str(width)] = {**metadata(output), 'bytes': output.stat().st_size}
    manifest['previews'][name] = {'previous_bytes': before_bytes, 'variants': variants}
    print(f'{name}: {before_bytes:,} -> {variants["1280"]["bytes"]:,} desktop; '
          f'{variants["960"]["bytes"]:,} compact', flush=True)

for name, widths in [('flower', (640, 960, 1440)), ('magnifier', (480,))]:
    with Image.open(ROOT / 'assets/images' / f'{name}.webp') as original:
        for width in widths:
            height = round(original.height * width / original.width)
            output = OUT / f'{name}-{width}.webp'
            image = original.resize((width, height), Image.Resampling.LANCZOS)
            image.save(output, 'WEBP', quality=88, method=6)
            manifest['images'][output.name] = {'size': [width, height], 'bytes': output.stat().st_size}

(OUT / 'delivery-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
print('PASS: all preview durations, 30fps, fast-start metadata and responsive artwork verified', flush=True)
