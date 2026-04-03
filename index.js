gsap.registerPlugin(ScrollTrigger);

const slides = gsap.utils.toArray(".large-slide");

if (slides.length > 0) {
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
      scrub: 1,
      start: "top top",
      end: () => `+=${totalTransitions * 100}%`,
      snap: {
        snapTo: "labels",
        duration: { min: 0.2, max: 0.5 },
        delay: 0.1,
        ease: "power1.inOut",
      },
    },
  });

  const getCardState = (index, currentIndex) => {
    const diff = index - currentIndex;
    if (diff === 0) {
      return { xPercent: 0, scale: 1, opacity: 1, zIndex: 10, autoAlpha: 1 };
    } else if (diff === 1) {
      // ПРАВАЯ КАРТОЧКА: уменьши xPercent (например, сделай 30 или 40 вместо 55)
      return {
        xPercent: 40,
        scale: 0.85,
        opacity: 0.4,
        zIndex: 5,
        autoAlpha: 1,
      };
    } else if (diff === -1) {
      // ЛЕВАЯ КАРТОЧКА: увеличь xPercent (например, сделай -30 или -40 вместо -55)
      return {
        xPercent: -40,
        scale: 0.85,
        opacity: 0.4,
        zIndex: 5,
        autoAlpha: 1,
      };
    } else if (diff > 1) {
      return { xPercent: 110, scale: 0.5, opacity: 0, zIndex: 1, autoAlpha: 0 };
    } else {
      return {
        xPercent: -110,
        scale: 0.5,
        opacity: 0,
        zIndex: 1,
        autoAlpha: 0,
      };
    }
  };

  tl.addLabel("start");

  slides.forEach((slide, slideIndex) => {
    const cards = slide.querySelectorAll(".bonus-card");

    cards.forEach((card, i) => {
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
}
