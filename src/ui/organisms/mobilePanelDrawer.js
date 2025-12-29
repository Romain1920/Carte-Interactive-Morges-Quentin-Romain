export const createMobilePanelDrawer = ({
  panel,
  toggleButton,
  overlay,
  breakpoint = "(max-width: 900px)",
  documentRef = document,
} = {}) => {
  if (!panel || !toggleButton || !overlay) return null;

  const mobileQuery = window.matchMedia(breakpoint);
  let isMobile = mobileQuery.matches;

  const updateState = (open) => {
    if (!isMobile) return;
    panel.classList.toggle("is-mobile-open", open);
    overlay.hidden = !open;
    overlay.classList.toggle("is-visible", open);
    toggleButton.setAttribute("aria-expanded", open ? "true" : "false");
    panel.setAttribute("aria-hidden", open ? "false" : "true");
    documentRef.body.classList.toggle("mobile-panel-open", open);
  };

  const close = () => updateState(false);

  const handleBreakpointChange = (event) => {
    isMobile = event.matches;
    if (!isMobile) {
      panel.classList.remove("is-mobile-open");
      panel.removeAttribute("aria-hidden");
      overlay.hidden = true;
      overlay.classList.remove("is-visible");
      toggleButton.setAttribute("aria-expanded", "false");
      documentRef.body.classList.remove("mobile-panel-open");
    } else {
      updateState(false);
    }
  };

  const handleToggleClick = () => {
    if (!isMobile) return;
    const isOpen = panel.classList.contains("is-mobile-open");
    updateState(!isOpen);
  };

  const handleOverlayClick = () => close();
  const handleKeyDown = (event) => {
    if (!isMobile) return;
    if (event.key === "Escape") close();
  };

  toggleButton.addEventListener("click", handleToggleClick);
  overlay.addEventListener("click", handleOverlayClick);
  documentRef.addEventListener("keydown", handleKeyDown);
  mobileQuery.addEventListener("change", handleBreakpointChange);
  handleBreakpointChange(mobileQuery);

  const destroy = () => {
    toggleButton.removeEventListener("click", handleToggleClick);
    overlay.removeEventListener("click", handleOverlayClick);
    documentRef.removeEventListener("keydown", handleKeyDown);
    mobileQuery.removeEventListener("change", handleBreakpointChange);
  };

  return { close, destroy };
};
