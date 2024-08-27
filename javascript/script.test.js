// let navAnimation = function () {


//     var nav = document.querySelector("nav");
//     var navBottom = document.querySelector(".nav-bottom");
//     var spans = document.querySelectorAll(".mid-nav .mid-nav-elem h5");

//     nav.addEventListener("mouseenter", function () {
//         gsap.to(navBottom, {
//             height: "180%",
//             bottom: "-180%",
//             duration: 0.3,
//             ease: "expo.Out"
//         });

//         gsap.to(spans, {
//             display: "block",
//             y: 5,
//             delay: 0.4,
//             stagger: {
//                 amount: 0.7
//             }
//         });


//         nav.addEventListener("mouseleave", function () {
//             gsap.to(navBottom, {
//                 height: "0%",
//                 bottom: "0%",
//             });

//             gsap.to(spans, {
//                 display: "none",
//                 y: -20,
//             });
//         });
//     });
// }

// navAnimation();














// document.addEventListener("DOMContentLoaded", function () {
//     const midNavElems = document.querySelectorAll(".mid-nav-elem");
//     const navBottom = document.querySelector(".nav-bottom");
//     const midNavh5s = document.querySelectorAll(".mid-nav-elem h5");

//     function handleMouseEnter() {
//         const tl = gsap.timeline();

//         tl.to(navBottom, {
//             height: "160px",
//         })
//             .to(midNavh5s, {
//                 display: "block",
//             })
//             .to(midNavElems, {
//                 zIndex: 8,
//             })
//             .from(midNavh5s, {
//                 y: 15,
//                 stagger: {
//                     amount: 0.2
//                 },
//             });
//     }

//     function handleMouseLeave() {
//         const tl = gsap.timeline();

//         tl.to(navBottom, {
//             height: "0",
//             duration: 0.1
//         })

//         tl.to(midNavh5s, {
//             y: 25,
//             stagger: 0.1
//         });

//         tl.to(midNavh5s, {
//             display: "none",
//             duration: 0.2
//         })
//     }

//     midNavElems.forEach(elem => {
//         elem.addEventListener("mouseenter", handleMouseEnter);
//         elem.addEventListener("mouseleave", handleMouseLeave);
//     });

//     console.log("hello world");
// });