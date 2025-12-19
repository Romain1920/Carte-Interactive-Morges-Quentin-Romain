export const createFilterPanel = ({ buttons = [], onBeforeActivate, onBeforeToggle } = {}) => {
  const buttonByKey = {};
  const activeFilterByGroup = { diagnostic: null, project: null };
  const definitions = {};

  const setButtonState = (filterKey, isActive) => {
    const button = buttonByKey[filterKey];
    if (!button) return;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  };

  const deactivate = (filterKey) => {
    const definition = definitions[filterKey];
    if (!definition) return;
    definition.deactivate?.();
    setButtonState(filterKey, false);
    if (activeFilterByGroup[definition.group] === filterKey) {
      activeFilterByGroup[definition.group] = null;
    }
  };

  const resetGroup = (group) => {
    const current = activeFilterByGroup[group];
    if (current) deactivate(current);
  };

  const helpers = {
    resetGroup: (group) => resetGroup(group),
    deactivate: (key) => deactivate(key),
  };

  const activate = (filterKey) => {
    const definition = definitions[filterKey];
    if (!definition) return;
    if (activeFilterByGroup[definition.group] === filterKey) return;
    onBeforeActivate?.(definition.group, filterKey, helpers);
    resetGroup(definition.group);
    definition.activate?.();
    setButtonState(filterKey, true);
    activeFilterByGroup[definition.group] = filterKey;
  };

  const toggle = (filterKey) => {
    const definition = definitions[filterKey];
    if (!definition) return;
    onBeforeToggle?.(filterKey, definition);
    if (activeFilterByGroup[definition.group] === filterKey) {
      deactivate(filterKey);
    } else {
      activate(filterKey);
    }
  };

  const bindButtons = () => {
    buttons.forEach((button) => {
      const filterKey = button.dataset.filter;
      if (!filterKey || !definitions[filterKey]) return;
      buttonByKey[filterKey] = button;
      const presetActive = button.classList.contains("active");
      setButtonState(filterKey, presetActive);
      if (presetActive) {
        activeFilterByGroup[definitions[filterKey].group] = filterKey;
      }
      button.addEventListener("click", () => toggle(filterKey));
    });
  };

  const registerDefinitions = (defs = {}) => {
    Object.entries(defs).forEach(([key, value]) => {
      definitions[key] = value;
    });
  };

  return {
    registerDefinitions,
    bindButtons,
    activate,
    deactivate,
    toggle,
    resetGroup,
    getActiveFilter: (group) => activeFilterByGroup[group] || null,
  };
};
