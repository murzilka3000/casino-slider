gsap.registerPlugin(ScrollTrigger);

const slides = gsap.utils.toArray(".large-slide");

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
            x: -120,
            y: -50,
            scale: 0.8,
            opacity: 0,
            zIndex: 1,
            autoAlpha: 0,
            rotateZ: -12,
          };
        }
      };

      const getCardState = isDesktop ? getDesktopState : getMobileState;

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
          scrub: 1.2,
          start: isDesktop ? "top top" : "top -300px",
          end: () => `+=${totalTransitions * 100}%`,
          snap: {
            snapTo: "labels",
            duration: { min: 0.3, max: 0.6 },
            delay: 0.05,
            ease: "power2.inOut",
          },
        },
      });

      tl.addLabel("start");

      slides.forEach((slide, slideIndex) => {
        const cards = slide.querySelectorAll(".bonus-card");

        cards.forEach((card, i) => {
          gsap.set(card, { clearProps: "all" });
          gsap.set(card, getCardState(i, 0));
        });

        for (let step = 1; step < cards.length; step++) {
          let stepLabel = `s${slideIndex}_c${step}`;
          tl.addLabel(stepLabel);

          cards.forEach((card, i) => {
            tl.to(
              card,
              {
                ...getCardState(i, step),
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
    },
  );
}
