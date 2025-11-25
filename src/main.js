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

  const diagnosticAutoAxes = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [
            [6.474839622244019, 46.493642238119484],
            [6.47735599188198, 46.49452043654931],
            [6.478797765427117, 46.49502613057504],
            [6.479385155059588, 46.49520279606368],
            [6.479619375863617, 46.49524715907624],
            [6.479748154398119, 46.495248247994915],
            [6.479799177604374, 46.49526395558212],
            [6.479855423826848, 46.4953099196428],
            [6.479877727114688, 46.4953611153818],
            [6.480034797718099, 46.49545490018396],
            [6.4802520870634215, 46.49555023069777],
            [6.480823266709247, 46.495858065216986],
            [6.481182408575122, 46.4961176553957],
            [6.48136337407637, 46.49629007323155],
            [6.481540810355163, 46.4965237674253],
            [6.481664514645869, 46.49676216463758],
            [6.481710611217749, 46.496905987220636],
            [6.481752906008254, 46.497185993578064],
            [6.48179173528566, 46.49742374723091],
            [6.481896534295776, 46.49772470554146],
            [6.4820707375949675, 46.497974827711516],
            [6.482373757501781, 46.49832495050909],
            [6.483583352885218, 46.49958398322486],
            [6.485176762234154, 46.50127234762636],
            [6.486200157360231, 46.502374406265766],
            [6.487347121131406, 46.50355623220471],
            [6.487443635693804, 46.50360322548588],
            [6.487556412457881, 46.503634052481566],
            [6.487593758017062, 46.50366701115968],
            [6.487592898928529, 46.50371586314956],
            [6.487580302017805, 46.503761238201896],
            [6.487632752489369, 46.50385449023871],
            [6.487716500007342, 46.50397988232896],
            [6.488387277551905, 46.504649528701684],
            [6.488746972632817, 46.50504782373708],
            [6.489213027764201, 46.50551317269589],
            [6.489505980463514, 46.50581166832688],
            [6.489688373099756, 46.50592994838237],
            [6.4898518579782465, 46.50599742687603],
            [6.489971968808729, 46.506022755980204],
            [6.49010160952103, 46.50603729587215],
            [6.490175077142484, 46.506089658155275],
            [6.490224510243238, 46.50617727320223],
            [6.490323132204918, 46.50624331041021],
            [6.490579034032954, 46.506346511184276],
            [6.490940040708113, 46.50648593552932],
            [6.492415130260124, 46.50703595786496],
            [6.492877685761369, 46.507169342454766],
            [6.493541118966697, 46.507319246987834],
            [6.494427241918245, 46.50743913175027],
            [6.4952632573376246, 46.50754329573604],
            [6.495833304717024, 46.50762017322173],
            [6.4960804814057065, 46.50766214538774],
            [6.496177713927303, 46.50767186387876],
            [6.49628049469085, 46.50767152312231],
            [6.496369190411577, 46.507651528442125],
            [6.496439281218816, 46.5076159293438],
            [6.496687607681032, 46.50748362325916],
            [6.496841577990994, 46.50739675695372],
            [6.496959049002552, 46.507342891399844],
            [6.497063066820048, 46.50732003222665],
            [6.497159350293559, 46.50732968810843],
            [6.497239783591077, 46.50736951016658],
            [6.497348790417893, 46.5074666078319],
            [6.497531770845895, 46.50764136160583],
            [6.497745437356253, 46.50780216835865],
            [6.498381672858625, 46.50824925461041],
            [6.498851197936747, 46.508618569433786],
            [6.499388033681961, 46.50912917656954],
            [6.4997718009017635, 46.50955082766737],
            [6.499824566100056, 46.50963792699769],
            [6.499879714739514, 46.509763104644215],
            [6.499941033070823, 46.51012420332548],
            [6.500012577695479, 46.51058426532287],
            [6.499975604561353, 46.51076928517859],
            [6.499988039860622, 46.51112393412441],
            [6.5000002822667335, 46.511506193498455],
            [6.500018123880395, 46.51161537002585],
            [6.500064468019439, 46.51178920445897],
            [6.500134742705253, 46.51193357682116],
            [6.500224654575351, 46.512081471013964],
            [6.500334257405475, 46.512207305436085],
            [6.500529056441777, 46.512372747267115],
            [6.500896930519526, 46.5126962869166],
            [6.501241375829205, 46.5129751553904],
            [6.5015509394634865, 46.51323832120664],
            [6.5019202569014745, 46.51357581956797],
            [6.502137931661333, 46.513758974433166],
            [6.503597513880036, 46.514989074922894],
            [6.503808161750254, 46.515157306942484],
            [6.5040721653130324, 46.51533089936704],
            [6.504311453866098, 46.515467326487574],
            [6.504832514787893, 46.515692381620816],
            [6.507020769233695, 46.516486659653026],
            [6.507549923798702, 46.51660691872452],
            [6.508344456039478, 46.51671773647926],
            [6.5091265827641, 46.51680774749326],
            [6.511457378149446, 46.51707080992839],
            [6.51342351064418, 46.51732308631228],
            [6.51361794185126, 46.51733528138816],
            [6.515097943657829, 46.517511262605396],
            [6.516427012497767, 46.5176662585842],
            [6.517764641940617, 46.51780878998678],
            [6.518809611051572, 46.517872834768795],
            [6.519359276853446, 46.51787392287972],
            [6.519878393925015, 46.51785616304679],
            [6.522130179489783, 46.51774606527359],
            [6.524627498111353, 46.51761260454519],
            [6.524841456080882, 46.5175823523823],
            [6.525002104651047, 46.51754149027067],
            [6.525100333618061, 46.51749739101084],
            [6.525276757246492, 46.51748884858944],
            [6.525446066351918, 46.517488516704674],
            [6.525985166901851, 46.51738803550958],
          ],
        },
      },
    ],
  };

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
      { type: "toggle", id: "perimeter", label: "Périmètre", iconClass: "square" },
      {
        type: "group",
        title: "Un centre-ville ceinturé par les axes de mobilité",
        items: [{ type: "toggle", id: "diagnostic-auto", label: "Les axes de mobilité du transport automobile", iconClass: "line" }],
      },
    ],
    projet: [
      { type: "toggle", id: "interventions", label: "Interventions prévues", iconClass: "point" },
      { type: "toggle", id: "perimeter", label: "Périmètre", iconClass: "square" },
    ],
  };

  const toggleStates = {
    diagnostic: { perimeter: true, "diagnostic-auto": true },
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

  const setDiagnosticAutoVisibility = (visible) => {
    const layerId = "diagnostic-auto-layer";
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
    }
  };

  const applyToggleState = (scenarioKey, toggleId) => {
    const enabled = toggleStates[scenarioKey]?.[toggleId];
    if (toggleId === "interventions") {
      setMarkersVisibility(Boolean(enabled));
    } else if (toggleId === "perimeter") {
      setPerimeterVisibility(Boolean(enabled));
    } else if (toggleId === "diagnostic-auto") {
      const isDiagnostic = scenarioKey === "diagnostic" && currentScenario === "diagnostic";
      setDiagnosticAutoVisibility(Boolean(enabled) && isDiagnostic);
    }
  };

  const createToggleElement = (scenarioKey, cfg) => {
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
    applyToggleState(scenarioKey, cfg.id);
    return item;
  };

  const renderLayerToggles = (scenarioKey) => {
    if (!layerToggleList) return;
    const configs = scenarioLayers[scenarioKey] || [];
    if (!toggleStates[scenarioKey]) toggleStates[scenarioKey] = {};
    layerToggleList.innerHTML = "";

    configs.forEach((cfg) => {
      if (cfg.type === "group" && cfg.items?.length) {
        const group = document.createElement("div");
        group.className = "toggle-group";
        if (cfg.title) {
          const title = document.createElement("div");
          title.className = "toggle-group-title";
          title.textContent = cfg.title;
          group.appendChild(title);
        }
        cfg.items.forEach((itemCfg) => {
          toggleStates[scenarioKey][itemCfg.id] ??= true;
          group.appendChild(createToggleElement(scenarioKey, itemCfg));
        });
        layerToggleList.appendChild(group);
      } else {
        toggleStates[scenarioKey][cfg.id] ??= true;
        layerToggleList.appendChild(createToggleElement(scenarioKey, cfg));
      }
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
    if (key === "diagnostic") {
      const enabled = toggleStates.diagnostic?.["diagnostic-auto"] ?? true;
      setDiagnosticAutoVisibility(Boolean(enabled));
    } else {
      setDiagnosticAutoVisibility(false);
    }
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
    map.addSource("diagnostic-auto", { type: "geojson", data: diagnosticAutoAxes });
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
    map.addLayer({
      id: "diagnostic-auto-layer",
      type: "line",
      source: "diagnostic-auto",
      layout: { visibility: "none" },
      paint: {
        "line-color": "#ff2d2d",
        "line-width": 4,
        "line-opacity": 0.9,
      },
    });

    applyScenario(currentScenario);
    hideBaseIcons();
    map.on("styledata", hideBaseIcons);
  });
});
