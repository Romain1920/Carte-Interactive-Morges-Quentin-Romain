const renderControls = () => `
  <button class="prev" aria-label="Image précédente">&#8249;</button>
  <button class="next" aria-label="Image suivante">&#8250;</button>
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

  let current = 0;
  const updateImg = () => {
    img.src = images[current];
  };

  const attachZoom = (node) => {
    if (!node) return;
    node.style.cursor = "zoom-in";
    node.addEventListener("click", () => openLightbox?.(images[current]));
  };

  if (images.length > 1) {
    carousel.querySelector(".prev")?.addEventListener("click", () => {
      current = (current - 1 + images.length) % images.length;
      updateImg();
    });
    carousel.querySelector(".next")?.addEventListener("click", () => {
      current = (current + 1) % images.length;
      updateImg();
    });
    carousel.addEventListener("dblclick", () => openLightbox?.(images[current]));
    attachZoom(img);
  } else {
    attachZoom(img);
  }
};
