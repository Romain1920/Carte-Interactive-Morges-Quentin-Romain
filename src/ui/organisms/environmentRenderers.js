import { createMaskedLocalImageRenderer } from "../../masks/maskRenderer";

export const createEnvironmentRenderers = ({ templates }) => {
  const diagnosticPollutionConfigs = {
    noise: {
      key: "noise",
      sourceId: "noise-diagnostic",
      layerId: "noise-diagnostic-layer",
      paint: { "raster-opacity": 0.8 },
      legend: templates?.noise,
      ...createMaskedLocalImageRenderer({
        imagePath: "/data/noise_scenario_base.png",
        alpha: 0.8,
      }),
    },
    air: {
      key: "air",
      sourceId: "air-diagnostic",
      layerId: "air-diagnostic-layer",
      paint: { "raster-opacity": 0.8 },
      legend: templates?.air,
      ...createMaskedLocalImageRenderer({
        imagePath: "/data/no2_scenario_base.png",
        alpha: 0.85,
      }),
    },
  };

  const diagnosticHeatRenderer = createMaskedLocalImageRenderer({
    imagePath: "/data/temperature_air_2m_14h_actuel.png",
    alpha: 0.85,
  });

  const projectHeat2050Renderer = createMaskedLocalImageRenderer({
    imagePath: "/data/temperature_air_2m_14h_2060.png",
    alpha: 0.8,
  });

  const projectHeat2050ImprovedRenderer = createMaskedLocalImageRenderer({
    imagePath: "/data/temperature_air_2m_14h_2060_project.png",
    alpha: 0.8,
  });

  const projectNoiseBeforeRenderer = createMaskedLocalImageRenderer({
    imagePath: "/data/noise_scenario_base.png",
    alpha: 0.8,
  });

  const projectNoiseAfterRenderer = createMaskedLocalImageRenderer({
    imagePath: "/data/noise_scenario_project.png",
    alpha: 0.8,
  });

  const projectAirBeforeRenderer = createMaskedLocalImageRenderer({
    imagePath: "/data/no2_scenario_base.png",
    alpha: 0.85,
  });

  const projectAirAfterRenderer = createMaskedLocalImageRenderer({
    imagePath: "/data/no2_scenario_project.png",
    alpha: 0.85,
  });

  return {
    diagnosticPollutionConfigs,
    diagnosticHeatRenderer,
    projectHeat2050Renderer,
    projectHeat2050ImprovedRenderer,
    projectNoiseBeforeRenderer,
    projectNoiseAfterRenderer,
    projectAirBeforeRenderer,
    projectAirAfterRenderer,
  };
};
