// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Initialize Locomotive Scroll
const scroll = new LocomotiveScroll({
    el: document.querySelector('[data-scroll-container]'),
    smooth: true
});

// Update ScrollTrigger on Locomotive Scroll update
scroll.on("scroll", ScrollTrigger.update);

// ScrollTrigger proxy for Locomotive Scroll
ScrollTrigger.scrollerProxy("[data-scroll-container]", {
    scrollTop(value) {
        return arguments.length ? scroll.scrollTo(value, 0, 0) : scroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
    pinType: document.querySelector("[data-scroll-container]").style.transform ? "transform" : "fixed"
});

// Refresh ScrollTrigger after Locomotive Scroll initialization
ScrollTrigger.addEventListener("refresh", () => scroll.update());
ScrollTrigger.refresh();




function page1LoadingAnimation() {

    let tl = gsap.timeline();

    tl.from(".page-1", {
        opacity: 0,
        duration: 0.3,
        delay: 0.2
    })


    tl.from(".page-1", {
        transform: "scaleX(0.7) scaleY(0)",
        borderRadius: "100px",
        duration: 1,
        ease: "expo.out"
    })

    tl.from("nav", {
        opacity: 0,
        onComplete: function () {
            document.querySelector("nav").style.opacity = 1;
        }
    });

    tl.from(".page-1 p, .page-1 h1 ", {
        opacity: 0,
        duration: 0.3,
        stagger: 0.2
    })
}

page1LoadingAnimation()


// nav hover effect
function navHoverEffect() {
    const midNavElems = document.querySelectorAll(".mid-nav-elem");
    const navBottom = document.querySelector(".nav-bottom");
    const midNavh5 = document.querySelectorAll(".mid-nav-elem h5");
    const midNavh5ASpan = document.querySelectorAll(".mid-nav-elem h5 a span");

    let activeTimeline;

    function handleMouseEnter() {
        if (activeTimeline) {
            activeTimeline.kill();
        }

        activeTimeline = gsap.timeline({ onComplete: () => activeTimeline = null });

        activeTimeline.to(navBottom, {
            height: "160px",
            duration: 0.4
        });

        activeTimeline.set(midNavh5, {
            display: "block"
        });

        activeTimeline.set(midNavElems, {
            zIndex: 8
        });

        activeTimeline.fromTo(midNavh5ASpan,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.1, stagger: 0.05 }
        );
    }

    function handleMouseLeave() {
        if (activeTimeline) {
            activeTimeline.kill();
        }

        activeTimeline = gsap.timeline({ onComplete: () => activeTimeline = null });

        activeTimeline.to(midNavh5ASpan, {
            y: 20,
            opacity: 0,
            duration: 0.15,
            stagger: 0.03
        });

        activeTimeline.set(midNavh5, {
            display: "none"
        });

        activeTimeline.to(navBottom, {
            height: 0,
            duration: 0.15,
        });
    }

    midNavElems.forEach(elem => {
        elem.addEventListener("mouseenter", handleMouseEnter);
        elem.addEventListener("mouseleave", handleMouseLeave);
    });
};

navHoverEffect();


// Video button click function
function videoButtonClick() {
    let buttonClick = document.querySelector(".video button");
    let video = document.querySelector(".video video");
    let buttonDiv = document.querySelector(".video .button-div");

    buttonClick.addEventListener("click", function () {
        video.style.width = "100vw";
        video.style.height = "100vh";
        buttonDiv.style.display = "none";
        togglePlayPause();
    });

    video.addEventListener("click", togglePlayPause);

    function togglePlayPause() {
        if (video.paused) {
            video.play();
            buttonDiv.style.display = "none";
        } else {
            video.pause();
            buttonDiv.style.display = "block";
            video.style.height = "80%";
            video.style.width = "87%";
        }

        video.muted = false;
    }
}

videoButtonClick();


// moving circle animation
function CircleAnimation() {
    let movingElem = document.querySelectorAll(".p8-elem-r-box");

    movingElem.forEach(function (elemMoving) {
        let circle = elemMoving.querySelector(".moving-circle");

        elemMoving.addEventListener("mouseenter", function () {

            gsap.to(circle, {
                opacity: 1,
                scale: 1,
                duration: 0.3 // Adjust duration as needed

            })
        });

        elemMoving.addEventListener("mouseleave", function () {

            gsap.to(circle, {
                opacity: 0,
                scale: 0,
                duration: 0.3 // Adjust duration as needed

            })
        });

        elemMoving.addEventListener("mousemove", function (dets) {

            gsap.to(circle, {
                x: dets.x - elemMoving.getBoundingClientRect().x - 500,
                y: dets.y - elemMoving.getBoundingClientRect().y - 40,
                duration: 0.1 // Adjust duration as needed

            })
        });
    });
}

CircleAnimation()

// video autoplay function
function videoAutoplay() {
    let video = document.querySelectorAll(".p9-elem-right video")

    video.forEach(function (elem) {
        elem.addEventListener("mouseenter", function () {
            elem.play()
        })

        elem.addEventListener("mouseleave", function () {
            elem.pause()
        })
    })
}

videoAutoplay()

// Your GSAP animation with ScrollTrigger
function p11ElementMove() {
    gsap.from(".p11-elem-p p", {
        x: 0,
        duration: 1,
        scrollTrigger: {
            trigger: ".p11-elem-p",
            scroller: "[data-scroll-container]",
            // markers: true,
            start: "top 80%",
            end: "top 10%",
            scrub: true
        }
    });
}

p11ElementMove()



