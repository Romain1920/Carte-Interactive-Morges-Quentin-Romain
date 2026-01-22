const renderControls = () => `
  <button type="button" class="prev" aria-label="Image précédente">&#8249;</button>
  <button type="button" class="next" aria-label="Image suivante">&#8250;</button>
`;

export const PopupCarousel = ({ id, images = [] } = {}) => {
  if (!images.length) return "";
  const controls = images.length > 1 ? renderControls() : "";
  return `
    <div class="popup-carousel" data-id="${id}">
      <img src="${images[0]}" alt="" />
      ${controls}
    </div>
  `;
};

export const bindPopupCarousel = ({ container, images = [], openLightbox }) => {
  if (!container || !images.length) return;
  const carousel = container.querySelector(".popup-carousel");
  const img = carousel?.querySelector("img");
  if (!carousel || !img) return;

  // Précharge toutes les images pour éviter un délai lors du changement.
  images.forEach((src) => {
    const preload = new Image();
    preload.src = src;
  });

  let current = 0;
  const updateImg = () => {
    img.src = images[current];
  };

  const attachZoom = (node) => {
    if (!node) return;
    node.style.cursor = "zoom-in";
    node.addEventListener("click", () => openLightbox?.(images[current]));
  };

  const goNext = () => {
    current = (current + 1) % images.length;
    updateImg();
  };

  const goPrev = () => {
    current = (current - 1 + images.length) % images.length;
    updateImg();
  };

  if (images.length > 1) {
    carousel.querySelector(".prev")?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      goPrev();
    });
    carousel.querySelector(".next")?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      goNext();
    });
    carousel.addEventListener("dblclick", () => openLightbox?.(images[current]));
    attachZoom(img);

    let touchStartX = 0;
    let touchStartY = 0;
    carousel.addEventListener(
      "touchstart",
      (event) => {
        const touch = event.touches?.[0];
        if (!touch) return;
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      },
      { passive: true },
    );
    carousel.addEventListener(
      "touchend",
      (event) => {
        const touch = event.changedTouches?.[0];
        if (!touch) return;
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        if (Math.abs(deltaX) < 40 || Math.abs(deltaY) > 60) return;
        if (deltaX < 0) {
          goNext();
        } else {
          goPrev();
        }
      },
      { passive: true },
    );
  } else {
    attachZoom(img);
  }
};
