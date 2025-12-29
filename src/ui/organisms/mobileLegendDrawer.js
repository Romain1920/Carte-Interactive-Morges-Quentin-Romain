export const createMobileLegendDrawer = ({
  legend,
  toggleButton,
  overlay,
  closeButton,
  breakpoint = "(max-width: 800px)",
  documentRef = document,
} = {}) => {
  if (!legend || !toggleButton || !overlay) return null;

  const mobileQuery = window.matchMedia(breakpoint);
  let isMobile = mobileQuery.matches;
  let legendAvailable = false;
  let isOpen = false;

  const applyState = () => {
    const showToggle = isMobile && legendAvailable;
    toggleButton.hidden = !showToggle;

    if (!showToggle) {
      isOpen = false;
    }

    const shouldOpen = showToggle && isOpen;
    legend.classList.toggle("is-mobile-open", shouldOpen);
    overlay.hidden = !shouldOpen;
    overlay.classList.toggle("is-visible", shouldOpen);
    toggleButton.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
    documentRef.body.classList.toggle("legend-panel-open", shouldOpen);
  };

  const close = () => {
    if (!isOpen) return;
    isOpen = false;
    applyState();
  };

  const handleBreakpointChange = (event) => {
    isMobile = event.matches;
    if (!isMobile) {
      isOpen = false;
      toggleButton.hidden = true;
      overlay.hidden = true;
      overlay.classList.remove("is-visible");
      legend.classList.remove("is-mobile-open");
      documentRef.body.classList.remove("legend-panel-open");
    } else {
      applyState();
    }
  };

  const handleToggleClick = () => {
    if (!isMobile || !legendAvailable) return;
    isOpen = !isOpen;
    applyState();
  };

  const handleOverlayClick = () => close();
  const handleKeyDown = (event) => {
    if (!isMobile) return;
    if (event.key === "Escape") close();
  };

  toggleButton.addEventListener("click", handleToggleClick);
  overlay.addEventListener("click", handleOverlayClick);
  closeButton?.addEventListener("click", close);
  documentRef.addEventListener("keydown", handleKeyDown);
  mobileQuery.addEventListener("change", handleBreakpointChange);
  applyState();

  const handleLegendVisibility = (visible) => {
    legendAvailable = Boolean(visible);
    if (!legendAvailable) {
      isOpen = false;
    }
    applyState();
  };

  const destroy = () => {
    toggleButton.removeEventListener("click", handleToggleClick);
    overlay.removeEventListener("click", handleOverlayClick);
    closeButton?.removeEventListener("click", close);
    documentRef.removeEventListener("keydown", handleKeyDown);
    mobileQuery.removeEventListener("change", handleBreakpointChange);
  };

  return { handleLegendVisibility, close, destroy };
};
