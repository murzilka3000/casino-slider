gsap.registerPlugin(ScrollTrigger);

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
          // Активная карточка
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
          // Карточки позади (стопкой как было)
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
          // Смахнутая карточка - улетает вверх
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

      // Инициализация карточек
      cards.forEach((card, i) => {
        gsap.set(card, { clearProps: "all" });
        gsap.set(card, getCardState(i, 0));
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".pinned-section",
          pin: true,
          scrub: 1,
          start: "top top",
          end: () => `+=${totalSteps * 100}%`,
          snap: {
            snapTo: 1 / totalSteps,
            duration: { min: 0.2, max: 0.4 },
            delay: 0.1,
            ease: "power1.inOut",
          },
        },
      });

      // Создаем анимацию ПО ОДНОЙ карточке за шаг
      for (let step = 0; step < totalSteps; step++) {
        const progress = step / totalSteps;
        
        cards.forEach((card, cardIndex) => {
          const newState = getCardState(cardIndex, step + 1);
          
          tl.to(
            card,
            {
              ...newState,
              duration: 1,
              ease: "power2.inOut",
            },
            progress // Каждый шаг в своей позиции
          );
        });
      }

      return () => {};
    }
  );
}