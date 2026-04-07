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

      // Десктопные стили оставляем без изменений
      const getDesktopState = (index, currentIndex) => {
        const diff = index - currentIndex;
        if (diff === 0) return { xPercent: 0, scale: 1, opacity: 1, zIndex: 10, autoAlpha: 1, rotateY: 0 };
        if (diff === 1) return { xPercent: 40, scale: 0.85, opacity: 0.6, zIndex: 5, autoAlpha: 1, rotateY: -4 };
        if (diff === -1) return { xPercent: -40, scale: 0.85, opacity: 0.6, zIndex: 5, autoAlpha: 1, rotateY: 4 };
        if (diff > 1) return { xPercent: 110, scale: 0.6, opacity: 0, zIndex: 1, autoAlpha: 0, rotateY: -10 };
        return { xPercent: -110, scale: 0.6, opacity: 0, zIndex: 1, autoAlpha: 0, rotateY: 10 };
      };

      // Мобильные стили (смахивание вверх)
      const getMobileState = (index, currentIndex) => {
        const diff = index - currentIndex;
        if (diff === 0) {
          return { x: 0, y: 0, scale: 1, opacity: 1, zIndex: 10, autoAlpha: 1, rotateZ: 0 };
        } else if (diff > 0) {
          // Карточки, которые ждут своей очереди (стопка снизу)
          return { x: diff * 10, y: diff * 15, scale: 1 - diff * 0.05, opacity: 1 - diff * 0.1, zIndex: 10 - diff, autoAlpha: diff > 2 ? 0 : 1, rotateZ: diff * 2 };
        } else {
          // Смахнутые карточки улетают высоко вверх
          return { x: -30, y: -window.innerHeight * 0.8, scale: 0.85, opacity: 0, zIndex: 1, autoAlpha: 0, rotateZ: -10 };
        }
      };

      const getCardState = isDesktop ? getDesktopState : getMobileState;
      const cards = slide.querySelectorAll(".bonus-card");
      const totalSteps = cards.length - 1;

      // Сброс и изначальная расстановка
      cards.forEach((card, i) => {
        gsap.set(card, { clearProps: "all" });
        gsap.set(card, getCardState(i, 0));
      });

      if (isDesktop) {
        // ==========================================
        // DESKTOP: ОСТАВЛЯЕМ КАК БЫЛО
        // ==========================================
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
            tl.to(card, { ...getCardState(i, step), duration: 1, ease: "power2.inOut" }, stepLabel);
          });
        }

      } else {
        // ==========================================
        // MOBILE: СОВРЕМЕННЫЙ ПЛАВНЫЙ СКРОЛЛ
        // ==========================================
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".pinned-section", // Пин срабатывает по самой секции
            pin: true, // Идеально плавное прилипание
            scrub: 0.5, // 0.5 дает легкую плавность, но жестко держится за палец пользователя
            start: "top top", // Сначала доскролливаем до секции, и только когда она касается верха экрана — она залипает
            end: () => `+=${totalSteps * 120}%`, // Увеличили дистанцию! Теперь чтобы перелистнуть, нужно реально проскроллить, карточки не будут улетать кучей.
            // Никакого snap! Пользователь сам контролирует движение, это убирает любые дергания.
          },
        });

        // Строим анимацию шаг за шагом
        for (let step = 1; step <= totalSteps; step++) {
          cards.forEach((card, i) => {
            tl.to(
              card,
              {
                ...getCardState(i, step),
                duration: 1,
                ease: "none" // ВАЖНО: linear easing (none) работает лучше всего вместе со scrub, не создает эффекта "резинки"
              },
              step - 1 // Четкая позиция на таймлайне
            );
          });
        }
      }

      return () => {
        // Очистка при смене размера экрана происходит автоматически
      };
    }
  );
}