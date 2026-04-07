gsap.registerPlugin(ScrollTrigger, Observer);

const slide = document.querySelector(".large-slide");

if (slide) {
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
            xPercent: 0,
            scale: 1,
            opacity: 1,
            zIndex: 10,
            autoAlpha: 1,
            rotateY: 0,
          };
        } else if (diff === 1) {
          return {
            xPercent: 40,
            scale: 0.85,
            opacity: 0.6,
            zIndex: 5,
            autoAlpha: 1,
            rotateY: -4,
          };
        } else if (diff === -1) {
          return {
            xPercent: -40,
            scale: 0.85,
            opacity: 0.6,
            zIndex: 5,
            autoAlpha: 1,
            rotateY: 4,
          };
        } else if (diff > 1) {
          return {
            xPercent: 110,
            scale: 0.6,
            opacity: 0,
            zIndex: 1,
            autoAlpha: 0,
            rotateY: -10,
          };
        } else {
          return {
            xPercent: -110,
            scale: 0.6,
            opacity: 0,
            zIndex: 1,
            autoAlpha: 0,
            rotateY: 10,
          };
        }
      };

      const getMobileState = (index, currentIndex) => {
        const diff = index - currentIndex;
        if (diff === 0) {
          return {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            zIndex: 10,
            autoAlpha: 1,
            rotateZ: 0,
          };
        } else if (diff > 0) {
          return {
            x: diff * 12,
            y: diff * 20,
            scale: 1 - diff * 0.05,
            opacity: 1 - diff * 0.05,
            zIndex: 10 - diff,
            autoAlpha: diff > 2 ? 0 : 1,
            rotateZ: diff * 2,
          };
        } else {
          return {
            x: -80,
            y: -500,
            scale: 0.85,
            opacity: 0,
            zIndex: 1,
            autoAlpha: 0,
            rotateZ: -10,
          };
        }
      };

      const getCardState = isDesktop ? getDesktopState : getMobileState;
      const cards = slide.querySelectorAll(".bonus-card");
      const totalSteps = cards.length - 1;

      cards.forEach((card, i) => {
        gsap.set(card, { clearProps: "all" });
        gsap.set(card, getCardState(i, 0));
      });

      if (isDesktop) {
        // DESKTOP - всё как было
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".pinned-section",
            pin: true,
            scrub: 1.5,
            start: "top top",
            end: () => `+=${totalSteps * 100}%`,
            snap: {
              snapTo: (progress) => {
                const step = Math.round(progress * totalSteps);
                return step / totalSteps;
              },
              duration: { min: 0.3, max: 0.6 },
              delay: 0.2,
              ease: "power2.inOut",
            },
          },
        });

        for (let step = 0; step <= totalSteps; step++) {
          cards.forEach((card, cardIndex) => {
            const state = getCardState(cardIndex, step);
            if (step > 0) {
              tl.to(
                card,
                { ...state, duration: 1, ease: "power2.inOut" },
                step - 1,
              );
            }
          });
        }
      } else {
        // MOBILE - новая логика
        let currentStep = 0;
        let isAnimating = false;
        let isScrollLocked = false;
        let observer = null;
        let scrollY = 0;

        const lockScroll = () => {
          scrollY = window.scrollY;
          document.body.style.overflow = "hidden";
          document.body.style.position = "fixed";
          document.body.style.top = `-${scrollY}px`;
          document.body.style.width = "100%";
          isScrollLocked = true;
        };

        const unlockScroll = () => {
          document.body.style.removeProperty("overflow");
          document.body.style.removeProperty("position");
          document.body.style.removeProperty("top");
          document.body.style.removeProperty("width");
          window.scrollTo(0, scrollY);
          isScrollLocked = false;
        };

        const animateToStep = (newStep) => {
          if (
            isAnimating ||
            newStep < 0 ||
            newStep > totalSteps ||
            newStep === currentStep
          ) {
            // Если пытаемся пролистать за последнюю карточку - разблокируем скролл
            if (newStep > totalSteps && isScrollLocked) {
              unlockScroll();
              if (observer) observer.disable();
            }
            return;
          }

          isAnimating = true;
          currentStep = newStep;

          cards.forEach((card, cardIndex) => {
            const state = getCardState(cardIndex, currentStep);
            gsap.to(card, {
              ...state,
              duration: 0.5,
              ease: "power2.out",
              onComplete: () => {
                if (cardIndex === 0) {
                  isAnimating = false;
                  // Если достигли последней карточки - разблокируем при следующем свайпе
                  if (currentStep === totalSteps) {
                    // Observer будет ждать следующий свайп для разблокировки
                  }
                }
              },
            });
          });
        };

        // Отслеживаем когда секция по центру экрана
        ScrollTrigger.create({
          trigger: ".pinned-section",
          start: "top center",
          end: "bottom center",
          onEnter: () => {
            lockScroll();
            if (!observer) {
              observer = Observer.create({
                target: window,
                type: "wheel,touch,pointer",
                onUp: () => {
                  if (!isAnimating) {
                    if (currentStep < totalSteps) {
                      animateToStep(currentStep + 1);
                    } else {
                      // На последней карточке, свайп вверх = разблокируем
                      unlockScroll();
                      if (observer) observer.disable();
                    }
                  }
                },
                onDown: () => {
                  if (!isAnimating) {
                    if (currentStep > 0) {
                      animateToStep(currentStep - 1);
                    } else {
                      // На первой карточке, свайп вниз = разблокируем
                      unlockScroll();
                      if (observer) observer.disable();
                    }
                  }
                },
                tolerance: 10,
                preventDefault: true,
              });
            } else {
              observer.enable();
            }
          },
          onLeaveBack: () => {
            if (isScrollLocked) {
              unlockScroll();
            }
            if (observer) observer.disable();
            // Сбрасываем на первую карточку
            currentStep = 0;
            cards.forEach((card, cardIndex) => {
              gsap.set(card, getCardState(cardIndex, 0));
            });
          },
        });
      }

      return () => {
        // Cleanup
        if (!isDesktop && isScrollLocked) {
          unlockScroll();
        }
      };
    },
  );
}
