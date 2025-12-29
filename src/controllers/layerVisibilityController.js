export const createLayerVisibilityController = (map) => {
  const RASTER_MAX_OPACITY = 0.8;
  const setVisibilityForIds = (ids = [], visible) => {
    ids.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
      }
    });
  };

  const diagnosticAutoLineLayerIds = ["diagnostic-auto-1-layer", "diagnostic-auto-2-layer", "diagnostic-auto-3-layer"];
  const diagnosticAutoArrowLayerIds = ["diagnostic-auto-1-arrow-layer", "diagnostic-auto-2-arrow-layer", "diagnostic-auto-3-arrow-layer"];
  const projectAutoLineLayerIds = ["project-auto-line-layer"];
  const projectAutoArrowLayerIds = ["project-auto-arrow-layer"];
  const projectParkingLayerIds = ["project-parking-fill", "project-parking-outline"];
  const projectSpacesLayerIds = ["project-spaces-fill", "project-spaces-outline", "project-space-arrows"];
  const projectLakeOpenLayerIds = ["project-lake-open-fill", "project-lake-open-outline"];
  const projectLakeRenatureLayerIds = ["project-lake-renature-fill", "project-lake-renature-outline"];
  const projectRoofsLayerIds = ["project-roofs-fill", "project-roofs-outline"];
  const projectDensityLayerIds = ["project-density-outline"];
  const projectNoiseLayerIds = ["project-noise-before-layer", "project-noise-after-layer"];
  const projectAirLayerIds = ["project-air-before-layer", "project-air-after-layer"];
  const diagnosticParkingLayerIds = ["diagnostic-parking-fill", "diagnostic-parking-outline"];
  const diagnosticPrivateLayerIds = ["diagnostic-private-fill", "diagnostic-private-outline"];
  const diagnosticLakeLayerIds = ["diagnostic-lake-fill", "diagnostic-lake-outline"];

  const setPerimeterVisibility = (visible) => {
    ["focus-zone-layer", "focus-mask-layer"].forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
      }
    });
  };

  const setProjectHeat2050Visibility = (visible) => {
    ["project-heat2050-layer", "project-heat2050-improved-layer"].forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
        if (!visible) {
          map.setPaintProperty(layerId, "raster-opacity", layerId.endsWith("improved-layer") ? 0 : RASTER_MAX_OPACITY);
        }
      }
    });
  };

  const setProjectNoiseLayerVisibility = (visible) => {
    projectNoiseLayerIds.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
        if (!visible) {
          map.setPaintProperty(layerId, "raster-opacity", 0);
        } else if (layerId.endsWith("before-layer")) {
          map.setPaintProperty(layerId, "raster-opacity", RASTER_MAX_OPACITY);
        } else {
          map.setPaintProperty(layerId, "raster-opacity", 0);
        }
      }
    });
  };

  const setProjectAirLayerVisibility = (visible) => {
    projectAirLayerIds.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
        if (!visible) {
          map.setPaintProperty(layerId, "raster-opacity", layerId.endsWith("after-layer") ? 0 : RASTER_MAX_OPACITY);
        } else if (layerId.endsWith("before-layer")) {
          map.setPaintProperty(layerId, "raster-opacity", RASTER_MAX_OPACITY);
        } else {
          map.setPaintProperty(layerId, "raster-opacity", 0);
        }
      }
    });
  };

  return {
    setPerimeterVisibility,
    setDiagnosticAutoVisibility: (visible) => setVisibilityForIds([...diagnosticAutoLineLayerIds, ...diagnosticAutoArrowLayerIds], visible),
    setProjectAutoVisibility: (visible) => setVisibilityForIds([...projectAutoLineLayerIds, ...projectAutoArrowLayerIds], visible),
    setProjectParkingVisibility: (visible) => setVisibilityForIds(projectParkingLayerIds, visible),
    setProjectSpacesVisibility: (visible) => setVisibilityForIds(projectSpacesLayerIds, visible),
    setProjectLakeOpenVisibility: (visible) => setVisibilityForIds(projectLakeOpenLayerIds, visible),
    setProjectLakeRenatureVisibility: (visible) => setVisibilityForIds(projectLakeRenatureLayerIds, visible),
    setProjectRoofsVisibility: (visible) => setVisibilityForIds(projectRoofsLayerIds, visible),
    setProjectDensityVisibility: (visible) => setVisibilityForIds(projectDensityLayerIds, visible),
    setProjectHeat2050Visibility,
    setProjectNoiseLayerVisibility,
    setProjectAirLayerVisibility,
    setDiagnosticParkingVisibility: (visible) => setVisibilityForIds(diagnosticParkingLayerIds, visible),
    setDiagnosticPrivateVisibility: (visible) => setVisibilityForIds(diagnosticPrivateLayerIds, visible),
    setDiagnosticLakeVisibility: (visible) => setVisibilityForIds(diagnosticLakeLayerIds, visible),
    RASTER_MAX_OPACITY,
  };
};
