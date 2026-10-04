"""Make fast-start previews and posters from the original repository videos."""
from pathlib import Path
import subprocess
import imageio_ffmpeg
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/optimized'
OUT.mkdir(parents=True, exist_ok=True)
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
VIDEOS = {
    'reel': 'la-reel--min.mp4',
    'accern': 'accern-rhea-cover-big.mp4',
    'blockbeat': 'blockbeat-cover-big-s.mp4',
}
for name, source in VIDEOS.items():
    original = ROOT / 'assets/videos' / source
    preview = OUT / f'{name}-preview.mp4'
    options = ['-t', '12'] if name == 'reel' else []
    subprocess.run([FFMPEG, '-hide_banner', '-loglevel', 'error', '-y', '-i', str(original), *options,
                    '-an', '-vf', "scale='min(1280,iw)':-2,fps=30", '-c:v', 'libx264',
                    '-preset', 'medium', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(preview)], check=True)
    temporary = OUT / f'{name}-poster.jpg'
    subprocess.run([FFMPEG, '-hide_banner', '-loglevel', 'error', '-y', '-ss', '1', '-i', str(original),
                    '-frames:v', '1', '-vf', "scale='min(1280,iw)':-2", str(temporary)], check=True)
    with Image.open(temporary) as image:
        image.save(OUT / f'{name}-poster.webp', quality=88, method=6)
    temporary.unlink()
for source in ['innovation-process', 'Gestalt-Principles', 'Effective-Design', 'How-to-design-an-Al']:
    with Image.open(ROOT / 'assets/images' / f'{source}.webp') as image:
        thumbnail = ImageOps.fit(image, (96, 96), method=Image.Resampling.LANCZOS)
        thumbnail.save(OUT / f'{source}-thumb.webp', quality=88, method=6)
print(f'Optimized media: {sum(p.stat().st_size for p in OUT.iterdir()):,} bytes')
