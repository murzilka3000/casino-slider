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

      // --- ЛОГИКА ДЛЯ ДЕСКТОПА --- (без изменений)
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

      // --- ЛОГИКА ДЛЯ МОБИЛКИ --- (без изменений)
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
            rotationZ: 0,
          };
        } else if (diff > 0) {
          const visualDiff = Math.min(diff, 4);

          return {
            x: 0,
            y: visualDiff * 25,
            scale: 1 - visualDiff * 0.05,
            opacity: 1,
            zIndex: 20 - diff,
            autoAlpha: diff > 4 ? 0 : 1,
            rotationZ: 0,
          };
        } else {
          return {
            x: -window.innerWidth * 0.8,
            y: -window.innerHeight * 0.8,
            scale: 1,
            opacity: 0,
            zIndex: 30,
            autoAlpha: 0,
            rotationZ: -25,
          };
        }
      };

      const getCardState = isDesktop ? getDesktopState : getMobileState;
      const cards = slide.querySelectorAll(".bonus-card");
      const totalSteps = cards.length - 1;

      // Сброс и начальная расстановка
      cards.forEach((card, i) => {
        gsap.set(card, { clearProps: "all" });
        gsap.set(card, getCardState(i, 0));
      });

      if (isDesktop) {
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
        // КЛЮЧЕВЫЕ ИЗМЕНЕНИЯ ДЛЯ МОБИЛЬНОЙ ВЕРСИИ

        // 1. Добавляем дополнительную анимацию для первичного скролла
        gsap.to({}, { duration: 0.01 }); // Принудительная активация GSAP

        // 2. Изменяем параметры ScrollTrigger для мобильной версии
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".nested-slider",
            pin: ".pinned-section",
            start: "top 35%",
            end: () => `+=${window.innerHeight * totalSteps}px`, // Абсолютные пиксели вместо %
            scrub: 0.5, // Быстрее реагирует на скролл
            pinSpacing: true, // Важно!
            anticipatePin: 1, // Упреждающее закрепление
          },
        });

        // 3. Создаем отдельную анимацию для первого скролла
        const preScrollTl = gsap.timeline();
        preScrollTl.to({}, { duration: 0.01 });

        // 4. Основная анимация без изменений
        for (let step = 1; step <= totalSteps; step++) {
          cards.forEach((card, i) => {
            tl.to(
              card,
              {
                ...getCardState(i, step),
                duration: 1,
                ease: "power1.inOut", // Более отзывчивая анимация
              },
              step - 1,
            );
          });
        }
      }

      // Принудительное обновление после задержки
      setTimeout(() => ScrollTrigger.refresh(), 200);

      return () => {};
    },
  );
}
