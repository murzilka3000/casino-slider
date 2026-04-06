gsap.registerPlugin(ScrollTrigger);

const slides = gsap.utils.toArray(".large-slide");
const track = document.querySelector(".large-slides-track");
const section = document.querySelector(".pinned-section");

if (slides.length > 0) {
  let mm = gsap.matchMedia();

  mm.add(
    {
      isDesktop: "(min-width: 901px)",
      isMobile: "(max-width: 900px)",
    },
    (context) => {
      let { isDesktop } = context.conditions;

      const getDesktopState = (index, currentIndex) => {
        const diff = index - currentIndex;
        if (diff === 0) {
          return {
            x: 0,
            y: 0,
            xPercent: 0,
            scale: 1,
            opacity: 1,
            zIndex: 10,
            autoAlpha: 1,
          };
        } else if (diff === 1) {
          return {
            x: 0,
            y: 0,
            xPercent: 40,
            scale: 0.85,
            opacity: 0.4,
            zIndex: 5,
            autoAlpha: 1,
          };
        } else if (diff === -1) {
          return {
            x: 0,
            y: 0,
            xPercent: -40,
            scale: 0.85,
            opacity: 0.4,
            zIndex: 5,
            autoAlpha: 1,
          };
        } else if (diff > 1) {
          return {
            x: 0,
            y: 0,
            xPercent: 110,
            scale: 0.5,
            opacity: 0,
            zIndex: 1,
            autoAlpha: 0,
          };
        } else {
          return {
            x: 0,
            y: 0,
            xPercent: -110,
            scale: 0.5,
            opacity: 0,
            zIndex: 1,
            autoAlpha: 0,
          };
        }
      };

      const getMobileState = (index, currentIndex) => {
        const diff = index - currentIndex;
        if (diff === 0) {
          return {
            x: 0,
            y: 0,
            xPercent: 0,
            scale: 1,
            opacity: 1,
            zIndex: 10,
            autoAlpha: 1,
          };
        } else if (diff > 0) {
          return {
            x: diff * 20,
            y: diff * 20,
            xPercent: 0,
            scale: 1 - diff * 0.05,
            opacity: 1,
            zIndex: 10 - diff,
            autoAlpha: diff > 2 ? 0 : 1,
          };
        } else {
          return {
            x: -150,
            y: 0,
            xPercent: 0,
            scale: 0.8,
            opacity: 0,
            zIndex: 1,
            autoAlpha: 0,
          };
        }
      };

      if (isDesktop) {
        let totalTransitions = 0;
        slides.forEach((slide, index) => {
          const cardsCount = slide.querySelectorAll(".bonus-card").length;
          totalTransitions += Math.max(0, cardsCount - 1);
          if (index < slides.length - 1) {
            totalTransitions += 1;
          }
        });

        totalTransitions = Math.max(1, totalTransitions);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".pinned-section",
            pin: true,
            scrub: 1,
            start: "top top",
            end: () => `+=${totalTransitions * 100}%`,
            snap: {
              snapTo: "labels",
              duration: { min: 0.2, max: 0.5 },
              delay: 0.1,
              ease: "power1.inOut",
            },
          },
        });

        tl.addLabel("start");

        slides.forEach((slide, slideIndex) => {
          const cards = slide.querySelectorAll(".bonus-card");

          cards.forEach((card, i) => {
            gsap.set(card, { clearProps: "all" });
            gsap.set(card, getDesktopState(i, 0));
          });

          for (let step = 1; step < cards.length; step++) {
            let stepLabel = `s${slideIndex}_c${step}`;
            tl.addLabel(stepLabel);

            cards.forEach((card, i) => {
              tl.to(
                card,
                {
                  ...getDesktopState(i, step),
                  duration: 1,
                  ease: "power2.inOut",
                },
                stepLabel,
              );
            });
          }

          if (slideIndex < slides.length - 1) {
            let moveLabel = `move_s${slideIndex + 1}`;
            tl.addLabel(moveLabel);

            tl.to(
              slides,
              {
                xPercent: -100 * (slideIndex + 1),
                duration: 1.5,
                ease: "power2.inOut",
              },
              moveLabel,
            );
          }
        });

        return () => {};
      } else {
        let currentSlide = 0;
        let currentCard = 0;
        let isAnimating = false;
        let startX = 0;
        let startY = 0;
        let startTarget = null;

        slides.forEach((slide, sIdx) => {
          const cards = slide.querySelectorAll(".bonus-card");
          cards.forEach((card, cIdx) => {
            gsap.set(card, { clearProps: "all" });
            gsap.set(card, getMobileState(cIdx, 0));
          });
        });

        gsap.set(track, { clearProps: "xPercent" });

        const updateMobileView = () => {
          gsap.to(slides, {
            xPercent: -100 * currentSlide,
            duration: 0.5,
            ease: "power2.out",
          });

          slides.forEach((slide, sIdx) => {
            let activeCardIndex = sIdx === currentSlide ? currentCard : 0;
            const cards = slide.querySelectorAll(".bonus-card");

            cards.forEach((card, i) => {
              gsap.to(card, {
                ...getMobileState(i, activeCardIndex),
                duration: 0.5,
                ease: "power2.out",
              });
            });
          });
        };

        const onTouchStart = (e) => {
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
          startTarget = e.target;
        };

        const onTouchEnd = (e) => {
          if (isAnimating) return;
          let endX = e.changedTouches[0].clientX;
          let endY = e.changedTouches[0].clientY;
          let diffX = startX - endX;
          let diffY = startY - endY;

          if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            isAnimating = true;

            const isCardSwipe = startTarget.closest(".nested-slider");
            const cards = slides[currentSlide].querySelectorAll(".bonus-card");

            if (isCardSwipe) {
              if (diffX > 0) {
                if (currentCard < cards.length - 1) {
                  currentCard++;
                }
              } else {
                if (currentCard > 0) {
                  currentCard--;
                }
              }
            } else {
              if (diffX > 0) {
                if (currentSlide < slides.length - 1) {
                  currentSlide++;
                  currentCard = 0;
                }
              } else {
                if (currentSlide > 0) {
                  currentSlide--;
                  currentCard = 0;
                }
              }
            }

            updateMobileView();
            setTimeout(() => {
              isAnimating = false;
            }, 500);
          }
        };

        section.addEventListener("touchstart", onTouchStart);
        section.addEventListener("touchend", onTouchEnd);

        return () => {
          section.removeEventListener("touchstart", onTouchStart);
          section.removeEventListener("touchend", onTouchEnd);
          gsap.set(slides, { clearProps: "all" });
        };
      }
    },
  );
}
