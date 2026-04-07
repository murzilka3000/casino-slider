gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.normalizeScroll({
  allowNestedScroll: true,
  type: "touch",
});

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
        if (diff === 0)
          return {
            xPercent: 0,
            scale: 1,
            opacity: 1,
            zIndex: 10,
            autoAlpha: 1,
            rotateY: 0,
          };
        if (diff === 1)
          return {
            xPercent: 40,
            scale: 0.85,
            opacity: 0.6,
            zIndex: 5,
            autoAlpha: 1,
            rotateY: -4,
          };
        if (diff === -1)
          return {
            xPercent: -40,
            scale: 0.85,
            opacity: 0.6,
            zIndex: 5,
            autoAlpha: 1,
            rotateY: 4,
          };
        if (diff > 1)
          return {
            xPercent: 110,
            scale: 0.6,
            opacity: 0,
            zIndex: 1,
            autoAlpha: 0,
            rotateY: -10,
          };
        return {
          xPercent: -110,
          scale: 0.6,
          opacity: 0,
          zIndex: 1,
          autoAlpha: 0,
          rotateY: 10,
        };
      };

      // НОВАЯ, РЕАЛИСТИЧНАЯ ФИЗИКА КОЛОДЫ
      const getMobileState = (index, currentIndex) => {
        const diff = index - currentIndex;

        if (diff === 0) {
          // 1. АКТИВНАЯ КАРТА (Верхняя)
          return {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1, // Полностью плотная
            zIndex: 20,
            autoAlpha: 1,
            rotationZ: 0,
          };
        } else if (diff > 0) {
          // 2. КОЛОДА СНИЗУ (Ожидающие карты)
          return {
            x: 0, // Лежат ровной стопкой
            y: diff * 25, // Выглядывают строго снизу (по 25px каждая)
            scale: 1 - diff * 0.05, // Уходят в глубину
            opacity: 1, // ВАЖНО: Никакой прозрачности! Они плотные, просто лежат сзади
            zIndex: 20 - diff, // Спрятаны ПОД активной картой
            autoAlpha: diff > 2 ? 0 : 1, // Прячем глубокие карты ради оптимизации, но первые 2 полностью видны
            rotationZ: 0,
          };
        } else {
          // 3. СМАХНУТАЯ КАРТА
          return {
            // Улетает далеко влево и вверх за пределы экрана
            x: -window.innerWidth * 0.8,
            y: -window.innerHeight * 0.8,
            scale: 1, // Не меняет размер, остается "в руке"
            opacity: 1, // ВАЖНО: Не растворяется в воздухе! Она просто улетает из кадра.
            zIndex: 30, // СТРОГО поверх колоды
            autoAlpha: 1, // Никаких затуханий
            rotationZ: -25, // Красиво закручивается от "броска" влево
          };
        }
      };

      const getCardState = isDesktop ? getDesktopState : getMobileState;
      const cards = slide.querySelectorAll(".bonus-card");
      const totalSteps = cards.length - 1;

      // Изначальная расстановка
      cards.forEach((card, i) => {
        gsap.set(card, { clearProps: "all" });
        gsap.set(card, getCardState(i, 0));
      });

      if (isDesktop) {
        // ДЕСКТОП
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".pinned-section",
            pin: true,
            scrub: 1.2,
            start: "top top",
            end: () => `+=${totalSteps * 100}%`,
            snap: {
              snapTo: "labels",
              duration: { min: 0.3, max: 0.6 },
              delay: 0.1,
              ease: "power2.inOut",
            },
          },
        });

        tl.addLabel("start");
        for (let step = 1; step <= totalSteps; step++) {
          let stepLabel = `step${step}`;
          tl.addLabel(stepLabel);
          cards.forEach((card, i) => {
            tl.to(
              card,
              { ...getCardState(i, step), duration: 1, ease: "power2.inOut" },
              stepLabel,
            );
          });
        }
      } else {
        // МОБИЛЬНАЯ ВЕРСИЯ
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".nested-slider",
            pin: ".pinned-section",
            start: "center 55%",
            end: () => `+=${totalSteps * 250}%`, // Защита от резкой инерции
            scrub: 1.5,
          },
        });

        // Строим анимацию
        for (let step = 1; step <= totalSteps; step++) {
          cards.forEach((card, i) => {
            tl.to(
              card,
              {
                ...getCardState(i, step),
                duration: 1,
                ease: "none", // Движение пальцем = прямое движение карты
              },
              step - 1,
            );
          });
        }
      }

      return () => {};
    },
  );
}
