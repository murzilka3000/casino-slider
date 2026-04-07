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
          // Стопка ожидающих карточек
          return {
            x: diff * 10,
            y: diff * 15,
            scale: 1 - diff * 0.05,
            opacity: 1 - diff * 0.1,
            zIndex: 10 - diff,
            autoAlpha: diff > 2 ? 0 : 1,
            rotateZ: diff * 2,
          };
        } else {
          // Улетают вверх при скролле
          return {
            x: -30,
            y: -window.innerHeight * 0.8,
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
        // ПК ВЕРСИЯ (оставляем как было, там всё ок)
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
            // 1. СМОТРИМ ЗА САМИМ СЛАЙДЕРОМ (карточками)
            trigger: ".nested-slider",

            // 2. А ЗАЛИПАТЬ БУДЕТ ВСЯ СЕКЦИЯ ЦЕЛИКОМ
            pin: ".pinned-section",

            // 3. Секция прокрутится вверх, заголовки уйдут повыше,
            // и ТОЛЬКО когда карточки доедут до центра экрана (55% от верха), скролл заблокируется!
            start: "center 55%",

            // 4. Длина скролла, чтобы не улетали быстро
            end: () => `+=${totalSteps * 100}%`,

            // Плавность скролла без лагов и дерганий
            scrub: 1,
          },
        });

        // Строим таймлайн анимации по скроллу
        for (let step = 1; step <= totalSteps; step++) {
          cards.forEach((card, i) => {
            tl.to(
              card,
              {
                ...getCardState(i, step),
                duration: 1,
                ease: "none", // Оставляем linear (none), так как scrub сам сглаживает анимацию
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
