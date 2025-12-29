import maplibregl from "maplibre-gl";
import { projectGeojson } from "../data/geojson/projectGeojson";
import { diagnosticGeojson } from "../data/geojson/diagnosticGeojson";
import { pollutionCanvasCoordinates } from "../masks/maskRenderer";
import { projectPoints } from "../data/projectPoints";
import { projectAnnotations } from "../data/projectAnnotations";
import { parkingDemoSteps } from "../data/parkingDemoSteps";
import { cloneFeature, collectCoordinates, computeBounds, createAreaAnnotator } from "../app/utils/geo";
import { pollutionLegendTemplates } from "../ui/templates/pollutionLegendTemplates";
import { renderSurfacePopup } from "../ui/molecules/surfacePopup";
import { createEnvironmentPanel } from "../ui/organisms/environmentPanel";
import { createFilterPanel } from "../ui/organisms/filterPanel";
import { setupPanelSections } from "../ui/organisms/panelSections";
import { createLayerControlPanel } from "../ui/organisms/layerControlPanel";
import { createLightboxController } from "../ui/organisms/lightbox";
import { createProjectPoiMarkers } from "../ui/organisms/projectPoiMarkers";
import { createProjectAnnotationMarkers as createAnnotationMarkersController } from "../ui/organisms/projectAnnotationMarkers";
import { createDetailsPanel } from "../ui/organisms/detailsPanel";
import { createEnvironmentController } from "./environmentController";
import { createLayerVisibilityController } from "./layerVisibilityController";
import { renderLakeRelationshipPopup } from "../ui/organisms/lakeRelationshipPopup";
import { createMobilePanelDrawer } from "../ui/organisms/mobilePanelDrawer";
import { createMobileLegendDrawer } from "../ui/organisms/mobileLegendDrawer";
import { createParkingDemo } from "../ui/organisms/parkingDemo";
import { renderProjectDetailsPanel, bindProjectDetailsPanel } from "../ui/organisms/projectDetailsPanel";
import { createEnvironmentRenderers } from "../ui/organisms/environmentRenderers";

