import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

window.addEventListener("DOMContentLoaded", () => {
  const morgesCenter = [6.496, 46.509];

  const rawProjetFeatures = [
    {
      id: 1,
      type: "Feature",
      geometry: { type: "Point", coordinates: [6.501173649086801, 46.509627396869014] },
      properties: {
        title: "Déplacement des quais et transformation en plage",
        description: "Description à compléter.",
        images: ["https://placekitten.com/400/240", "https://placekitten.com/401/240"],
      },
    },
    {
      id: 2,
      type: "Feature",
      geometry: { type: "Point", coordinates: [6.501393097261323, 46.51102600956074] },
      properties: {
        title: "Déplacement des quais et transformation en plage",
        description:
          "Le projet propose de déplacer les quais plus en amont dans la baie afin de libérer le front lacustre et de le transformer en une grande plage publique. Cette intervention mettrait en valeur la géographie particulière de la baie de Morges et offrirait un accès direct et généreux au lac pour les habitant·e·s, les visiteur·euse·s et les usagers des promenades. La nouvelle plage deviendrait un espace central de détente, de baignade et de sociabilité, en continuité avec les quais réaménagés et les parcours piétons existants.",
        images: ["https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/ref_rives_I-1.png"],
      },
    },
    { id: 3, type: "Feature", geometry: { type: "Point", coordinates: [6.501999472118144, 46.51032553330137] }, properties: { title: "Point 3", description: "Description à compléter.", images: [] } },
    { id: 4, type: "Feature", geometry: { type: "Point", coordinates: [6.500648172917296, 46.50993521909845] }, properties: { title: "Point 4", description: "Description à compléter.", images: [] } },
    { id: 5, type: "Feature", geometry: { type: "Point", coordinates: [6.498168462480993, 46.50899805879923] }, properties: { title: "Point 5", description: "Description à compléter.", images: [] } },
    { id: 6, type: "Feature", geometry: { type: "Point", coordinates: [6.498868117689945, 46.508632163109276] }, properties: { title: "Point 6", description: "Description à compléter.", images: [] } },
    { id: 7, type: "Feature", geometry: { type: "Point", coordinates: [6.499552002131644, 46.50811525597903] }, properties: { title: "Point 7", description: "Description à compléter.", images: [] } },
    { id: 8, type: "Feature", geometry: { type: "Point", coordinates: [6.497160843948601, 46.50706604124388] }, properties: { title: "Point 8", description: "Description à compléter.", images: [] } },
    { id: 9, type: "Feature", geometry: { type: "Point", coordinates: [6.496842475479566, 46.50931757070339] }, properties: { title: "Point 9", description: "Description à compléter.", images: [] } },
    { id: 10, type: "Feature", geometry: { type: "Point", coordinates: [6.496824972852992, 46.510215603310755] }, properties: { title: "Point 10", description: "Description à compléter.", images: [] } },
  ];

  const zoneCoords = [
    [6.496428089845968, 46.505720246977845],
    [6.495422645545607, 46.506410726171772],
    [6.496657911779806, 46.507311558309034],
    [6.4961305547527, 46.50779493148643],
    [6.496141534861831, 46.50825014673682],
    [6.496132167552963, 46.508601123580739],
    [6.495978805511734, 46.508840838349258],
    [6.495893896186166, 46.508974219930295],
    [6.49600857141811, 46.509061915756938],
    [6.496177916700713, 46.50908212081503],
    [6.496354206270263, 46.509471279461728],
    [6.496679373990847, 46.510214752038422],
    [6.497355327250958, 46.510788679214947],
    [6.497890521361452, 46.511172793333039],
    [6.498408477004381, 46.511273983402695],
    [6.498907917965965, 46.511273945161371],
    [6.499063645764654, 46.511367854131102],
    [6.499332058888355, 46.511753567898104],
    [6.499901468157285, 46.511584096852559],
    [6.499910398748741, 46.511101285984132],
    [6.501125922474875, 46.510911988004942],
    [6.501225729251705, 46.511103102338197],
    [6.501471609318094, 46.511428265125865],
    [6.501905666676305, 46.511280985648682],
    [6.502402586617334, 46.511000127254853],
    [6.50250339800081, 46.510672989534228],
    [6.50248831109936, 46.510396429407443],
    [6.502117187827048, 46.509787911107736],
    [6.501171045650843, 46.507966718445545],
    [6.499748334702972, 46.506964924648635],
    [6.499285242087422, 46.506007997693146],
    [6.497913015033828, 46.505261414867121],
    [6.496976580415872, 46.505219502004437],
    [6.496428089845968, 46.505720246977845],
  ];

  const focusZone = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "Dessin" },
        geometry: { type: "Polygon", coordinates: [zoneCoords] },
      },
    ],
  };

  const maskGeoJson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-180, -90],
              [180, -90],
              [180, 90],
              [-180, 90],
              [-180, -90],
            ],
            zoneCoords.slice().reverse(),
          ],
        },
      },
    ],
  };

  const cloneFeature = (feature, overrides = {}) => ({
    ...feature,
    geometry: { ...feature.geometry, coordinates: [...feature.geometry.coordinates] },
    properties: { ...feature.properties, ...overrides },
  });

  const diagnosticFeatures = [];

  const projetFeatures = rawProjetFeatures.map((feature) =>
    cloneFeature(feature, {
      title: feature.properties.title.startsWith("Projet") ? feature.properties.title : `Projet – ${feature.properties.title}`,
      description: feature.properties.description
        ? `Vision projet : ${feature.properties.description}`
        : "Vision projet à préciser.",
    }),
  );

  const buildCollection = (features) => ({ type: "FeatureCollection", features });

  const scenarios = {
    diagnostic: {
      label: "Diagnostic",
      poiGeoJson: buildCollection(diagnosticFeatures),
      focusZone,
      maskGeoJson,
    },
    projet: {
      label: "Projet",
      poiGeoJson: buildCollection(projetFeatures),
      focusZone,
      maskGeoJson,
    },
  };

  const scenarioLayers = {
    diagnostic: [
      { id: "perimeter", label: "Périmètre", iconClass: "square" },
    ],
    projet: [
      { id: "interventions", label: "Interventions prévues", iconClass: "point" },
      { id: "perimeter", label: "Périmètre", iconClass: "square" },
    ],
  };

  const toggleStates = {
    diagnostic: { perimeter: true },
    projet: { interventions: true, perimeter: true },
  };

  const bounds = (() => {
    const coords = [morgesCenter];
    Object.values(scenarios).forEach((scenario) => {
      scenario.poiGeoJson.features.forEach((feature) => coords.push(feature.geometry.coordinates));
    });
    const lngs = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);
    const buffer = 0.02;
    return [
      [Math.min(...lngs) - buffer, Math.min(...lats) - buffer],
      [Math.max(...lngs) + buffer, Math.max(...lats) + buffer],
    ];
  })();

  const orthoLayerTemplate = "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg";

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
  });

  const coordDisplay = document.getElementById("coord-display");
  const layerToggleList = document.getElementById("layer-toggle-list");
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");
  map.on("mousemove", (event) => {
    if (!coordDisplay) return;
    const { lng, lat } = event.lngLat.wrap();
    coordDisplay.textContent = `Lat ${lat.toFixed(5)} · Lng ${lng.toFixed(5)}`;
  });

  const detailsPanel = document.getElementById("details-panel");
  const detailsBody = document.getElementById("details-body");
  const detailsCloseBtn = document.getElementById("details-close");
  const lightbox = document.getElementById("media-lightbox");
  const lightboxImg = document.getElementById("lightbox-image");
  const lightboxFrame = document.getElementById("lightbox-frame");
  const lightboxCloseBtn = document.getElementById("lightbox-close");

  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "avif", "heic", "heif"];

  const closeLightbox = () => {
    lightbox?.classList.remove("visible");
    if (lightboxImg) {
      lightboxImg.src = "";
      lightboxImg.style.display = "none";
    }
    if (lightboxFrame) {
      lightboxFrame.src = "";
      lightboxFrame.style.display = "none";
    }
  };

  const openLightbox = (url) => {
    if (!url || !lightbox) return;
    const clean = url.split("#")[0];
    const ext = clean.split("?")[0].split(".").pop()?.toLowerCase();
    const isImage = ext && imageExtensions.includes(ext);

    if (isImage && lightboxImg) {
      lightboxImg.src = url;
      lightboxImg.style.display = "block";
      if (lightboxFrame) lightboxFrame.style.display = "none";
    } else if (lightboxFrame) {
      lightboxFrame.src = url;
      lightboxFrame.style.display = "block";
      if (lightboxImg) lightboxImg.style.display = "none";
    } else {
      window.open(url, "_blank");
      return;
    }

    lightbox.classList.add("visible");
  };

  lightboxCloseBtn?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  const closeDetailsPanel = () => {
    detailsPanel?.classList.remove("visible");
    document.body.classList.remove("details-open");
  };

  const renderPopupContent = (feature) => {
    const { id = feature.properties.title || "poi", title = "Point", description = "", images = [] } = feature.properties;
    const comments = (() => {
      try {
        return JSON.parse(localStorage.getItem(`comments-${id}`) || "[]");
      } catch {
        return [];
      }
    })();

    const carousel = images.length
      ? `
        <div class="popup-carousel" data-id="${id}">
          <img src="${images[0]}" alt="" />
          ${images.length > 1 ? '<button class="prev" aria-label="Image précédente">&#8249;</button><button class="next" aria-label="Image suivante">&#8250;</button>' : ""}
        </div>
      `
      : "";

    const commentsList = comments.length ? comments.map((c) => `<li>${c}</li>`).join("") : "<li>Aucun commentaire pour l'instant.</li>";

    return `
      <div class="popup-content" data-poi-id="${id}">
        <h3>${title}</h3>
        ${description ? `<p>${description}</p>` : ""}
        ${carousel}
        <div class="popup-comments">
          <strong style="font-size:13px;">Commentaires</strong>
          <ul>${commentsList}</ul>
          <textarea placeholder="Ajouter un commentaire..."></textarea>
          <button type="button">Publier</button>
        </div>
      </div>
    `;
  };

  const bindPopupInteractions = (container, feature) => {
    const { id = feature.properties.title || "poi", images = [] } = feature.properties;
    const el = container || document.querySelector(".popup-content");
    if (!el) return;

    if (images.length > 1) {
      const carousel = el.querySelector(".popup-carousel");
      const img = carousel?.querySelector("img");
      let current = 0;
      const updateImg = () => {
        if (img) img.src = images[current];
      };
      const attachZoom = (node) => {
        if (!node) return;
        node.style.cursor = "zoom-in";
        node.addEventListener("click", () => openLightbox(images[current]));
      };
      attachZoom(img);
      carousel?.querySelector(".prev")?.addEventListener("click", () => {
        current = (current - 1 + images.length) % images.length;
        updateImg();
      });
      carousel?.querySelector(".next")?.addEventListener("click", () => {
        current = (current + 1) % images.length;
        updateImg();
      });
      carousel?.addEventListener("dblclick", () => openLightbox(images[current]));
    } else if (images.length === 1) {
      const img = el.querySelector(".popup-carousel img");
      if (img) {
        img.style.cursor = "zoom-in";
        img.addEventListener("click", () => openLightbox(images[0]));
      }
    }

    const textarea = el.querySelector("textarea");
    const btn = el.querySelector(".popup-comments button");
    const list = el.querySelector(".popup-comments ul");

    const refreshComments = () => {
      try {
        const comments = JSON.parse(localStorage.getItem(`comments-${id}`) || "[]");
        list.innerHTML = comments.length ? comments.map((c) => `<li>${c}</li>`).join("") : "<li>Aucun commentaire pour l'instant.</li>";
      } catch {
        list.innerHTML = "<li>Aucun commentaire pour l'instant.</li>";
      }
    };

    btn?.addEventListener("click", () => {
      const value = textarea?.value?.trim();
      if (!value) return;
      const comments = JSON.parse(localStorage.getItem(`comments-${id}`) || "[]");
      comments.push(value);
      localStorage.setItem(`comments-${id}`, JSON.stringify(comments));
      textarea.value = "";
      refreshComments();
    });
  };

  const openDetailsPanel = (feature) => {
    if (!detailsPanel || !detailsBody) return;
    detailsBody.innerHTML = renderPopupContent(feature);
    bindPopupInteractions(detailsBody, feature);
    detailsPanel.classList.add("visible");
    document.body.classList.add("details-open");
  };

  detailsCloseBtn?.addEventListener("click", closeDetailsPanel);
  detailsPanel?.addEventListener("click", (event) => {
    if (event.target === detailsPanel) closeDetailsPanel();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDetailsPanel();
      closeLightbox();
    }
  });

  let poiMarkers = [];
  let currentScenario = "diagnostic";

  const scenarioButtons = document.querySelectorAll(".scenario-button");
  const updateScenarioButtons = (activeKey) => {
    scenarioButtons.forEach((button) => {
      const isActive = button.dataset.scenario === activeKey;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-selected", isActive ? "true" : "false");
      button.setAttribute("tabindex", isActive ? "0" : "-1");
    });
  };

  const createPoiMarkers = (features) => {
    poiMarkers.forEach((marker) => marker.remove());
    poiMarkers = [];
    features.forEach((feature) => {
      const marker = new maplibregl.Marker({ color: "#38bdf8" }).setLngLat(feature.geometry.coordinates).addTo(map);
      marker.getElement().addEventListener("click", (event) => {
        event.stopPropagation();
        map.stop();
        openDetailsPanel(feature);
      });
      poiMarkers.push(marker);
    });
  };

  const setMarkersVisibility = (visible) => {
    poiMarkers.forEach((marker) => {
      const el = marker.getElement();
      if (el) el.style.display = visible ? "" : "none";
    });
  };

  const setPerimeterVisibility = (visible) => {
    ["focus-zone-layer", "focus-mask-layer"].forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
      }
    });
  };

  const applyToggleState = (scenarioKey, toggleId) => {
    const enabled = toggleStates[scenarioKey]?.[toggleId];
    if (toggleId === "interventions") {
      setMarkersVisibility(Boolean(enabled));
    } else if (toggleId === "perimeter") {
      setPerimeterVisibility(Boolean(enabled));
    }
  };

  const renderLayerToggles = (scenarioKey) => {
    if (!layerToggleList) return;
    const configs = scenarioLayers[scenarioKey] || [];
    if (!toggleStates[scenarioKey]) toggleStates[scenarioKey] = {};
    layerToggleList.innerHTML = "";

    configs.forEach((cfg) => {
      if (typeof toggleStates[scenarioKey][cfg.id] !== "boolean") {
        toggleStates[scenarioKey][cfg.id] = true;
      }

      const item = document.createElement("div");
      item.className = "toggle-item";

      const label = document.createElement("label");
      label.setAttribute("for", `toggle-${scenarioKey}-${cfg.id}`);

      const icon = document.createElement("span");
      icon.className = `legend-icon ${cfg.iconClass || ""}`.trim();

      const text = document.createElement("span");
      text.textContent = cfg.label;

      label.append(icon, text);

      const input = document.createElement("input");
      input.type = "checkbox";
      input.id = `toggle-${scenarioKey}-${cfg.id}`;
      input.dataset.toggle = cfg.id;
      input.checked = toggleStates[scenarioKey][cfg.id];
      input.addEventListener("change", (event) => {
        toggleStates[scenarioKey][cfg.id] = event.target.checked;
        applyToggleState(scenarioKey, cfg.id);
      });

      item.append(label, input);
      layerToggleList.appendChild(item);
      applyToggleState(scenarioKey, cfg.id);
    });
  };

  const applyScenario = (key) => {
    const scenario = scenarios[key];
    if (!scenario) return;
    currentScenario = key;
    closeDetailsPanel();
    createPoiMarkers(scenario.poiGeoJson.features);
    const focusSource = map.getSource("focus-zone");
    const maskSource = map.getSource("focus-mask");
    focusSource?.setData(scenario.focusZone);
    maskSource?.setData(scenario.maskGeoJson);
    renderLayerToggles(key);
    updateScenarioButtons(key);
  };

  const hideBaseIcons = () => {
    const style = map.getStyle();
    if (!style?.layers) return;
    style.layers
      .filter((layer) => layer.type === "symbol" && layer.layout && layer.layout["icon-image"])
      .forEach((layer) => map.setLayoutProperty(layer.id, "visibility", "none"));
  };

  scenarioButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const scenarioKey = button.dataset.scenario;
      if (scenarioKey && scenarioKey !== currentScenario) {
        applyScenario(scenarioKey);
      }
    });
  });

  map.on("load", () => {
    map.fitBounds(bounds, { padding: 40, duration: 0 });

    map.addSource("focus-zone", { type: "geojson", data: scenarios[currentScenario].focusZone });
    map.addSource("focus-mask", { type: "geojson", data: scenarios[currentScenario].maskGeoJson });
    map.addLayer({
      id: "focus-mask-layer",
      type: "fill",
      source: "focus-mask",
      paint: {
        "fill-color": "rgba(15, 23, 42, 0.75)",
        "fill-opacity": 0.75,
      },
    });
    map.addLayer({
      id: "focus-zone-layer",
      type: "line",
      source: "focus-zone",
      paint: {
        "line-color": "#facc15",
        "line-width": 2,
      },
    });

    applyScenario(currentScenario);
    hideBaseIcons();
    map.on("styledata", hideBaseIcons);
  });
});
