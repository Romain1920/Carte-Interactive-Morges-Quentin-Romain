const defaultExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "avif", "heic", "heif"];

export const createLightboxController = ({
  container,
  imageElement,
  frameElement,
  closeButton,
  allowedImageExtensions = defaultExtensions,
} = {}) => {
  const resetMedia = () => {
    if (imageElement) {
      imageElement.src = "";
      imageElement.style.display = "none";
    }
    if (frameElement) {
      frameElement.src = "";
      frameElement.style.display = "none";
    }
  };

  const close = () => {
    if (!container) return;
    container.classList.remove("visible");
    resetMedia();
  };

  const open = (url) => {
    if (!url || !container) return;
    const clean = url.split("#")[0];
    const ext = clean.split("?")[0].split(".").pop()?.toLowerCase();
    const isImage = ext && allowedImageExtensions.includes(ext);

    if (isImage && imageElement) {
      imageElement.src = url;
      imageElement.style.display = "block";
      if (frameElement) frameElement.style.display = "none";
    } else if (frameElement) {
      frameElement.src = url;
      frameElement.style.display = "block";
      if (imageElement) imageElement.style.display = "none";
    } else {
      window.open(url, "_blank");
      return;
    }

    container.classList.add("visible");
  };

  closeButton?.addEventListener("click", close);
  container?.addEventListener("click", (event) => {
    if (event.target === container) close();
  });

  return { open, close };
};
