export const createEnvironmentController = ({
  map,
  environmentPanel,
  pollutionLegendTemplates,
  diagnosticPollutionConfigs,
  setProjectHeat2050Visibility,
  setProjectNoiseLayerVisibility,
  setProjectAirLayerVisibility,
  onProjectModeChange,
}) => {
  const RASTER_MAX_OPACITY = 0.8;
  const noiseVisibilityState = { diagnosticMode: "none", projectMode: "none", projectEnabled: false };
  let heatLayerVisible = false;
  let projectResilienceActive = false;
  let projectNoiseActive = false;
  let projectAirActive = false;
  let projectAttractivityActive = false;

  const sliderConfigs = {
    heat: {
      title: "Comparer le scénario 2060",
      minLabel: "Scénario 2060",
      maxLabel: "2060 + projet",
      initialValue: 0,
      formatLabel: (value) => {
        if (value <= 5) return "Scénario 2060";
        if (value >= 95) return "2060 + projet";
        return `${value}% vers le projet`;
      },
      apply: (ratio) => {
        if (map.getLayer("project-heat2050-layer")) {
          map.setPaintProperty("project-heat2050-layer", "raster-opacity", RASTER_MAX_OPACITY);
        }
        if (map.getLayer("project-heat2050-improved-layer")) {
          map.setPaintProperty("project-heat2050-improved-layer", "raster-opacity", RASTER_MAX_OPACITY * ratio);
        }
      },
      reset: () => {
        if (map.getLayer("project-heat2050-layer")) {
          map.setPaintProperty("project-heat2050-layer", "raster-opacity", RASTER_MAX_OPACITY);
        }
        if (map.getLayer("project-heat2050-improved-layer")) {
          map.setPaintProperty("project-heat2050-improved-layer", "raster-opacity", 0);
        }
      },
    },
    noise: {
      title: "Pollution sonore : avant / après",
      minLabel: "Sans mesures",
      maxLabel: "Avec les mesures",
      initialValue: 0,
      formatLabel: (value) => {
        if (value <= 5) return "Sans mesures";
        if (value >= 95) return "Avec les mesures";
        return `${value}% vers nos mesures`;
      },
      apply: (ratio) => {
        if (map.getLayer("project-noise-before-layer")) {
          map.setPaintProperty("project-noise-before-layer", "raster-opacity", RASTER_MAX_OPACITY * (1 - ratio));
        }
        if (map.getLayer("project-noise-after-layer")) {
          map.setPaintProperty("project-noise-after-layer", "raster-opacity", RASTER_MAX_OPACITY * ratio);
        }
      },
      reset: () => {
        if (map.getLayer("project-noise-before-layer")) {
          map.setPaintProperty("project-noise-before-layer", "raster-opacity", RASTER_MAX_OPACITY);
        }
        if (map.getLayer("project-noise-after-layer")) {
          map.setPaintProperty("project-noise-after-layer", "raster-opacity", 0);
        }
      },
    },
    air: {
      title: "Pollution de l'air : avant / après",
      minLabel: "Sans mesures",
      maxLabel: "Avec les mesures",
      initialValue: 0,
      formatLabel: (value) => {
        if (value <= 5) return "Sans mesures";
        if (value >= 95) return "Avec les mesures";
        return `${value}% vers nos mesures`;
      },
      apply: (ratio) => {
        if (map.getLayer("project-air-before-layer")) {
          map.setPaintProperty("project-air-before-layer", "raster-opacity", RASTER_MAX_OPACITY * (1 - ratio));
        }
        if (map.getLayer("project-air-after-layer")) {
          map.setPaintProperty("project-air-after-layer", "raster-opacity", RASTER_MAX_OPACITY * ratio);
        }
      },
      reset: () => {
        if (map.getLayer("project-air-before-layer")) {
          map.setPaintProperty("project-air-before-layer", "raster-opacity", RASTER_MAX_OPACITY);
        }
        if (map.getLayer("project-air-after-layer")) {
          map.setPaintProperty("project-air-after-layer", "raster-opacity", 0);
        }
      },
    },
  };

  const updateDiagnosticHeatLayerVisibility = () => {
    if (map.getLayer("diagnostic-heat-raster-layer")) {
      map.setLayoutProperty("diagnostic-heat-raster-layer", "visibility", heatLayerVisible ? "visible" : "none");
      if (!heatLayerVisible) {
        map.setPaintProperty("diagnostic-heat-raster-layer", "raster-opacity", 1);
      }
    }
  };

  const applyLegendTemplate = (mode, fromProject = false) => {
    const template = fromProject ? pollutionLegendTemplates[mode] : diagnosticPollutionConfigs[mode]?.legend ?? pollutionLegendTemplates[mode];
    if (!template) return;
    environmentPanel.setLegendTemplate(template);
  };

  const updateNoiseUI = () => {
    const hasDiagnostic = noiseVisibilityState.diagnosticMode !== "none";
    const hasProject = noiseVisibilityState.projectEnabled && noiseVisibilityState.projectMode !== "none";
    const hasSlider = Boolean(environmentPanel.getSliderMode());
    const shouldShow = hasDiagnostic || hasProject || heatLayerVisible || projectAttractivityActive || hasSlider;
    if (map.getLayer("focus-mask-layer")) {
      map.setLayoutProperty("focus-mask-layer", "visibility", shouldShow ? "visible" : "none");
    }
    environmentPanel.setLegendVisibility(shouldShow);
  };

  const setSliderMode = (mode) => {
    if (!mode) {
      environmentPanel.clearSlider();
      return;
    }
    const config = sliderConfigs[mode];
    if (!config) {
      environmentPanel.clearSlider();
      return;
    }
    if (environmentPanel.getSliderMode() === mode) return;
    environmentPanel.setSliderMode(mode, config);
  };

  const setHeatLayerVisibility = (visible, { suppressLegendUpdate } = {}) => {
    heatLayerVisible = Boolean(visible);
    if (heatLayerVisible && environmentPanel.getSliderMode() === "heat") {
      setSliderMode(null);
    }
    if (heatLayerVisible && noiseVisibilityState.diagnosticMode !== "none") {
      setDiagnosticPollutionMode("none", { suppressLegendUpdate: true });
    }
    updateDiagnosticHeatLayerVisibility();
    if (heatLayerVisible && !suppressLegendUpdate) {
      applyLegendTemplate("heat");
    }
    updateNoiseUI();
  };

  const setDiagnosticPollutionMode = (mode, { suppressLegendUpdate } = {}) => {
    if (mode !== "none" && heatLayerVisible) {
      setHeatLayerVisibility(false, { suppressLegendUpdate: true });
    }
    const nextMode = diagnosticPollutionConfigs[mode] ? mode : "none";
    noiseVisibilityState.diagnosticMode = nextMode;
    Object.values(diagnosticPollutionConfigs).forEach((config) => {
      if (map.getLayer(config.layerId)) {
        map.setLayoutProperty(config.layerId, "visibility", nextMode === config.key ? "visible" : "none");
      }
    });
    if (nextMode !== "none" && !suppressLegendUpdate) applyLegendTemplate(nextMode);
    updateNoiseUI();
  };

  const notifyProjectModeChange = () => {
    const mode = noiseVisibilityState.projectEnabled ? noiseVisibilityState.projectMode : "none";
    onProjectModeChange?.(mode);
  };

  const setProjectResilienceState = (active) => {
    projectResilienceActive = active;
    if (active) {
      noiseVisibilityState.projectEnabled = true;
      noiseVisibilityState.projectMode = "heat2050";
      applyLegendTemplate("heat2050", true);
      setProjectHeat2050Visibility(true);
      setSliderMode("heat");
    } else {
      noiseVisibilityState.projectEnabled = false;
      noiseVisibilityState.projectMode = "none";
      setProjectHeat2050Visibility(false);
      if (environmentPanel.getSliderMode() === "heat") setSliderMode(null);
    }
    updateNoiseUI();
    notifyProjectModeChange();
  };

  const setProjectNoiseState = (active) => {
    projectNoiseActive = active;
    if (active) {
      setProjectHeat2050Visibility(false);
      setProjectAirLayerVisibility(false);
      setProjectNoiseLayerVisibility(true);
      setSliderMode("noise");
      noiseVisibilityState.projectEnabled = false;
      noiseVisibilityState.projectMode = "none";
      applyLegendTemplate("noise", true);
    } else {
      setProjectNoiseLayerVisibility(false);
      if (environmentPanel.getSliderMode() === "noise") setSliderMode(null);
    }
    updateNoiseUI();
    notifyProjectModeChange();
  };

  const setProjectAirState = (active) => {
    projectAirActive = active;
    if (active) {
      setProjectHeat2050Visibility(false);
      setProjectNoiseLayerVisibility(false);
      setProjectAirLayerVisibility(true);
      setSliderMode("air");
      noiseVisibilityState.projectEnabled = false;
      noiseVisibilityState.projectMode = "none";
      applyLegendTemplate("air", true);
    } else {
      setProjectAirLayerVisibility(false);
      if (environmentPanel.getSliderMode() === "air") setSliderMode(null);
    }
    updateNoiseUI();
    notifyProjectModeChange();
  };

  const setProjectAttractivityState = (active) => {
    projectAttractivityActive = active;
    if (active) {
      applyLegendTemplate("attractivity", true);
    }
    updateNoiseUI();
  };

  const resetProjectStates = () => {
    if (projectResilienceActive) setProjectResilienceState(false);
    if (projectNoiseActive) setProjectNoiseState(false);
    if (projectAirActive) setProjectAirState(false);
    if (projectAttractivityActive) setProjectAttractivityState(false);
  };

  const resetDiagnosticState = () => {
    setDiagnosticPollutionMode("none", { suppressLegendUpdate: true });
    if (heatLayerVisible) setHeatLayerVisibility(false, { suppressLegendUpdate: true });
  };

  const filterDefinitions = {
    "diagnostic-noise": {
      group: "diagnostic",
      activate: () => setDiagnosticPollutionMode("noise"),
      deactivate: () => setDiagnosticPollutionMode("none"),
    },
    "diagnostic-air": {
      group: "diagnostic",
      activate: () => setDiagnosticPollutionMode("air"),
      deactivate: () => setDiagnosticPollutionMode("none"),
    },
    "diagnostic-heat": {
      group: "diagnostic",
      activate: () => setHeatLayerVisibility(true),
      deactivate: () => setHeatLayerVisibility(false, { suppressLegendUpdate: true }),
    },
    "project-noise": {
      group: "project",
      activate: () => setProjectNoiseState(true),
      deactivate: () => setProjectNoiseState(false),
    },
    "project-air": {
      group: "project",
      activate: () => setProjectAirState(true),
      deactivate: () => setProjectAirState(false),
    },
    "project-heat": {
      group: "project",
      activate: () => setProjectResilienceState(true),
      deactivate: () => setProjectResilienceState(false),
    },
    "project-attractivity": {
      group: "project",
      activate: () => setProjectAttractivityState(true),
      deactivate: () => setProjectAttractivityState(false),
    },
  };

  return {
    filterDefinitions,
    setDiagnosticPollutionMode,
    setHeatLayerVisibility,
    setProjectResilienceState,
    setProjectNoiseState,
    setProjectAirState,
    setProjectAttractivityState,
    resetProjectStates,
    resetDiagnosticState,
    getNoiseVisibilityState: () => ({ ...noiseVisibilityState }),
  };
};
