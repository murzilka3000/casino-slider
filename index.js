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
        let currentStep = 0;
        let isAnimating = false;
        let observer = null;

        const animateToStep = (newStep) => {
          if (
            isAnimating ||
            newStep < 0 ||
            newStep > totalSteps ||
            newStep === currentStep
          )
            return;

          isAnimating = true;
          currentStep = newStep;

          cards.forEach((card, cardIndex) => {
            const state = getCardState(cardIndex, currentStep);
            gsap.to(card, {
              ...state,
              duration: 0.5,
              ease: "power2.out",
              onComplete: () => {
                if (cardIndex === 0) isAnimating = false;
              },
            });
          });
        };

        ScrollTrigger.create({
          trigger: ".pinned-section",
          pin: true,
          start: "top top",
          end: "+=300%",
          onEnter: () => {
            // Активируем свайпы ТОЛЬКО когда секция запинилась
            if (!observer) {
              observer = Observer.create({
                target: ".pinned-section",
                type: "touch,pointer",
                onDown: () => !isAnimating && animateToStep(currentStep - 1),
                onUp: () => !isAnimating && animateToStep(currentStep + 1),
                tolerance: 10,
                preventDefault: true,
              });
            } else {
              observer.enable();
            }
          },
          onLeave: () => {
            // Деактивируем свайпы когда секция отпинилась
            if (observer) observer.disable();
          },
          onEnterBack: () => {
            if (observer) observer.enable();
          },
          onLeaveBack: () => {
            if (observer) observer.disable();
          },
        });
      }

      return () => {};
    },
  );
}
