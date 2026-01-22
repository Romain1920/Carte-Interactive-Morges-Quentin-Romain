export const setupFilterPanelModals = ({ documentRef = document } = {}) => {
  const panels = Array.from(documentRef.querySelectorAll("[data-filter-panel]"));
  const triggers = Array.from(documentRef.querySelectorAll("[data-filter-panel-open]"));
  const closeButtons = Array.from(documentRef.querySelectorAll("[data-filter-panel-close]"));
  if (!panels.length) return null;

  const panelByKey = panels.reduce((map, panel) => {
    const key = panel.getAttribute("data-filter-panel");
    if (key) map.set(key, panel);
    return map;
  }, new Map());

  const overlay = documentRef.createElement("div");
  overlay.className = "filter-panel-mobile-overlay";
  overlay.setAttribute("aria-hidden", "true");
  documentRef.body.appendChild(overlay);

  let activeKey = null;

  const closePanel = () => {
    if (!activeKey) return;
    const panel = panelByKey.get(activeKey);
    panel?.classList.remove("is-mobile-open");
    panel?.setAttribute("aria-hidden", "true");
    overlay.classList.remove("visible");
    overlay.setAttribute("aria-hidden", "true");
    documentRef.body.classList.remove("filter-panel-modal-open");
    activeKey = null;
  };

  const openPanel = (key) => {
    if (!key) return;
    const panel = panelByKey.get(key);
    if (!panel) return;
    if (activeKey && activeKey !== key) {
      closePanel();
    }
    activeKey = key;
    overlay.classList.add("visible");
    overlay.setAttribute("aria-hidden", "false");
    documentRef.body.classList.add("filter-panel-modal-open");
    panel.classList.add("is-mobile-open");
    panel.setAttribute("aria-hidden", "false");
    panel.querySelector(".filter-button")?.focus({ preventScroll: false });
  };

  triggers.forEach((trigger) => {
    const key = trigger.getAttribute("data-filter-panel-open");
    trigger.addEventListener("click", () => openPanel(key));
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", () => closePanel());
  });

  overlay.addEventListener("click", () => closePanel());

  documentRef.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closePanel();
    }
  });

  return { openPanel, closePanel };
};
