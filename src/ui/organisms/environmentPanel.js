const clampValue = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));

export const createEnvironmentPanel = ({
  legendContainer,
  legendTitle,
  legendBody,
  sliderContainer,
  sliderTitle,
  sliderMinLabel,
  sliderMaxLabel,
  sliderValueLabel,
  sliderInput,
} = {}) => {
  let activeSlider = null; // { key, config }
  let sliderValue = 100;

  const setLegendTemplate = (template = {}) => {
    if (legendTitle) legendTitle.innerHTML = template?.title || "";
    if (legendBody) legendBody.innerHTML = template?.body || "";
  };

  const setLegendVisibility = (visible) => {
    if (!legendContainer) return;
    const isVisible = Boolean(visible);
    legendContainer.classList.toggle("visible", isVisible);
    legendContainer.setAttribute("aria-hidden", isVisible ? "false" : "true");
  };

  const hideSlider = () => {
    if (activeSlider?.config?.reset) {
      activeSlider.config.reset();
    }
    activeSlider = null;
    sliderValue = 100;
    if (sliderContainer) {
      sliderContainer.classList.remove("visible");
      sliderContainer.setAttribute("aria-hidden", "true");
    }
    if (sliderValueLabel) sliderValueLabel.textContent = "";
  };

  const updateSliderLabels = () => {
    if (!activeSlider) return;
    const formatter = activeSlider.config?.formatLabel;
    if (sliderValueLabel) {
      sliderValueLabel.textContent = formatter ? formatter(sliderValue) : `${sliderValue}%`;
    }
    if (sliderInput && sliderInput.value !== `${sliderValue}`) {
      sliderInput.value = `${sliderValue}`;
    }
  };

  const applySliderValue = (value) => {
    if (!activeSlider) return;
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return;
    sliderValue = clampValue(Math.round(numeric));
    activeSlider.config?.apply?.(sliderValue / 100);
    updateSliderLabels();
  };

  const setSliderMode = (key, config) => {
    if (!key || !config) {
      hideSlider();
      return;
    }
    if (activeSlider?.key !== key && activeSlider?.config?.reset) {
      activeSlider.config.reset();
    }
    activeSlider = { key, config };
    sliderValue = clampValue(Math.round(config.initialValue ?? 100));

    if (sliderContainer) {
      sliderContainer.classList.add("visible");
      sliderContainer.setAttribute("aria-hidden", "false");
    }
    if (sliderTitle) sliderTitle.textContent = config.title || "";
    if (sliderMinLabel) sliderMinLabel.textContent = config.minLabel || "";
    if (sliderMaxLabel) sliderMaxLabel.textContent = config.maxLabel || "";
    applySliderValue(sliderValue);
  };

  sliderInput?.addEventListener("input", () => {
    if (!activeSlider) return;
    applySliderValue(sliderInput.value);
  });

  return {
    setLegendTemplate,
    setLegendVisibility,
    setSliderMode,
    clearSlider: hideSlider,
    getSliderMode: () => activeSlider?.key || null,
  };
};
