export const setupPanelSections = ({ buttons = [] } = {}) => {
  const sectionState = {};

  const updateVisibility = (key) => {
    const section = document.querySelector(`[data-section="${key}"]`);
    const visible = Boolean(sectionState[key]);
    if (section) section.classList.toggle("hidden", !visible);
    const button = document.querySelector(`[data-section-toggle="${key}"]`);
    if (button) {
      button.classList.toggle("active", visible);
      button.setAttribute("aria-pressed", visible ? "true" : "false");
    }
  };

  buttons.forEach((button) => {
    const key = button.dataset.sectionToggle;
    if (!key) return;
    if (!(key in sectionState)) sectionState[key] = true;
    button.addEventListener("click", () => {
      sectionState[key] = !sectionState[key];
      updateVisibility(key);
    });
    updateVisibility(key);
  });

  return {
    setVisibility: (key, visible) => {
      sectionState[key] = Boolean(visible);
      updateVisibility(key);
    },
    getVisibility: (key) => sectionState[key],
  };
};
