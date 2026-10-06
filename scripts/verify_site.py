"""Check release files, fragment links, asset hashes and deferred video sources."""
from collections import Counter
from hashlib import sha256
from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]

class Document(HTMLParser):
    def __init__(self):
        super().__init__()
        self.elements = []

    def handle_starttag(self, tag, attributes):
        self.elements.append((tag, dict(attributes)))

document = Document()
document.feed((ROOT / 'index.html').read_text(encoding='utf-8'))
ids = Counter(attrs['id'] for _, attrs in document.elements if 'id' in attrs)
assert all(count == 1 for count in ids.values()), 'Duplicate HTML/SVG ID'
assert sum(tag == 'h1' for tag, _ in document.elements) == 1, 'Expected one page heading'
assets = set()
for tag, attrs in document.elements:
    for key in ['src', 'poster', 'data-src', 'data-src-compact', 'href']:
        value = attrs.get(key)
        if not value:
            continue
        url = urlsplit(value)
        if url.scheme or url.netloc:
            continue
        if url.path:
            path = ROOT / unquote(url.path)
            assert path.is_file(), f'Missing asset: {value}'
            assets.add(path)
        elif url.fragment:
            assert unquote(url.fragment) in ids, f'Missing fragment: {value}'
    if tag == 'video':
        assert not attrs.get('src'), 'Videos must wait until visible or requested'
        assert attrs.get('data-src') and attrs.get('poster'), 'Video needs a source and immediate poster'
        assert attrs.get('preload') == 'none' and 'playsinline' in attrs
    if tag == 'img':
        for candidate in attrs.get('srcset', '').split(','):
            if candidate.strip():
                path = ROOT / unquote(candidate.split()[0])
                assert path.is_file(), f'Missing responsive image: {path.name}'
                assets.add(path)
for css in [path for path in assets if path.suffix == '.css']:
    for value in re.findall(r'url\([\'"]?([^\)\'"]+)', css.read_text(encoding='utf-8')):
        assert (css.parent / value).is_file(), f'Missing CSS asset: {value}'
for asset in assets:
    if asset.parent.name != 'site':
        continue
    expected = asset.name.split('.')[1]
    assert sha256(asset.read_bytes()).hexdigest().startswith(expected), f'Stale asset hash: {asset.name}'
    source = ROOT / ('stylesheet/style.css' if asset.suffix == '.css' else 'javascript/script.js')
    content = source.read_text(encoding='utf-8').replace('../assets/fonts/', '../fonts/')
    assert content.encode('utf-8') == asset.read_bytes(), f'Run scripts/build_assets.py: {asset.name}'
assert all('data-scroll-container' not in attrs for _, attrs in document.elements), 'Nested transformed scrollers must not return'
print(f'PASS: {len(ids)} unique IDs, valid fragment links, {len(assets)} local assets, current CSS/JS hashes, deferred inline videos')
