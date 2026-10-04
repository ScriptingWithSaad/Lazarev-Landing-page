# Lazarev Landing Page

A responsive HTML, CSS and JavaScript recreation of the Lazarev agency website by ScriptingWithSaad.

[Open the live site](https://scriptingwithsaad.github.io/Lazarev-Landing-page/)

## Responsive interactions

- Fluid typography and content-sized sections, with stacked layouts for phones and tablets.
- A keyboard-accessible mobile menu with expandable groups and working section links.
- Native touch scrolling. Desktop wheel smoothing uses Lenis with the same GSAP ticker as ScrollTrigger, avoiding nested transformed scroll containers.
- Transform-based decorative parallax, subtle card reveals, a cursor follower on desktop and reversible service accordions.
- The original unfolding hero, staggered navbar labels, rotating showreel ring and service hover treatment are restored. Every process column scrubs from straight rows into its 1vw staircase and reverses when scrolling back, including on phones.
- Reduced-motion preferences remove decorative motion and autoplay. Data-saving mode also suppresses automatic previews. Content remains visible when motion libraries are unavailable.
- Project previews support both hover and explicit play/pause buttons. Offscreen and background-tab previews pause.
- The full showreel loads only when requested and expands from its thumbnail into a native fullscreen modal. Closing animates back and restores focus and the page position. The player follows portrait, landscape and browser viewport changes.
- Self-hosted fonts, scripts, local logos, small article thumbnails and optimized video previews. The original full showreel and source media are retained.

## Local development

From the repository root:

```sh
python -m http.server 8782 --bind 127.0.0.1
```

Open `http://127.0.0.1:8782/`. No framework or install is needed to run the site.

Edit `stylesheet/style.css` and `javascript/script.js`, then regenerate the content-hashed release files:

```sh
python scripts/build_assets.py
python scripts/verify_site.py
node --check javascript/script.js
```

To regenerate previews and thumbnails, install `Pillow` and `imageio-ffmpeg`, then run `python scripts/optimize_media.py`. The showreel preview is a 12-second silent loop; the full original reel is available in the player. Previews are H.264, up to 1280px wide at 30fps, with MP4 fast-start metadata. Posters render before playback is ready.

## Validation

Checked in Chromium at 320, 360, 390, 430, 768, 1024, 1100, 1280 and 1920px widths, plus a compact 1110px desktop and 844×390 landscape. Checks cover page overflow, mobile submenus, section navigation, reversible process scrubbing on phones and desktops, cursor tracking, service hover effects, accordions, video play/pause, full-screen modal sizing through orientation changes, Escape/close, focus restoration and console errors. Viewport checks do not replace testing on physical devices.

Branding and media are retained for this educational recreation. See [third-party notices](THIRD_PARTY.md).
