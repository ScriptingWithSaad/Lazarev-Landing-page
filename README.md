# Lazarev Landing Page

A responsive HTML, CSS and JavaScript recreation of the Lazarev agency website by ScriptingWithSaad.

[Open the live site](https://scriptingwithsaad.github.io/Lazarev-Landing-page/)

## Responsive interactions

- Fluid typography and content-sized sections, with stacked layouts for phones and tablets.
- A keyboard-accessible mobile menu with expandable groups and working section links.
- The mobile menu fades and slides without moving its trigger or changing the page width. Its two hamburger lines transition into a close icon, and submenus stay in place through the closing animation.
- Phone article highlights rotate automatically in a single-card frame without a horizontal scrollbar. Previous, next and pause controls remain available; rotation pauses when offscreen, in a background tab, or while the menu or showreel is open. Reduced motion starts rotation paused.
- UI/UX services cover audit, flows, interfaces and research. Product Design separately covers SaaS platforms, web apps, mobile apps and websites, with dedicated section links, descriptions and enquiry actions.
- Native touch scrolling. Desktop wheel smoothing uses Lenis with the same GSAP ticker as ScrollTrigger, avoiding nested transformed scroll containers.
- Scroll measurements wait until gestures finish. Mobile address-bar changes and lazy image decoding do not repeatedly reset animation progress. Cursor tracking and process offsets reuse measurements.
- Transform-based decorative parallax, subtle card reveals, a cursor follower on desktop and reversible service accordions.
- The original unfolding hero, staggered navbar labels, rotating showreel ring and service hover treatment are restored. Every process column scrubs from straight rows into its 1vw staircase and reverses when scrolling back, including on phones.
- Reduced-motion preferences remove decorative motion and autoplay. Data-saving mode also suppresses automatic previews. Content remains visible when motion libraries are unavailable.
- Project previews support both hover and explicit play/pause buttons. Offscreen and background-tab previews pause.
- The full showreel loads only when requested and expands from its thumbnail into a native fullscreen modal. Closing animates back and restores focus and the page position. The player follows portrait, landscape and browser viewport changes.
- Self-hosted fonts, scripts, local logos, small article thumbnails and optimized video previews. The original full showreel and source media are retained.
- Responsive preview delivery chooses 960px or 1280px according to rendered size and pixel density. Preview duration and 30fps playback stay unchanged; decorative artwork has responsive image variants. Videos pause behind an open menu.

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

Run `python scripts/optimize_delivery.py` afterwards to compress preview delivery and generate the responsive variants. It checks duration, frame rate and streaming metadata; original media stays in place.

## Validation

Checked in Chromium at 320, 360, 390, 430, 768, 1024, 1100, 1280 and 1920px widths, plus a compact 1110px desktop and 844×390 landscape. Checks cover page overflow, mobile submenus, section navigation, reversible process scrubbing on phones and desktops, cursor tracking, service hover effects, accordions, video play/pause, full-screen modal sizing through orientation changes, Escape/close, focus restoration and console errors. The article carousel was also checked on both sides of its 560px breakpoint, and the menu trigger's position was compared before and after opening. Viewport checks do not replace testing on physical devices.

Branding and media are retained for this educational recreation. See [third-party notices](THIRD_PARTY.md).
