gsap.registerPlugin(ScrollTrigger);

// 1. ВАЖНО: Включаем нормализацию скролла ТОЛЬКО для тач-устройств.
// Это убивает бешеную инерцию (momentum) и скрытие/появление адресной строки,
// из-за которых дергаются пины на мобилках.
ScrollTrigger.normalizeScroll({
  allowNestedScroll: true,
  type: "touch", // Работает только на телефонах, на ПК скролл мыши остается родным
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

      // ... (getDesktopState оставляем как было) ...
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

      // ... (getMobileState с крутой физикой оставляем как есть) ...
      const getMobileState = (index, currentIndex) => {
        const diff = index - currentIndex;
        if (diff === 0) {
          return {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            zIndex: 20,
            autoAlpha: 1,
            rotation: 0,
          };
        } else if (diff > 0) {
          return {
            x: diff * 8,
            y: diff * 16,
            scale: 1 - diff * 0.06,
            opacity: 1 - diff * 0.15,
            zIndex: 20 - diff,
            autoAlpha: diff > 2 ? 0 : 1,
            rotation: diff * 2,
          };
        } else {
          return {
            x: -80,
            y: -window.innerHeight * 0.7,
            scale: 1.05,
            opacity: 0,
            zIndex: 30,
            autoAlpha: 0,
            rotation: -15,
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
        // ПК ВЕРСИЯ (без изменений)
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
        // МОБИЛЬНАЯ ВЕРСИЯ - УБИВАЕМ ИНЕРЦИЮ
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".nested-slider",
            pin: ".pinned-section",
            start: "center 55%",

            // 2. ИСКУССТВЕННОЕ ТРЕНИЕ:
            // Было 100%, стало 250% на каждую карточку.
            // Теперь чтобы пролететь все карты, нужно скроллить в 2.5 раза дольше.
            // Инерционный рывок просто "увязнет" в этой дистанции и пролистает максимум 1 карту.
            end: () => `+=${totalSteps * 250}%`,

            // 3. АМОРТИЗАТОР:
            // Было 1. Стало 1.5.
            // Анимация будет чуть плавнее догонять палец, сглаживая резкие системные рывки.
            scrub: 1.5,
          },
        });

        for (let step = 1; step <= totalSteps; step++) {
          cards.forEach((card, i) => {
            tl.to(
              card,
              {
                ...getCardState(i, step),
                duration: 1,
                ease: "none",
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
