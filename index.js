let touchStartY = 0;

// Отключаем стандартный bounce-эффект (отскок) в браузерах
document.documentElement.style.overscrollBehavior = "none";
document.body.style.overscrollBehavior = "none";

// Запоминаем координату Y при начале касания
document.addEventListener(
  "touchstart",
  (e) => {
    touchStartY = e.touches[0].clientY;
  },
  { passive: true },
);

// Блокируем движение пальцем только в том случае, если мы на самом верху страницы
// и пытаемся свайпнуть вниз (чтобы обновить страницу или вызвать bounce-эффект).
// Свайпы вверх (для прокрутки вниз) блокироваться не будут.
document.addEventListener(
  "touchmove",
  (e) => {
    const touchY = e.touches[0].clientY;
    if (window.scrollY <= 0 && touchY > touchStartY) {
      if (e.cancelable) {
        e.preventDefault();
      }
    }
  },
  { passive: false },
);

// Регистрируем плагин ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Настраиваем нормализацию скролла.
// preventDefault: false предотвращает зависание прокрутки при первом жесте на мобильных устройствах.
ScrollTrigger.normalizeScroll({
  allowNestedScroll: true,
  type: "touch,wheel",
  preventDefault: false,
});

window.addEventListener("load", () => {
  ScrollTrigger.refresh();

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

        // --- ЛОГИКА ДЛЯ ДЕСКТОПА ---
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
          }
          if (diff === 1) {
            return {
              xPercent: 40,
              scale: 0.85,
              opacity: 0.6,
              zIndex: 5,
              autoAlpha: 1,
              rotateY: -4,
            };
          }
          if (diff === -1) {
            return {
              xPercent: -40,
              scale: 0.85,
              opacity: 0.6,
              zIndex: 5,
              autoAlpha: 1,
              rotateY: 4,
            };
          }
          if (diff > 1) {
            return {
              xPercent: 110,
              scale: 0.6,
              opacity: 0,
              zIndex: 1,
              autoAlpha: 0,
              rotateY: -10,
            };
          }
          return {
            xPercent: -110,
            scale: 0.6,
            opacity: 0,
            zIndex: 1,
            autoAlpha: 0,
            rotateY: 10,
          };
        };

        // --- ЛОГИКА ДЛЯ МОБИЛКИ ---
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

        // Сброс и начальная расстановка карточек
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
                {
                  ...getCardState(i, step),
                  duration: 1,
                  ease: "power2.inOut",
                },
                stepLabel,
              );
            });
          }
        } else {
          // --- МОБИЛЬНАЯ ВЕРСИЯ ---
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: ".nested-slider",
              pin: ".pinned-section",
              // Значение "top top" предотвращает проблемы со стартом прокрутки,
              // так как блок расположен в самом начале страницы.
              start: "top top",
              end: () => `+=${totalSteps * 100}%`,
              scrub: 1.5,
              refreshPriority: 1,
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

    ScrollTrigger.refresh();
  }
});
