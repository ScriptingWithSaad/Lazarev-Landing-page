/* Native scrolling is the baseline. Motion and media enhance visible content. */
(() => {
  "use strict";
  document.documentElement.classList.add("js");
  const nav = document.querySelector("nav");
  const main = document.querySelector("main");
  const menu = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".mid-nav");
  const groups = [...document.querySelectorAll(".mid-nav-elem")];
  const mobile = matchMedia(
    "(max-width: 1100px), (hover: none), (pointer: coarse)",
  );
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const saveData = navigator.connection?.saveData;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const canAnimate = !!(gsap && ScrollTrigger);
  let lenis;
  let navMotion;
  let dropdownWanted = false;
  let introPlayed = false;
  let refreshTimer;
  let scrollRefreshUntil = 0;
  let gestureUntil = 0;
  let layoutWidth = innerWidth;
  let layoutHeight = innerHeight;
  let menuCloseTimer;
  const refresh = () => {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      // ScrollTrigger refresh briefly restores scroll positions; let navigation finish first.
      if (performance.now() < Math.max(scrollRefreshUntil, gestureUntil)) {
        refresh();
        return;
      }
      lenis?.resize();
      if (canAnimate) ScrollTrigger.refresh();
    }, 200);
  };
  function layoutResize() {
    const width = innerWidth;
    const height = innerHeight;
    const heightChange = Math.abs(height - layoutHeight);
    if (
      width === layoutWidth &&
      (heightChange === 0 ||
        (mobile.matches && heightChange < layoutHeight * 0.25))
    )
      return;
    layoutWidth = width;
    layoutHeight = height;
    refresh();
  }
  if (canAnimate) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({
      ignoreMobileResize: true,
      autoRefreshEvents: "DOMContentLoaded,load",
    });
  }

  function dropdown(open) {
    dropdownWanted = open && !mobile.matches;
    if (navMotion) {
      if (dropdownWanted) {
        nav.classList.add("dropdown-open");
        navMotion.timeScale(1).play();
      } else {
        navMotion.timeScale(1.8).reverse();
      }
    } else {
      nav.classList.toggle("dropdown-open", dropdownWanted);
    }
    groups.forEach((group) => {
      const submenu = group.querySelector(".submenu");
      if (submenu)
        submenu.inert = mobile.matches
          ? !group.classList.contains("expanded")
          : !dropdownWanted;
    });
  }
  function resetMenuGroups() {
    groups.forEach((group) => {
      group.classList.remove("expanded");
      group
        .querySelector(".submenu-toggle")
        ?.setAttribute("aria-expanded", "false");
    });
    dropdown(false);
  }
  function closeMenu(restoreFocus = false) {
    const wasOpen = nav.classList.contains("menu-open");
    if (!wasOpen) {
      if (dropdownWanted) dropdown(false);
      return;
    }
    clearTimeout(menuCloseTimer);
    nav.classList.remove("menu-open");
    document.body.classList.remove("menu-active");
    menu.setAttribute("aria-expanded", "false");
    main.inert = false;
    navLinks.inert = mobile.matches;
    if (!dialog.open) lenis?.start();
    if (wasOpen && mobile.matches && !reduced.matches)
      menuCloseTimer = setTimeout(resetMenuGroups, 320);
    else resetMenuGroups();
    if (restoreFocus) menu.focus({ preventScroll: true });
    syncArticles();
    syncBackground();
    projects.forEach((state) => state.sync());
  }
  navLinks.inert = mobile.matches;
  menu.addEventListener("click", () => {
    if (nav.classList.contains("menu-open")) return closeMenu();
    clearTimeout(menuCloseTimer);
    nav.classList.add("menu-open");
    document.body.classList.add("menu-active");
    menu.setAttribute("aria-expanded", "true");
    main.inert = true;
    navLinks.inert = false;
    lenis?.stop();
    syncArticles();
    syncBackground();
    projects.forEach((state) => state.sync());
  });
  groups.forEach((group) => {
    const toggle = group.querySelector(".submenu-toggle");
    toggle?.addEventListener("click", () => {
      const open = group.classList.toggle("expanded");
      toggle.setAttribute("aria-expanded", String(open));
      group.querySelector(".submenu").inert = !open;
      if (canAnimate && !reduced.matches) {
        const labels = group.querySelectorAll(".submenu-item a span");
        gsap.killTweensOf(labels);
        if (open)
          gsap.fromTo(
            labels,
            { y: 12, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.22,
              stagger: 0.035,
              ease: "power2.out",
              clearProps: "transform,opacity",
            },
          );
        else gsap.set(labels, { clearProps: "transform,opacity" });
      }
    });
  });
  document
    .querySelector(".mid-nav")
    .addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "touch" && finePointer.matches) dropdown(true);
    });
  nav.addEventListener("pointerleave", () => {
    if (!nav.contains(document.activeElement)) dropdown(false);
  });
  nav.addEventListener("focusin", () => {
    if (!mobile.matches) dropdown(true);
  });
  nav.addEventListener("focusout", (event) => {
    if (!nav.contains(event.relatedTarget)) dropdown(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("menu-open"))
      closeMenu(true);
    else if (event.key === "Escape") dropdown(false);
    if (event.key !== "Tab" || !nav.classList.contains("menu-open")) return;
    const controls = [...nav.querySelectorAll("a,button")].filter(
      (element) =>
        element.getClientRects().length && !element.closest("[inert]"),
    );
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  document.addEventListener("pointerdown", (event) => {
    if (dialog.open) return;
    if (!nav.contains(event.target)) {
      if (nav.classList.contains("menu-open")) closeMenu();
      else if (dropdownWanted) dropdown(false);
    }
  });
  mobile.addEventListener("change", () => {
    closeMenu();
    resetMenuGroups();
    navLinks.inert = mobile.matches;
    refresh();
  });

  function revealTarget(target) {
    const detail = target.closest("details");
    if (detail && !detail.open) {
      detail.open = true;
      refresh();
    }
  }
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (
      !link ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const hash = link.getAttribute("href");
    const target = document.getElementById(hash.slice(1));
    if (!target) return;
    event.preventDefault();
    scrollRefreshUntil = performance.now() + 1200;
    const wasMenuOpen = nav.classList.contains("menu-open");
    closeMenu();
    revealTarget(target);
    history.pushState(null, "", hash);
    if (wasMenuOpen || link.classList.contains("skip-link")) {
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
    // Focus first, then scroll after a collapsed service has entered the layout.
    requestAnimationFrame(() => {
      if (lenis)
        // Lenis reads the same CSS scroll-padding as native scrolling.
        lenis.scrollTo(target, { duration: 0.8 });
      else
        target.scrollIntoView({
          behavior: reduced.matches ? "instant" : "smooth",
          block: "start",
        });
    });
  });
  function restoreHash() {
    const target = document.getElementById(location.hash.slice(1));
    if (target) revealTarget(target);
  }
  restoreHash();
  addEventListener("hashchange", restoreHash);

  // One mobile card at a time, with no horizontal scrolling container.
  const articleHighlights = document.querySelector(".article-highlights");
  const articleLinks = [
    ...articleHighlights.querySelectorAll(".page-1-elem > a"),
  ];
  const articleControls = articleHighlights.querySelector(".article-controls");
  const articlePosition = articleHighlights.querySelector(".article-position");
  const articlePause = articleHighlights.querySelector(".article-pause");
  const phoneArticles = matchMedia("(max-width: 560px)");
  let articleIndex = 0;
  let articleTimer;
  let articleVisible = false;
  let articlePaused = reduced.matches;
  function showArticle(index) {
    articleIndex = (index + articleLinks.length) % articleLinks.length;
    articleLinks.forEach((link, position) => {
      const current = position === articleIndex;
      link.classList.toggle("article-current", current);
      link.inert = !current;
      link.setAttribute("aria-hidden", String(!current));
    });
    articlePosition.textContent = `${articleIndex + 1} / ${articleLinks.length}`;
  }
  function syncArticles() {
    clearTimeout(articleTimer);
    articlePause.setAttribute(
      "aria-label",
      articlePaused ? "Play article rotation" : "Pause article rotation",
    );
    articlePause
      .querySelector("path")
      .setAttribute("d", articlePaused ? "m9 6 9 6-9 6Z" : "M9 6v12M15 6v12");
    if (
      !phoneArticles.matches ||
      articlePaused ||
      !articleVisible ||
      document.hidden ||
      nav.classList.contains("menu-open") ||
      document.body.classList.contains("reel-locked")
    )
      return;
    articleTimer = setTimeout(() => {
      showArticle(articleIndex + 1);
      syncArticles();
    }, 4000);
  }
  function configureArticles() {
    articleHighlights.classList.toggle(
      "article-carousel",
      phoneArticles.matches,
    );
    articleControls.hidden = !phoneArticles.matches;
    if (phoneArticles.matches) showArticle(articleIndex);
    else
      articleLinks.forEach((link) => {
        link.classList.remove("article-current");
        link.inert = false;
        link.removeAttribute("aria-hidden");
      });
    syncArticles();
    refresh();
  }
  articlePause.addEventListener("click", () => {
    articlePaused = !articlePaused;
    syncArticles();
  });
  articleHighlights
    .querySelector(".article-previous")
    .addEventListener("click", () => {
      articlePaused = true;
      showArticle(articleIndex - 1);
      syncArticles();
    });
  articleHighlights
    .querySelector(".article-next")
    .addEventListener("click", () => {
      articlePaused = true;
      showArticle(articleIndex + 1);
      syncArticles();
    });
  articleHighlights.addEventListener("focusin", (event) => {
    if (phoneArticles.matches && event.target.closest(".page-1-elem")) {
      articlePaused = true;
      syncArticles();
    }
  });
  phoneArticles.addEventListener("change", configureArticles);
  reduced.addEventListener("change", () => {
    if (reduced.matches) articlePaused = true;
    syncArticles();
  });
  document.addEventListener("visibilitychange", syncArticles);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        articleVisible = entries[0].isIntersecting;
        syncArticles();
      },
      { threshold: 0.5 },
    ).observe(articleHighlights);
  } else articleVisible = true;
  configureArticles();

  const background = document.querySelector(".video > video");
  const projects = [...document.querySelectorAll(".p9-elem-right")].map(
    (container) => ({
      container,
      video: container.querySelector("video"),
      button: container.querySelector(".preview-toggle"),
      userPlaying: false,
      hovered: false,
      visible: false,
      request: 0,
    }),
  );
  let backgroundVisible = false;
  function attachSource(video) {
    if (!video.getAttribute("src")) {
      const pixels =
        (video.clientWidth || innerWidth) * (devicePixelRatio || 1);
      video.src =
        video.dataset.srcCompact && (pixels <= 960 || saveData)
          ? video.dataset.srcCompact
          : video.dataset.src;
      video.load();
    }
  }
  function syncBackground() {
    if (
      !backgroundVisible ||
      reduced.matches ||
      saveData ||
      document.hidden ||
      nav.classList.contains("menu-open") ||
      dialog.open
    ) {
      background.pause();
      return;
    }
    attachSource(background);
    background
      .play()
      .then(() => {
        if (
          !backgroundVisible ||
          reduced.matches ||
          saveData ||
          document.hidden ||
          nav.classList.contains("menu-open") ||
          dialog.open
        )
          background.pause();
      })
      .catch(() => {});
  }
  projects.forEach((state) => {
    const label = document.createElement("span");
    label.className = "preview-label";
    const icon = state.button.querySelector("svg");
    state.button.replaceChildren(label, icon);
    const name = state.video.getAttribute("aria-label").replace(" preview", "");
    const updateButton = () => {
      const playing = !state.video.paused;
      label.textContent = playing ? "Pause preview" : "Play preview";
      state.button.setAttribute(
        "aria-label",
        `${playing ? "Pause" : "Play"} ${name} preview`,
      );
      state.button.setAttribute("aria-pressed", String(playing));
    };
    state.sync = () => {
      const request = ++state.request;
      const shouldPlay =
        state.visible &&
        !document.hidden &&
        !nav.classList.contains("menu-open") &&
        !dialog.open &&
        (state.userPlaying ||
          (state.hovered &&
            finePointer.matches &&
            !reduced.matches &&
            !saveData));
      if (!shouldPlay) {
        state.video.pause();
        updateButton();
        return;
      }
      attachSource(state.video);
      state.video
        .play()
        .then(() => {
          const wanted =
            state.visible &&
            !document.hidden &&
            !nav.classList.contains("menu-open") &&
            !dialog.open &&
            (state.userPlaying ||
              (state.hovered &&
                finePointer.matches &&
                !reduced.matches &&
                !saveData));
          if (!wanted) state.video.pause();
          updateButton();
        })
        .catch(() => {
          if (request === state.request) state.userPlaying = false;
          updateButton();
        });
    };
    state.container.addEventListener("pointerenter", (event) => {
      state.hovered = event.pointerType !== "touch";
      state.sync();
    });
    state.container.addEventListener("pointerleave", () => {
      state.hovered = false;
      state.sync();
    });
    state.button.addEventListener("click", () => {
      state.userPlaying = state.video.paused;
      state.hovered = false;
      state.sync();
    });
    state.video.addEventListener("play", updateButton);
    state.video.addEventListener("pause", updateButton);
    updateButton();
  });

  const dialog = document.querySelector("#reel-dialog");
  const fullReel = document.querySelector("#full-reel");
  const watch = document.querySelector(".button-div button");
  const reelStatus = document.querySelector("#reel-status");
  let lockedY = 0;
  let opener;
  let reelClosing = false;
  function clearReelMotion() {
    if (gsap) {
      gsap.killTweensOf(dialog);
      gsap.set(dialog, { clearProps: "transform,transformOrigin,opacity" });
    }
    if (!dialog.open) dialog.classList.remove("motion-reel");
  }
  function finishReelClose() {
    clearReelMotion();
    dialog.close();
  }
  function closeReel() {
    if (!dialog.open || reelClosing) return;
    reelClosing = true;
    fullReel.pause();
    if (!canAnimate || reduced.matches) return finishReelClose();
    gsap.killTweensOf(dialog);
    gsap.set(dialog, { clearProps: "transform,transformOrigin,opacity" });
    const target = document.querySelector(".video").getBoundingClientRect();
    const player = dialog.getBoundingClientRect();
    const targetVisible = target.bottom > 0 && target.top < innerHeight;
    dialog.classList.add("motion-reel");
    gsap.to(dialog, {
      x: targetVisible ? target.left - player.left : 0,
      y: targetVisible ? target.top - player.top : 0,
      scaleX: targetVisible ? target.width / player.width : 0.96,
      scaleY: targetVisible ? target.height / player.height : 0.96,
      transformOrigin: "0 0",
      opacity: 0,
      duration: 0.35,
      ease: "power2.inOut",
      onComplete: finishReelClose,
    });
  }
  function syncDialogViewport() {
    if (!dialog.open) return;
    const viewport = window.visualViewport;
    const top = `${viewport?.offsetTop || 0}px`;
    const width = `${viewport?.width || innerWidth}px`;
    const height = `${viewport?.height || innerHeight}px`;
    // Scroll-lock events can fire without a viewport change; keep the expansion running.
    if (
      dialog.style.getPropertyValue("--dialog-top") === top &&
      dialog.style.getPropertyValue("--dialog-width") === width &&
      dialog.style.getPropertyValue("--dialog-height") === height
    )
      return;
    if (reelClosing) return finishReelClose();
    clearReelMotion();
    dialog.style.setProperty("--dialog-top", top);
    dialog.style.setProperty("--dialog-width", width);
    dialog.style.setProperty("--dialog-height", height);
  }
  watch.addEventListener("click", () => {
    if (typeof dialog.showModal !== "function") {
      location.href = fullReel.dataset.src;
      return;
    }
    closeMenu();
    const thumbnail = document.querySelector(".video").getBoundingClientRect();
    opener = document.activeElement;
    lockedY = scrollY;
    lenis?.stop();
    document.body.style.setProperty("--locked-y", `${-lockedY}px`);
    document.body.classList.add("reel-locked");
    dialog.showModal();
    nav.inert = true;
    main.inert = true;
    syncArticles();
    syncDialogViewport();
    if (canAnimate && !reduced.matches) {
      const player = dialog.getBoundingClientRect();
      dialog.classList.add("motion-reel");
      gsap.fromTo(
        dialog,
        {
          x: thumbnail.left - player.left,
          y: thumbnail.top - player.top,
          scaleX: thumbnail.width / player.width,
          scaleY: thumbnail.height / player.height,
          transformOrigin: "0 0",
          opacity: 0.4,
        },
        {
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          duration: 0.55,
          ease: "power3.inOut",
          onComplete: clearReelMotion,
        },
      );
    }
    syncBackground();
    projects.forEach((state) => state.sync());
    reelStatus.textContent = "Loading showreel…";
    attachSource(fullReel);
    fullReel.play().catch(() => {
      if (dialog.open)
        reelStatus.textContent = "Press play in the video player to start.";
    });
  });
  document.querySelector(".reel-close").addEventListener("click", closeReel);
  dialog.addEventListener("click", (event) => {
    // Only the backdrop is a close target; whitespace inside the player is not.
    const rect = dialog.getBoundingClientRect();
    if (
      event.target === dialog &&
      (event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom)
    )
      closeReel();
  });
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeReel();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dialog.open) {
      event.preventDefault();
      closeReel();
    }
  });
  dialog.addEventListener("close", () => {
    clearReelMotion();
    reelClosing = false;
    fullReel.pause();
    fullReel.removeAttribute("src");
    fullReel.load();
    document.body.classList.remove("reel-locked");
    document.body.style.removeProperty("--locked-y");
    nav.inert = false;
    main.inert = false;
    syncArticles();
    const html = document.documentElement;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, lockedY);
    lenis?.start();
    if (lenis) lenis.scrollTo(lockedY, { immediate: true, force: true });
    requestAnimationFrame(() => html.style.removeProperty("scroll-behavior"));
    opener?.focus({ preventScroll: true });
    syncBackground();
    projects.forEach((state) => state.sync());
  });
  fullReel.addEventListener("playing", () => {
    reelStatus.textContent = "";
  });
  fullReel.addEventListener("error", () => {
    if (dialog.open)
      reelStatus.textContent =
        "The video could not load. Close the player and try again.";
  });
  addEventListener("resize", syncDialogViewport, { passive: true });
  window.visualViewport?.addEventListener("resize", syncDialogViewport, {
    passive: true,
  });
  window.visualViewport?.addEventListener("scroll", syncDialogViewport, {
    passive: true,
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === background) {
            backgroundVisible = entry.isIntersecting;
            document
              .querySelector(".video")
              .classList.toggle("reel-in-view", backgroundVisible);
            syncBackground();
          } else {
            const state = projects.find((item) => item.video === entry.target);
            state.visible = entry.isIntersecting;
            if (!state.visible) {
              state.userPlaying = false;
              state.hovered = false;
            }
            state.sync();
          }
        });
      },
      { threshold: 0.12 },
    );
    observer.observe(background);
    projects.forEach((state) => observer.observe(state.video));
  } else {
    projects.forEach((state) => (state.visible = true));
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) fullReel.pause();
    syncBackground();
    projects.forEach((state) => state.sync());
  });
  reduced.addEventListener("change", () => {
    if (dialog.open) {
      if (reelClosing) finishReelClose();
      else clearReelMotion();
    }
    syncBackground();
    projects.forEach((state) => state.sync());
  });
  finePointer.addEventListener("change", () =>
    projects.forEach((state) => {
      state.hovered = false;
      state.sync();
    }),
  );

  // One ticker controls desktop smoothing and scroll-linked animations.
  if (canAnimate) {
    const media = gsap.matchMedia();
    media.add(
      "(min-width: 1101px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
      () => {
        if (!window.Lenis) return;
        lenis = new window.Lenis({
          lerp: 0.13,
          smoothWheel: true,
          syncTouch: false,
          autoRaf: false,
        });
        const tick = (time) => lenis?.raf(time * 1000);
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
        if (dialog.open || nav.classList.contains("menu-open")) lenis.stop();
        document.documentElement.classList.add("desktop-smooth");
        return () => {
          gsap.ticker.remove(tick);
          lenis.destroy();
          lenis = undefined;
          document.documentElement.classList.remove("desktop-smooth");
        };
      },
    );
    media.add("(prefers-reduced-motion: no-preference)", () => {
      // Restore the original unfolding hero, then reveal the navigation and copy.
      // Play once at the top; resizing or following a deep link must not replay it.
      if (!introPlayed) {
        introPlayed = true;
        if (
          scrollY < 80 &&
          (!location.hash || ["#home", "#main"].includes(location.hash))
        ) {
          gsap
            .timeline({ id: "hero-opening" })
            .from(".page-1", {
              scaleX: 0.7,
              scaleY: 0,
              opacity: 0,
              borderRadius: 100,
              transformOrigin: "50% 50%",
              duration: 1,
              ease: "expo.out",
              clearProps: "transform,transformOrigin,opacity,borderRadius",
            })
            .from(
              nav,
              {
                opacity: 0,
                y: -10,
                duration: 0.35,
                clearProps: "opacity,transform",
              },
              0.2,
            )
            .from(
              ".page-1 h1, .page-1 p",
              {
                y: 16,
                opacity: 0,
                duration: 0.4,
                stagger: 0.08,
                ease: "power2.out",
                clearProps: "transform,opacity",
              },
              0.6,
            );
        }
      }
      const revealItems = gsap.utils.toArray(
        ".p3-elem-box, .p6-elem-box, .p9-elem-left",
      );
      ScrollTrigger.batch(revealItems, {
        start: "top 95%",
        once: true,
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { y: 18, opacity: 0.3 },
            {
              y: 0,
              opacity: 1,
              duration: 0.55,
              stagger: 0.06,
              ease: "power2.out",
              clearProps: "all",
            },
          ),
      });
      refresh();
      // Each process column goes from straight rows to the original 1vw staircase.
      // A single timeline per column scrubs both directions on phones and desktops.
      document.querySelectorAll(".p11-elem-p").forEach((list, column) => {
        const bars = [...list.children];
        let offsets;
        const measureOffsets = () => {
          const width = list.clientWidth;
          const step = innerWidth / 100;
          offsets = bars.map((bar, index) =>
            Math.min(index * step, 72, Math.max(0, width - bar.offsetWidth)),
          );
        };
        measureOffsets();
        gsap
          .timeline({
            scrollTrigger: {
              id: `process-column-${column + 1}`,
              trigger: list,
              start: "top 80%",
              end: "top 10%",
              scrub: true,
              invalidateOnRefresh: true,
              onRefreshInit: measureOffsets,
            },
          })
          .fromTo(
            bars,
            { x: 0 },
            {
              x: (index) => offsets[index],
              duration: 1,
              ease: "none",
            },
          );
      });
    });
    media.add(
      "(min-width: 801px) and (prefers-reduced-motion: no-preference)",
      () => {
        gsap.to(".p5-bg-img img", {
          yPercent: 14,
          ease: "none",
          scrollTrigger: {
            trigger: ".page-5",
            start: "top bottom",
            end: "bottom top",
            scrub: 0.18,
          },
        });
      },
    );
    media.add(
      "(min-width: 1101px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
      () => {
        const panel = nav.querySelector(".nav-bottom");
        const links = nav.querySelectorAll(".submenu-item a span");
        nav.classList.add("motion-nav");
        navMotion = gsap
          .timeline({
            paused: true,
            onReverseComplete: () => {
              if (!dropdownWanted) nav.classList.remove("dropdown-open");
            },
          })
          .fromTo(
            panel,
            { scaleY: 0, opacity: 0 },
            {
              scaleY: 1,
              opacity: 1,
              duration: 0.32,
              ease: "power3.out",
            },
          )
          .fromTo(
            links,
            { y: 20, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.22,
              stagger: 0.025,
              ease: "power2.out",
            },
            0.15,
          );
        if (dropdownWanted) navMotion.progress(1);
        return () => {
          navMotion.kill();
          navMotion = undefined;
          nav.classList.remove("motion-nav", "dropdown-open");
          gsap.set([panel, ...links], { clearProps: "transform,opacity" });
        };
      },
    );
    media.add(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
      () => {
        const cleanups = [];
        document.querySelectorAll(".p8-elem-r-box").forEach((row) => {
          const circle = row.querySelector(".moving-circle");
          if (!circle) return;
          gsap.set(circle, { xPercent: -50, yPercent: -50 });
          const xTo = gsap.quickTo(circle, "x", {
            duration: 0.14,
            ease: "power3.out",
          });
          const yTo = gsap.quickTo(circle, "y", {
            duration: 0.14,
            ease: "power3.out",
          });
          let hovered = false;
          let bounds;
          let radius;
          let pointer;
          let pointerFrame = 0;
          const measure = () => {
            bounds = row.getBoundingClientRect();
            radius = circle.offsetWidth / 2;
          };
          const invalidate = () => {
            bounds = undefined;
          };
          const move = (event) => {
            pointer = { x: event.clientX, y: event.clientY };
            if (pointerFrame) return;
            pointerFrame = requestAnimationFrame(() => {
              pointerFrame = 0;
              if (!bounds) measure();
              xTo(
                Math.max(
                  radius,
                  Math.min(pointer.x - bounds.left, bounds.width - radius),
                ),
              );
              yTo(
                Math.max(
                  radius,
                  Math.min(pointer.y - bounds.top, bounds.height - radius),
                ),
              );
            });
          };
          const enter = (event) => {
            hovered = true;
            measure();
            move(event);
            gsap.to(circle, {
              opacity: 1,
              scale: 1,
              duration: 0.2,
              overwrite: "auto",
            });
          };
          const hide = () =>
            gsap.to(circle, {
              opacity: 0,
              scale: 0,
              duration: 0.2,
              overwrite: "auto",
            });
          const leave = () => {
            hovered = false;
            if (!row.contains(document.activeElement)) hide();
          };
          const focus = () => {
            measure();
            move({
              clientX: bounds.left + bounds.width / 2,
              clientY: bounds.top + bounds.height / 2,
            });
            gsap.to(circle, {
              opacity: 1,
              scale: 1,
              duration: 0.2,
              overwrite: "auto",
            });
          };
          const blur = () => {
            if (!hovered) hide();
          };
          row.addEventListener("pointerenter", enter);
          row.addEventListener("pointermove", move);
          row.addEventListener("pointerleave", leave);
          row.addEventListener("focusin", focus);
          row.addEventListener("focusout", blur);
          addEventListener("scroll", invalidate, { passive: true });
          addEventListener("resize", invalidate, { passive: true });
          cleanups.push(() => {
            row.removeEventListener("pointerenter", enter);
            row.removeEventListener("pointermove", move);
            row.removeEventListener("pointerleave", leave);
            row.removeEventListener("focusin", focus);
            row.removeEventListener("focusout", blur);
            removeEventListener("scroll", invalidate);
            removeEventListener("resize", invalidate);
            cancelAnimationFrame(pointerFrame);
            gsap.killTweensOf(circle);
            gsap.set(circle, { clearProps: "all" });
          });
        });
        return () => cleanups.forEach((cleanup) => cleanup());
      },
    );
  }

  document.querySelectorAll("details").forEach((detail) => {
    const summary = detail.querySelector("summary");
    const content = detail.querySelector(".service-items");
    let animation;
    let intendedOpen = detail.open;
    summary.addEventListener("click", (event) => {
      if (!canAnimate || reduced.matches || !content) return;
      event.preventDefault();
      intendedOpen = !intendedOpen;
      animation?.kill();
      const current = detail.open ? content.getBoundingClientRect().height : 0;
      detail.open = true;
      content.inert = !intendedOpen;
      gsap.set(content, { height: current, opacity: current ? 1 : 0 });
      animation = gsap.to(content, {
        height: intendedOpen ? content.scrollHeight : 0,
        opacity: intendedOpen ? 1 : 0,
        duration: 0.3,
        ease: "power2.inOut",
        onComplete: () => {
          detail.open = intendedOpen;
          content.inert = false;
          gsap.set(content, { clearProps: "height,opacity" });
          refresh();
        },
      });
    });
    detail.addEventListener("toggle", () => {
      if (!animation?.isActive()) intendedOpen = detail.open;
      refresh();
    });
    reduced.addEventListener("change", () => {
      animation?.kill();
      detail.open = intendedOpen;
      content.inert = false;
      if (gsap) gsap.set(content, { clearProps: "height,opacity" });
      refresh();
    });
  });
  document.fonts?.ready.then(refresh);
  // Intrinsic image sizes reserve layout before lazy decoding; no refresh is needed.
  addEventListener(
    "scroll",
    () => {
      gestureUntil = performance.now() + 200;
    },
    { passive: true },
  );
  addEventListener("resize", layoutResize, { passive: true });
  addEventListener("pageshow", refresh);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) layoutResize();
  });
})();
