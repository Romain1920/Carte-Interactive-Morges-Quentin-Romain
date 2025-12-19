export const createLayerControlPanel = ({
  inputs = [],
  layerHandlers = {},
  diagnosticKeys = [],
  projectKeys = [],
  onToggle,
  onBeforeToggle,
  onExclusivity,
} = {}) => {
  const inputByKey = {};

  inputs.forEach((input) => {
    const key = input.dataset.layer;
    if (key) inputByKey[key] = input;
  });

  const deselectGroup = (keys = []) => {
    keys.forEach((targetKey) => {
      const input = inputByKey[targetKey];
      if (!input || !input.checked) return;
      input.checked = false;
      const handler = layerHandlers[targetKey];
      if (handler) handler(false);
      onToggle?.(targetKey, false);
    });
  };

  const enforceExclusivity = (key, checked) => {
    if (!checked || key === "perimeter") return;
    if (diagnosticKeys.includes(key)) {
      onExclusivity?.("diagnostic");
    } else if (projectKeys.includes(key)) {
      onExclusivity?.("project");
    }
  };

  const bind = () => {
    inputs.forEach((input) => {
      const key = input.dataset.layer;
      const handler = layerHandlers[key];
      if (handler) handler(Boolean(input.checked));
      input.addEventListener("change", () => {
        const checked = Boolean(input.checked);
        onBeforeToggle?.(key, checked);
        enforceExclusivity(key, checked);
        if (handler) handler(checked);
        onToggle?.(key, checked);
      });
    });
  };

  return {
    bind,
    deselectGroup,
    getInput: (key) => inputByKey[key],
  };
};