export const initializeApp = () => {
  const {
    zoneCoords,
    focusZone,
    maskGeoJson,
    diagnosticAutoAxesPrimary,
    diagnosticAutoAxesSecondary,
    diagnosticAutoAxesTertiary,
    diagnosticLakeViews,
    diagnosticParkingSurfaces,
    diagnosticPrivateSpaces,
    projectAutoAxes,
  } = diagnosticGeojson;
  // Ces valeurs proviennent toutes des fichiers GeoJSON séparés : ça permet d’éviter d’avoir 1 000 lignes de coordonnées dans ce fichier.

  // Références DOM utilisées tout au long du fichier (légende, slider, boutons de filtres…).
  const noiseLegend = document.getElementById("noise-legend");
  const noiseLegendTitle = document.getElementById("noise-legend-title");
  const noiseLegendBody = document.getElementById("noise-legend-body");
  const legendToggleButton = document.getElementById("legend-toggle");
  const legendOverlay = document.getElementById("mobile-legend-overlay");
  const legendCloseButton = document.getElementById("noise-legend-close");
  const layerPanel = document.getElementById("layer-panel");
  const mobilePanelToggle = document.getElementById("mobile-panel-toggle");
  const mobilePanelOverlay = document.getElementById("mobile-panel-overlay");
  createMobilePanelDrawer({ panel: layerPanel, toggleButton: mobilePanelToggle, overlay: mobilePanelOverlay });
  const mobileLegendDrawer = createMobileLegendDrawer({
    legend: noiseLegend,
    toggleButton: legendToggleButton,
    overlay: legendOverlay,
    closeButton: legendCloseButton,
  });
  const projectIntentionsButton = document.querySelector('[data-action="project-intentions"]');
  const heatSliderContainer = document.getElementById("heat-slider");
  const heatSliderTitle = document.getElementById("heat-slider-title");
  const heatSliderMinLabel = document.getElementById("heat-slider-min-label");
  const heatSliderMaxLabel = document.getElementById("heat-slider-max-label");
  const heatSliderInput = document.getElementById("heat-slider-input");
  const heatSliderValueLabel = document.getElementById("heat-slider-value");
  const environmentPanel = createEnvironmentPanel({
    legendContainer: noiseLegend,
    legendTitle: noiseLegendTitle,
    legendBody: noiseLegendBody,
    sliderContainer: heatSliderContainer,
    sliderTitle: heatSliderTitle,
    sliderMinLabel: heatSliderMinLabel,
    sliderMaxLabel: heatSliderMaxLabel,
    sliderValueLabel: heatSliderValueLabel,
    sliderInput: heatSliderInput,
  });
  if (mobileLegendDrawer) {
    const baseSetLegendVisibility = environmentPanel.setLegendVisibility;
    environmentPanel.setLegendVisibility = (visible) => {
      baseSetLegendVisibility(visible);
      mobileLegendDrawer.handleLegendVisibility(visible);
    };
    mobileLegendDrawer.handleLegendVisibility(false);
  }
  // Ces boutons gèrent les filtres “en conséquence” pour diagnostic et projet.
  const filterButtons = Array.from(document.querySelectorAll(".filter-button"));
  const filterPanel = createFilterPanel({
    buttons: filterButtons,
    onBeforeToggle: () => closeActiveLakePopup(),
    onBeforeActivate: (group, _filterKey, helpers) => {
      if (group === "diagnostic") {
        helpers.resetGroup("project");
        clearProjectContext({ skipFilterReset: true });
      } else {
        helpers.resetGroup("diagnostic");
        clearDiagnosticContext({ skipFilterReset: true });
      }
    },
  });
  // Variables géographiques utilisées pour calculer des surfaces ou pour centrer la carte.
  const morgesCenter = [6.496, 46.509];
  const { annotatePolygonCollection } = createAreaAnnotator({ origin: morgesCenter });

  const projectFeatures = projectPoints.map((feature) =>
    cloneFeature(feature, {
      title: feature.properties?.title?.startsWith("Projet") ? feature.properties.title : `Projet – ${feature.properties?.title || ""}`,
    }),
  );

  const {
    diagnosticPollutionConfigs,
    diagnosticHeatRenderer,
    projectHeat2050Renderer,
    projectHeat2050ImprovedRenderer,
    projectNoiseBeforeRenderer,
    projectNoiseAfterRenderer,
    projectAirBeforeRenderer,
    projectAirAfterRenderer,
  } = createEnvironmentRenderers({ templates: pollutionLegendTemplates });

  const annotatedParking = annotatePolygonCollection(diagnosticParkingSurfaces);
  const annotatedPrivate = annotatePolygonCollection(diagnosticPrivateSpaces);
  const {
    projectParkingSurfaces,
    projectRoofsOverlay,
    projectSpacesOverlay,
    projectSpacesArrows,
    projectLakeOpenOverlay,
    projectLakeRenatureOverlay,
    projectDensityOverlay,
  } = projectGeojson;
  const projectAnnotatedParking = annotatePolygonCollection(projectParkingSurfaces);
  const projectAnnotatedRoofs = annotatePolygonCollection(projectRoofsOverlay);

  const bounds = (() => {
    const additionalCoords = collectCoordinates([
      { features: projectFeatures },
      diagnosticAutoAxesPrimary,
      diagnosticAutoAxesSecondary,
      diagnosticAutoAxesTertiary,
      projectAutoAxes,
      annotatedParking.data,
      projectAnnotatedParking.data,
      annotatedPrivate.data,
      diagnosticLakeViews,
    ]);
    return computeBounds([...zoneCoords, ...additionalCoords]);
  })();

  const orthoLayerTemplate = "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg";

  // Instanciation MapLibre avec notre style perso et les limites du périmètre.
  const map = new maplibregl.Map({
    container: "map",
    style: {
      version: 8,
      glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
      sources: {
        ortho: {
          type: "raster",
          tiles: [orthoLayerTemplate],
          tileSize: 256,
        },
      },
      layers: [{ id: "ortho", type: "raster", source: "ortho" }],
    },
    center: morgesCenter,
    zoom: 15,
    maxBounds: bounds,
    attributionControl: false,
  });

  const coordDisplay = document.getElementById("coord-display");
  const mapSourceLabel = document.getElementById("map-source");
  if (mapSourceLabel) mapSourceLabel.textContent = "Données cartographiques · swisstopo (WMTS)";
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");
  map.on("mousemove", (event) => {
    if (!coordDisplay) return;
    const { lng, lat } = event.lngLat.wrap();
    coordDisplay.textContent = `Lat ${lat.toFixed(5)} · Lng ${lng.toFixed(5)}`;
  });

  const lightboxController = createLightboxController({
    container: document.getElementById("media-lightbox"),
    imageElement: document.getElementById("lightbox-image"),
    frameElement: document.getElementById("lightbox-frame"),
    closeButton: document.getElementById("lightbox-close"),
  });
  const openLightbox = (url) => lightboxController.open(url);
  const closeLightbox = () => lightboxController.close();

  const detailsPanelController = createDetailsPanel({
    panel: document.getElementById("details-panel"),
    body: document.getElementById("details-body"),
    closeButton: document.getElementById("details-close"),
    onOpen: () => document.body.classList.add("details-open"),
    onClose: () => document.body.classList.remove("details-open"),
  });

  let closeParkingDemo = () => {};
  let startParkingDemo = () => {};

  // Panneau latéral “détails du projet” (réutilise le contenu des popups).
  const openDetailsPanel = (feature) => {
    detailsPanelController.open({
      render: () => renderProjectDetailsPanel(feature),
      bind: (container) => bindProjectDetailsPanel({ container, feature, openLightbox }),
    });
  };
  const closeDetailsPanel = () => detailsPanelController.close();

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDetailsPanel();
      closeLightbox();
      closeParkingDemo();
    }
  });

  // Boutons “Diagnostic / Projet” en haut : on mémorise l’état pour masquer les sections du panneau.
  const sectionButtons = document.querySelectorAll("[data-section-toggle]");
  setupPanelSections({ buttons: Array.from(sectionButtons) });

  // On prépare la gestion des checkboxes pour montrer/masquer les couches vectorielles.
  const layerInputs = Array.from(document.querySelectorAll("[data-layer]"));
  const diagnosticLayerKeys = ["diagnostic-axes", "diagnostic-parking", "diagnostic-private", "diagnostic-lake"];
  const projectLayerKeys = [
    "project-axes",
    "project-parking",
    "project-spaces",
    "project-lake-open",
    "project-lake-renature",
    "project-density",
    "project-roofs",
    "project-interventions",
  ];
  let layerControlPanel = null;

  let activeLakePopup = null;
  const closeActiveLakePopup = () => {
    if (!activeLakePopup) return;
    activeLakePopup.remove();
    activeLakePopup = null;
  };

  let projectMarkersController = null;
  let projectMarkersVisible = false;
  const setMarkersVisibility = (visible) => {
    projectMarkersVisible = visible;
    if (projectMarkersController) {
      projectMarkersController.setVisibility(visible);
    }
  };

  const layerVisibilityController = createLayerVisibilityController(map);
  const {
    setPerimeterVisibility,
    setDiagnosticAutoVisibility,
    setProjectAutoVisibility,
    setProjectParkingVisibility,
    setProjectSpacesVisibility,
    setProjectLakeOpenVisibility,
    setProjectLakeRenatureVisibility,
    setProjectRoofsVisibility,
    setProjectDensityVisibility,
    setProjectHeat2050Visibility,
    setProjectNoiseLayerVisibility,
    setProjectAirLayerVisibility,
    setDiagnosticParkingVisibility,
    setDiagnosticPrivateVisibility,
    setDiagnosticLakeVisibility,
    RASTER_MAX_OPACITY,
  } = layerVisibilityController;

  // Dictionnaire “clé de checkbox -> fonction à appeler” pour garder le code de binding compact.
  const layerHandlers = {
    perimeter: (checked) => setPerimeterVisibility(checked),
    "diagnostic-axes": (checked) => setDiagnosticAutoVisibility(checked),
    "diagnostic-parking": (checked) => setDiagnosticParkingVisibility(checked),
    "diagnostic-private": (checked) => setDiagnosticPrivateVisibility(checked),
    "diagnostic-lake": (checked) => setDiagnosticLakeVisibility(checked),
    "project-axes": (checked) => setProjectAutoVisibility(checked),
    "project-parking": (checked) => setProjectParkingVisibility(checked),
    "project-spaces": (checked) => setProjectSpacesVisibility(checked),
    "project-lake-open": (checked) => setProjectLakeOpenVisibility(checked),
    "project-lake-renature": (checked) => setProjectLakeRenatureVisibility(checked),
    "project-roofs": (checked) => setProjectRoofsVisibility(checked),
    "project-density": (checked) => setProjectDensityVisibility(checked),
    "project-interventions": (checked) => setMarkersVisibility(checked),
  };

  const environmentController = createEnvironmentController({
    map,
    environmentPanel,
    pollutionLegendTemplates,
    diagnosticPollutionConfigs,
    setProjectHeat2050Visibility,
    setProjectNoiseLayerVisibility,
    setProjectAirLayerVisibility,
    onProjectModeChange: (mode) => updateProjectAnnotationVisibility(mode),
  });
  const {
    filterDefinitions,
    resetProjectStates,
    resetDiagnosticState,
    setDiagnosticPollutionMode,
  } = environmentController;

  filterPanel.registerDefinitions(filterDefinitions);
  filterPanel.bindButtons();

  const deselectLayerGroup = (keys = []) => {
    if (!layerControlPanel) return;
    layerControlPanel.deselectGroup(keys);
  };


  // Petite fonction utilitaire pour tout remettre à zéro côté “projet” (couches, sliders, boutons actifs).
  const clearProjectContext = ({ skipFilterReset = false } = {}) => {
    deselectLayerGroup(projectLayerKeys);
    if (!skipFilterReset) filterPanel.resetGroup("project");
    resetProjectStates();
  };

  const clearDiagnosticContext = ({ skipFilterReset = false } = {}) => {
    deselectLayerGroup(diagnosticLayerKeys);
    if (!skipFilterReset) filterPanel.resetGroup("diagnostic");
    resetDiagnosticState();
  };

  layerControlPanel = createLayerControlPanel({
    inputs: layerInputs,
    layerHandlers,
    diagnosticKeys: diagnosticLayerKeys,
    projectKeys: projectLayerKeys,
    onBeforeToggle: () => closeActiveLakePopup(),
    onExclusivity: (group) => {
      if (group === "diagnostic") {
        clearProjectContext();
      } else if (group === "project") {
        clearDiagnosticContext();
      }
    },
  });
  layerControlPanel.bind();
  const getLayerInput = (key) => layerControlPanel?.getInput(key);

  // Beaucoup de DOM refs pour la démo, on les charge ici pour éviter de tout redemander plus bas.
  const parkingDemoButton = document.querySelector('[data-action="parking-demo"]');
  const parkingDemoOverlay = document.getElementById("parking-demo");
  const parkingDemoTabs = document.getElementById("parking-demo-tabs");
  const parkingDemoBody = document.getElementById("parking-demo-body");
  const parkingDemoClose = document.getElementById("parking-demo-close");
  const parkingDemoAction = document.getElementById("parking-demo-action");

  const parkingDemoController = createParkingDemo({
    overlay: parkingDemoOverlay,
    tabsContainer: parkingDemoTabs,
    bodyContainer: parkingDemoBody,
    closeButton: parkingDemoClose,
    actionButton: parkingDemoAction,
    steps: parkingDemoSteps,
  });

  startParkingDemo = () => parkingDemoController.open();
  closeParkingDemo = () => parkingDemoController.close();

  parkingDemoButton?.addEventListener("click", () => startParkingDemo());

  // Petites annotations textuelles qui apparaissent quand on active les scénarios projet (définies dans src/data/projectAnnotations).
  let projectAnnotationsController = null;
  const updateProjectAnnotationVisibility = (mode = "none") => {
    if (!projectAnnotationsController) return;
    projectAnnotationsController.setVisibleMode(mode || "none");
  };

  const hideBaseIcons = () => {
    const style = map.getStyle();
    if (!style?.layers) return;
    style.layers
      .filter((layer) => layer.type === "symbol" && layer.layout && layer.layout["icon-image"])
      .forEach((layer) => map.setLayoutProperty(layer.id, "visibility", "none"));
  };

  // Tout ce qui touche aux sources/couches MapLibre est regroupé dans ce callback “load”.
  map.on("load", () => {
    map.fitBounds(bounds, { padding: 40, duration: 0 });

    map.addSource("focus-zone", { type: "geojson", data: focusZone });
    map.addSource("focus-mask", { type: "geojson", data: maskGeoJson });
    map.addSource("diagnostic-auto-1", { type: "geojson", data: diagnosticAutoAxesPrimary });
    map.addSource("diagnostic-auto-2", { type: "geojson", data: diagnosticAutoAxesSecondary });
    map.addSource("diagnostic-auto-3", { type: "geojson", data: diagnosticAutoAxesTertiary });
    map.addSource("project-auto", { type: "geojson", data: projectAutoAxes });
    map.addSource("diagnostic-parking", { type: "geojson", data: annotatedParking.data });
    map.addSource("diagnostic-private", { type: "geojson", data: annotatedPrivate.data });
    map.addSource("project-parking", { type: "geojson", data: projectAnnotatedParking.data });
    map.addSource("project-spaces-overlay", { type: "geojson", data: projectSpacesOverlay });
    map.addSource("project-space-arrows", { type: "geojson", data: projectSpacesArrows });
    map.addSource("project-lake-open", { type: "geojson", data: projectLakeOpenOverlay });
    map.addSource("project-lake-renature", { type: "geojson", data: projectLakeRenatureOverlay });
    map.addSource("project-roofs", { type: "geojson", data: projectAnnotatedRoofs.data });
    map.addSource("project-density", { type: "geojson", data: projectDensityOverlay });
    map.addSource("diagnostic-lake", { type: "geojson", data: diagnosticLakeViews });
    map.addSource("diagnostic-heat-raster", {
      type: "canvas",
      canvas: diagnosticHeatRenderer.canvas,
      coordinates: pollutionCanvasCoordinates,
    });
    map.addSource("project-heat2050", {
      type: "canvas",
      canvas: projectHeat2050Renderer.canvas,
      coordinates: pollutionCanvasCoordinates,
    });
    map.addSource("project-heat2050-improved", {
      type: "canvas",
      canvas: projectHeat2050ImprovedRenderer.canvas,
      coordinates: pollutionCanvasCoordinates,
    });
    map.addSource("project-noise-before", {
      type: "canvas",
      canvas: projectNoiseBeforeRenderer.canvas,
      coordinates: pollutionCanvasCoordinates,
    });
    map.addSource("project-noise-after", {
      type: "canvas",
      canvas: projectNoiseAfterRenderer.canvas,
      coordinates: pollutionCanvasCoordinates,
    });
    map.addSource("project-air-before", {
      type: "canvas",
      canvas: projectAirBeforeRenderer.canvas,
      coordinates: pollutionCanvasCoordinates,
    });
    map.addSource("project-air-after", {
      type: "canvas",
      canvas: projectAirAfterRenderer.canvas,
      coordinates: pollutionCanvasCoordinates,
    });
    Object.values(diagnosticPollutionConfigs).forEach((config) => {
      map.addSource(config.sourceId, {
        type: "canvas",
        canvas: config.canvas,
        coordinates: pollutionCanvasCoordinates,
      });
    });
    diagnosticHeatRenderer.draw(map);
    projectHeat2050Renderer.draw(map);
    projectHeat2050ImprovedRenderer.draw(map);
    projectNoiseBeforeRenderer.draw(map);
    projectNoiseAfterRenderer.draw(map);
    projectAirBeforeRenderer.draw(map);
    projectAirAfterRenderer.draw(map);
    map.addLayer({
      id: "focus-zone-layer",
      type: "line",
      source: "focus-zone",
      layout: { visibility: "none" },
      paint: {
        "line-color": "#ffffff",
        "line-width": 2,
        "line-dasharray": [2, 2],
      },
    });
    map.addLayer({
      id: "focus-mask-layer",
      type: "fill",
      source: "focus-mask",
      paint: {
        "fill-color": "rgba(15, 23, 42, 0)",
        "fill-opacity": 0,
      },
      layout: { visibility: "none" },
    });
    map.addLayer({
      id: "diagnostic-auto-1-layer",
      type: "line",
      source: "diagnostic-auto-1",
      layout: { visibility: "none" },
      paint: {
        "line-color": "#ff2d2d",
        "line-width": 4,
        "line-opacity": 0.9,
      },
    });
    map.addLayer({
      id: "diagnostic-auto-2-layer",
      type: "line",
      source: "diagnostic-auto-2",
      layout: { visibility: "none" },
      paint: {
        "line-color": "#ff2d2d",
        "line-width": 4,
        "line-opacity": 0.9,
      },
    });
    map.addLayer({
      id: "diagnostic-auto-3-layer",
      type: "line",
      source: "diagnostic-auto-3",
      layout: { visibility: "none" },
      paint: {
        "line-color": "#ff2d2d",
        "line-width": 4,
        "line-opacity": 0.9,
      },
    });
    map.addLayer({
      id: "diagnostic-auto-1-arrow-layer",
      type: "symbol",
      source: "diagnostic-auto-1",
      layout: {
        visibility: "none",
        "symbol-placement": "line",
        "symbol-spacing": 80,
        "text-field": "▶",
        "text-size": 14,
        "text-keep-upright": false,
        "text-rotation-alignment": "map",
      },
      paint: {
        "text-color": "#ffe0e0",
        "text-halo-color": "rgba(11, 23, 42, 0.75)",
        "text-halo-width": 1,
      },
    });
    map.addLayer({
      id: "diagnostic-auto-2-arrow-layer",
      type: "symbol",
      source: "diagnostic-auto-2",
      layout: {
        visibility: "none",
        "symbol-placement": "line",
        "symbol-spacing": 80,
        "text-field": "▶",
        "text-size": 14,
        "text-keep-upright": false,
        "text-rotation-alignment": "map",
      },
      paint: {
        "text-color": "#ffe0e0",
        "text-halo-color": "rgba(11, 23, 42, 0.75)",
        "text-halo-width": 1,
      },
    });
    map.addLayer({
      id: "diagnostic-auto-3-arrow-layer",
      type: "symbol",
      source: "diagnostic-auto-3",
      layout: {
        visibility: "none",
        "symbol-placement": "line",
        "symbol-spacing": 80,
        "text-field": "▶",
        "text-size": 14,
        "text-keep-upright": false,
        "text-rotation-alignment": "map",
      },
      paint: {
        "text-color": "#ffe0e0",
        "text-halo-color": "rgba(11, 23, 42, 0.75)",
        "text-halo-width": 1,
      },
    });
    map.addLayer({
      id: "diagnostic-heat-raster-layer",
      type: "raster",
      source: "diagnostic-heat-raster",
      layout: { visibility: "none" },
      paint: {
        "raster-opacity": 0.8,
      },
    });
    map.addLayer({
      id: "project-heat2050-layer",
      type: "raster",
      source: "project-heat2050",
      layout: { visibility: "none" },
      paint: {
        "raster-opacity": 0.8,
      },
    });
    map.addLayer({
      id: "project-heat2050-improved-layer",
      type: "raster",
      source: "project-heat2050-improved",
      layout: { visibility: "none" },
      paint: {
        "raster-opacity": 0.8,
      },
    });
    map.addLayer({
      id: "project-noise-before-layer",
      type: "raster",
      source: "project-noise-before",
      layout: { visibility: "none" },
      paint: {
        "raster-opacity": 0.8,
      },
    });
    map.addLayer({
      id: "project-noise-after-layer",
      type: "raster",
      source: "project-noise-after",
      layout: { visibility: "none" },
      paint: {
        "raster-opacity": 0.8,
      },
    });
    map.addLayer({
      id: "project-air-before-layer",
      type: "raster",
      source: "project-air-before",
      layout: { visibility: "none" },
      paint: {
        "raster-opacity": 0.8,
      },
    });
    map.addLayer({
      id: "project-air-after-layer",
      type: "raster",
      source: "project-air-after",
      layout: { visibility: "none" },
      paint: {
        "raster-opacity": 0.8,
      },
    });
    map.addLayer({
      id: "project-auto-line-layer",
      type: "line",
      source: "project-auto",
      layout: { visibility: "none" },
      paint: {
        "line-color": "#ff2d2d",
        "line-width": 4,
        "line-opacity": 0.9,
      },
    });
    map.addLayer({
      id: "project-auto-arrow-layer",
      type: "symbol",
      source: "project-auto",
      layout: {
        visibility: "none",
        "symbol-placement": "line",
        "symbol-spacing": 80,
        "text-field": "▶",
        "text-size": 14,
        "text-keep-upright": false,
        "text-rotation-alignment": "map",
      },
      paint: {
        "text-color": "#ffe0e0",
        "text-halo-color": "rgba(11, 23, 42, 0.75)",
        "text-halo-width": 1,
      },
    });
    map.addLayer({
      id: "diagnostic-parking-fill",
      type: "fill",
      source: "diagnostic-parking",
      layout: { visibility: "none" },
      paint: {
        "fill-color": "#f59e0b",
        "fill-opacity": 0.45,
      },
    });
    map.addLayer({
      id: "diagnostic-parking-outline",
      type: "line",
      source: "diagnostic-parking",
      layout: { visibility: "none" },
      paint: {
        "line-color": "#fbbf24",
        "line-width": 1.2,
      },
    });
    map.addLayer({
      id: "project-parking-fill",
      type: "fill",
      source: "project-parking",
      layout: { visibility: "none" },
      paint: {
        "fill-color": "#006affff",
        "fill-opacity": 0.5,
      },
    });
    map.addLayer({
      id: "project-parking-outline",
      type: "line",
      source: "project-parking",
      layout: { visibility: "none" },
      paint: {
        "line-color": "#006affff",
        "line-width": 1.4,
      },
    });
    map.addLayer({
      id: "project-spaces-fill",
      type: "fill",
      source: "project-spaces-overlay",
      layout: { visibility: "none" },
      paint: {
        "fill-color": "#f472b6",
        "fill-opacity": 0.45,
      },
    });
    map.addLayer({
      id: "project-spaces-outline",
      type: "line",
      source: "project-spaces-overlay",
      layout: { visibility: "none" },
      paint: {
        "line-color": "#be185d",
        "line-width": 2.5,
      },
    });
    map.addLayer({
      id: "project-space-arrows",
      type: "line",
      source: "project-space-arrows",
      layout: { visibility: "none", "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": "#f472b6",
        "line-width": 5,
      },
    });
    map.addLayer({
      id: "project-lake-open-fill",
      type: "fill",
      source: "project-lake-open",
      layout: { visibility: "none" },
      paint: {
        "fill-color": "#0ea5e9",
        "fill-opacity": 0.4,
      },
    });
    map.addLayer({
      id: "project-lake-open-outline",
      type: "line",
      source: "project-lake-open",
      layout: { visibility: "none" },
      paint: {
        "line-color": "#06b6d4",
        "line-width": 1.8,
      },
    });
    map.addLayer({
      id: "project-lake-renature-fill",
      type: "fill",
      source: "project-lake-renature",
      layout: { visibility: "none" },
      paint: {
        "fill-color": "#34d399",
        "fill-opacity": 0.45,
      },
    });
    map.addLayer({
      id: "project-lake-renature-outline",
      type: "line",
      source: "project-lake-renature",
      layout: { visibility: "none" },
      paint: {
        "line-color": "#10b981",
        "line-width": 1.8,
      },
    });
    map.addLayer({
      id: "project-roofs-fill",
      type: "fill",
      source: "project-roofs",
      layout: { visibility: "none" },
      paint: {
        "fill-color": "#a3e635",
        "fill-opacity": 0.45,
      },
    });
    map.addLayer({
      id: "project-roofs-outline",
      type: "line",
      source: "project-roofs",
      layout: { visibility: "none" },
      paint: {
        "line-color": "#65a30d",
        "line-width": 1.2,
      },
    });
    map.addLayer({
      id: "project-density-outline",
      type: "line",
      source: "project-density",
      layout: { visibility: "none" },
      paint: {
        "line-color": "#f97316",
        "line-width": 2,
        "line-dasharray": [1.5, 1.5],
      },
    });
    map.addLayer({
      id: "diagnostic-private-fill",
      type: "fill",
      source: "diagnostic-private",
      layout: { visibility: "none" },
      paint: {
        "fill-color": "#15803d",
        "fill-opacity": 0.4,
      },
    });
    map.addLayer({
      id: "diagnostic-private-outline",
      type: "line",
      source: "diagnostic-private",
      layout: { visibility: "none" },
      paint: {
        "line-color": "#22c55e",
        "line-width": 1.2,
      },
    });

    map.addLayer({
      id: "diagnostic-lake-fill",
      type: "fill",
      source: "diagnostic-lake",
      layout: { visibility: "none" },
      paint: {
        "fill-color": "#38bdf8",
        "fill-opacity": 0.35,
      },
    });
    map.addLayer({
      id: "diagnostic-lake-outline",
      type: "line",
      source: "diagnostic-lake",
      layout: { visibility: "none" },
      paint: {
        "line-color": "#0ea5e9",
        "line-width": 1.5,
        "line-dasharray": [1, 1.5],
      },
    });
    Object.values(diagnosticPollutionConfigs).forEach((config) => {
      map.addLayer(
        {
          id: config.layerId,
          type: "raster",
          source: config.sourceId,
          layout: { visibility: "none" },
          paint: config.paint,
        },
        "focus-mask-layer",
      );
      config.draw(map);
    });
    setDiagnosticPollutionMode("none");

    const formatArea = (value) => new Intl.NumberFormat("fr-CH").format(Math.round(value));
    const registerSurfacePopup = (layerId, totalArea, label) => {
      map.on("click", layerId, (event) => {
        const feature = event.features?.[0];
        if (!feature) return;
        const area = Number(feature.properties?.areaSqm || 0);
        new maplibregl.Popup({ closeButton: false, maxWidth: "280px" })
          .setLngLat(event.lngLat)
          .setHTML(renderSurfacePopup({ label, area, totalArea, formatValue: formatArea }))
          .addTo(map);
      });
      map.on("mouseenter", layerId, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", layerId, () => {
        map.getCanvas().style.cursor = "";
      });
    };

    registerSurfacePopup("diagnostic-parking-fill", annotatedParking.totalArea, "Espaces dédiés au stationnement");
    registerSurfacePopup("project-parking-fill", projectAnnotatedParking.totalArea, "Espaces dédiés au stationnement (projet)");
    registerSurfacePopup("diagnostic-private-fill", annotatedPrivate.totalArea, "Espaces privés d’intérêt");
    registerSurfacePopup("project-roofs-fill", projectAnnotatedRoofs.totalArea, "Toitures végétalisables (projet)");

    const registerLakePopup = (layerId) => {
      map.on("click", layerId, (event) => {
        const feature = event.features?.[0];
        if (!feature) return;
        const { title, description, image } = feature.properties || {};
        closeActiveLakePopup();
        activeLakePopup = new maplibregl.Popup({ closeButton: false, maxWidth: "320px" })
          .setLngLat(event.lngLat)
          .setHTML(renderLakeRelationshipPopup({ title, description, image }))
          .addTo(map);
      });
      map.on("mouseenter", layerId, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", layerId, () => {
        map.getCanvas().style.cursor = "";
      });
    };

    registerLakePopup("diagnostic-lake-fill");
    projectMarkersController = createProjectPoiMarkers({
      map,
      features: projectFeatures,
      onSelect: (feature) => {
        map.stop();
        openDetailsPanel(feature);
      },
    });
    setMarkersVisibility(projectMarkersVisible);
    projectAnnotationsController = createAnnotationMarkersController({
      map,
      annotationsByMode: projectAnnotations,
    });
    updateProjectAnnotationVisibility();

    const refreshStyleOverlays = () => {
      hideBaseIcons();
      const projectSpacesInput = getLayerInput("project-spaces");
      const visible = Boolean(projectSpacesInput?.checked);
      setProjectSpacesVisibility(visible);
      const lakeOpenInput = getLayerInput("project-lake-open");
      setProjectLakeOpenVisibility(Boolean(lakeOpenInput?.checked));
      const lakeRenatureInput = getLayerInput("project-lake-renature");
      setProjectLakeRenatureVisibility(Boolean(lakeRenatureInput?.checked));
      const roofInput = getLayerInput("project-roofs");
      setProjectRoofsVisibility(Boolean(roofInput?.checked));
      const densityInput = getLayerInput("project-density");
      setProjectDensityVisibility(Boolean(densityInput?.checked));
    };
    refreshStyleOverlays();
    map.on("styledata", refreshStyleOverlays);
  });

  projectIntentionsButton?.addEventListener("click", () => {
    console.info("Bouton intentions cliqué — contenu à définir.");
  });
};
