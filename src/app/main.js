import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { injectSpeedInsights } from "@vercel/speed-insights";
import { inject as injectAnalytics } from "@vercel/analytics";
import { projectGeojson } from "../data/geojson/projectGeojson";
import { diagnosticGeojson } from "../data/geojson/diagnosticGeojson";
import { createMaskedLocalImageRenderer, createMaskedWmsRenderer, pollutionCanvasCoordinates } from "../masks/maskRenderer";

// Petit bootstrap analytics, histoire de garder les mêmes stats que dans le projet Vite d’origine.

injectSpeedInsights();
injectAnalytics();

// Toute la logique reste encapsulée ici pour éviter les soucis de timing avec MapLibre.
window.addEventListener("DOMContentLoaded", () => {
  const {
    zoneCoords,
    focusZone,
    noiseMaskCoords,
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
  const projectIntentionsButton = document.querySelector('[data-action="project-intentions"]');
  const heatSliderContainer = document.getElementById("heat-slider");
  const heatSliderTitle = document.getElementById("heat-slider-title");
  const heatSliderMinLabel = document.getElementById("heat-slider-min-label");
  const heatSliderMaxLabel = document.getElementById("heat-slider-max-label");
  const heatSliderInput = document.getElementById("heat-slider-input");
  const heatSliderValueLabel = document.getElementById("heat-slider-value");
  // Ces boutons gèrent les filtres “en conséquence” pour diagnostic et projet.
  const filterButtons = Array.from(document.querySelectorAll(".filter-button"));
  const filterButtonByKey = {};
  const activeFilterByGroup = { diagnostic: null, project: null };
  // Variables géographiques utilisées pour calculer des surfaces ou pour centrer la carte.
  const morgesCenter = [6.496, 46.509];
  const earthRadius = 6378137;
  const baseLatRad = (morgesCenter[1] * Math.PI) / 180;
  const baseLngRad = (morgesCenter[0] * Math.PI) / 180;

  // Points cliquables “projet” (encore génériques pour l’instant). On garde tout ici pour les panneaux modaux.
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

  // Templates HTML des légendes qui s’affichent à droite de la carte selon le filtre choisi.
  const pollutionLegendTemplates = {
    noise: {
      title: "Niveau sonore Lr [dB(A)]",
      body: `
        <div class="legend-description">
          <strong>Impact du bruit sur la santé</strong>
          <p>Le bruit routier est un facteur majeur de stress en milieu urbain. Au-delà de 55–60 dB(A) le jour, l’OMS relève des risques accrus de fatigue, de baisse de concentration et, à long terme, de troubles cardiovasculaires. Dans le périmètre étudié, les axes routiers oscillent surtout entre 55 et 65 dB(A) le jour et demeurent souvent &gt; 50 dB(A) la nuit, seuil susceptible de perturber le sommeil.</p>
        </div>
        <ul>
          <li><span style="background:#1d4ed8"></span>&ge; 75</li>
          <li><span style="background:#7c3aed"></span>70 – 74.9</li>
          <li><span style="background:#b91c1c"></span>65 – 69.9</li>
          <li><span style="background:#dc2626"></span>60 – 64.9 <small>(valeur limite)</small></li>
          <li><span style="background:#ea580c"></span>55 – 59.9</li>
          <li><span style="background:#f97316"></span>50 – 54.9</li>
          <li><span style="background:#facc15"></span>45 – 49.9</li>
          <li><span style="background:#16a34a"></span>40 – 44.9</li>
          <li><span style="background:#f3f4f6;border:1px solid #cbd5f5"></span>&lt; 40</li>
        </ul>
        <div class="legend-sources">Sources : OMS (2018, 2021), OFEV, Office fédéral de la santé publique.</div>
      `,
    },
    air: {
      title: "Pollution de l'air (NO<sub>2</sub> annuel)",
      body: `
        <div class="legend-description">
          <strong>Impact du dioxyde d’azote sur la santé</strong>
          <p>Le NO₂ issu principalement du trafic routier irrite les voies respiratoires et aggrave les maladies cardio-respiratoires. L’OMS recommande de ne pas dépasser 10 µg/m³ en moyenne annuelle (25 µg/m³ sur 24 h), alors que la Suisse fixe une valeur limite de 30 µg/m³ par an. Dans le périmètre, les axes principaux se situent autour ou légèrement au-dessus de 30 µg/m³, au-delà des recommandations de l’OMS. Une exposition chronique à ces niveaux accentue les symptômes chez les personnes asthmatiques, limite la fonction pulmonaire des enfants et peut augmenter les hospitalisations lors de pics supplémentaires.</p>
        </div>
        <p>Concentration moyenne en µg/m³</p>
        <ul>
          <li><span style="background:#002f86"></span>0 – 3.0</li>
          <li><span style="background:#0a4ec2"></span>3.1 – 6.0</li>
          <li><span style="background:#1c74fc"></span>6.1 – 9.0</li>
          <li><span style="background:#2894ff"></span>9.1 – 12.0</li>
          <li><span style="background:#43baff"></span>12.1 – 15.0</li>
          <li><span style="background:#73d8ff"></span>15.1 – 18.0</li>
          <li><span style="background:#81e4ff"></span>18.1 – 21.0</li>
          <li><span style="background:#49c769"></span>21.1 – 24.0</li>
          <li><span style="background:#6ee33e"></span>24.1 – 27.0</li>
          <li><span style="background:#9df02a"></span>27.1 – 30.0</li>
          <li><span style="background:#f3f11d"></span>30.1 – 33.0</li>
          <li><span style="background:#fbd31c"></span>33.1 – 36.0</li>
          <li><span style="background:#fca71a"></span>36.1 – 39.0</li>
          <li><span style="background:#fb7018"></span>39.1 – 42.0</li>
          <li><span style="background:#ff3a19"></span>42.1 – 45.0</li>
          <li><span style="background:#ff1171"></span>45.1 – 48.0</li>
          <li><span style="background:#cc01a3"></span>48.1 – 51.0</li>
          <li><span style="background:#9b02a5"></span>51.1 – 54.0</li>
          <li><span style="background:#65038b"></span>&gt; 54.0</li>
        </ul>
        <p class="legend-note">Valeur limite annuelle (OPair) : 30 µg/m³</p>
        <div class="legend-sources">Sources : OMS (2021), OFEV (2023).</div>
      `,
    },
    heat: {
      title: "Température de l’air à 14h (situation actuelle)",
      body: `
        <div class="legend-description">
          <strong>Zones actuellement les plus chaudes</strong>
          <p>Température de l’air à 2 m du sol à 14h (données DGE – cartes climatiques actuelles). Les classes les plus élevées signalent des îlots minéralisés où des mesures de rafraîchissement sont prioritaires.</p>
        </div>
        <ul>
          <li><span style="background:#0b5e17"></span>&le; 21 °C</li>
          <li><span style="background:#167824"></span>&gt; 21 – 22 °C</li>
          <li><span style="background:#2a942f"></span>&gt; 22 – 23 °C</li>
          <li><span style="background:#4ab132"></span>&gt; 23 – 24 °C</li>
          <li><span style="background:#7dd422"></span>&gt; 24 – 25 °C</li>
          <li><span style="background:#b4e11f"></span>&gt; 25 – 26 °C</li>
          <li><span style="background:#f1dd18"></span>&gt; 26 – 27 °C</li>
          <li><span style="background:#f6b616"></span>&gt; 27 – 28 °C</li>
          <li><span style="background:#f58911"></span>&gt; 28 – 29 °C</li>
          <li><span style="background:#f5540f"></span>&gt; 29 – 30 °C</li>
          <li><span style="background:#df2116"></span>&gt; 30 – 31 °C</li>
          <li><span style="background:#b51036"></span>&gt; 31 – 32 °C</li>
          <li><span style="background:#900050"></span>&gt; 32 – 33 °C</li>
          <li><span style="background:#a00092"></span>&gt; 33 – 34 °C</li>
          <li><span style="background:#6501a5"></span>&gt; 34 – 35 °C</li>
          <li><span style="background:#46176b"></span>&gt; 35 – 36 °C</li>
          <li><span style="background:#2b153d"></span>&gt; 36 °C</li>
        </ul>
        <div class="legend-sources">Sources : DGE – Atmosphère/Climatologie, cartes climatiques actuelles.</div>
      `,
    },
    heat2050: {
      title: "Température de l’air à 14h (2060)",
      body: `
        <div class="legend-description">
          <strong>Situation future (scénario chaud)</strong>
          <p>Température de l’air à 2 m du sol à 14h, projection 2060. Plus la classe est élevée, plus l’excès de chaleur est marqué et sollicite des dispositifs de résilience (canopées, désimperméabilisation, ventilation naturelle).</p>
        </div>
        <ul>
          <li><span style="background:#0b5e17"></span>&le; 21 °C</li>
          <li><span style="background:#167824"></span>&gt; 21 – 22 °C</li>
          <li><span style="background:#2a942f"></span>&gt; 22 – 23 °C</li>
          <li><span style="background:#4ab132"></span>&gt; 23 – 24 °C</li>
          <li><span style="background:#7dd422"></span>&gt; 24 – 25 °C</li>
          <li><span style="background:#b4e11f"></span>&gt; 25 – 26 °C</li>
          <li><span style="background:#f1dd18"></span>&gt; 26 – 27 °C</li>
          <li><span style="background:#f6b616"></span>&gt; 27 – 28 °C</li>
          <li><span style="background:#f58911"></span>&gt; 28 – 29 °C</li>
          <li><span style="background:#f5540f"></span>&gt; 29 – 30 °C</li>
          <li><span style="background:#df2116"></span>&gt; 30 – 31 °C</li>
          <li><span style="background:#b51036"></span>&gt; 31 – 32 °C</li>
          <li><span style="background:#900050"></span>&gt; 32 – 33 °C</li>
          <li><span style="background:#a00092"></span>&gt; 33 – 34 °C</li>
          <li><span style="background:#6501a5"></span>&gt; 34 – 35 °C</li>
          <li><span style="background:#46176b"></span>&gt; 35 – 36 °C</li>
        <li><span style="background:#2b153d"></span>&gt; 36 °C</li>
        </ul>
        <div class="legend-sources">Sources : DGE – Atmosphère/Climatologie, cartes climatiques 2060.</div>
      `,
    },
    attractivity: {
      title: "Un potentiel d’attractivité développé",
      body: `
        <div class="legend-description">
          <strong>Animation à intégrer</strong>
          <p>Ce filtre présentera prochainement la narration complète : report des activités vers les places libérées, activation du littoral et itinéraires confortables reliant les polarités du centre.</p>
        </div>
        <ul>
          <li>Réaffectation des surfaces de stationnement en espaces publics.</li>
          <li>Nouvelles continuités piétonnes vers le parc et les quais.</li>
          <li>Valorisation du front lacustre et des commerces de proximité.</li>
        </ul>
        <p>Le rendu cartographique est en préparation ; le filtre rappelle simplement ce scénario dans l’interface.</p>
      `,
    },
  };

  // Mapping simple pour savoir quelle source Raster activer pour chaque filtre diagnostic.
  const diagnosticPollutionConfigs = {
    noise: {
      key: "noise",
      sourceId: "noise-diagnostic",
      layerId: "noise-diagnostic-layer",
      wmsLayer: "ch.bafu.laerm-strassenlaerm_tag",
      alpha: 0.85,
      paint: { "raster-opacity": 0.65 },
      legend: pollutionLegendTemplates.noise,
    },
    air: {
      key: "air",
      sourceId: "air-diagnostic",
      layerId: "air-diagnostic-layer",
      wmsLayer: "ch.bafu.luftreinhaltung-stickstoffdioxid",
      alpha: 0.9,
      paint: { "raster-opacity": 0.75 },
      legend: pollutionLegendTemplates.air,
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

  Object.values(diagnosticPollutionConfigs).forEach((config) => {
    if (config.wmsLayer) Object.assign(config, createMaskedWmsRenderer({ layer: config.wmsLayer, alpha: config.alpha }));
  });

  // Quelques helpers pour éviter de modifier les objets GeoJSON d’origine.
  const cloneFeature = (feature, overrides = {}) => ({
    ...feature,
    geometry: { ...feature.geometry, coordinates: [...feature.geometry.coordinates] },
    properties: { ...feature.properties, ...overrides },
  });

  const diagnosticFeatures = [];
  // Calcul d’aires approximatives pour renseigner les surfaces dans les fiches d’info.
  const projectToMeters = (lng, lat) => {
    const lngRad = (lng * Math.PI) / 180;
    const latRad = (lat * Math.PI) / 180;
    const x = (lngRad - baseLngRad) * Math.cos(baseLatRad) * earthRadius;
    const y = (latRad - baseLatRad) * earthRadius;
    return [x, y];
  };

  const ringArea = (ring) => {
    if (!Array.isArray(ring) || ring.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < ring.length - 1; i += 1) {
      const [x1, y1] = projectToMeters(ring[i][0], ring[i][1]);
      const [x2, y2] = projectToMeters(ring[i + 1][0], ring[i + 1][1]);
      area += x1 * y2 - x2 * y1;
    }
    return Math.abs(area) / 2;
  };

  const polygonArea = (coordinates) => {
    if (!Array.isArray(coordinates)) return 0;
    return coordinates.reduce((sum, ring, index) => {
      const area = ringArea(ring);
      return sum + (index === 0 ? area : -area);
    }, 0);
  };

  const annotatePolygonCollection = (collection) => {
    let totalArea = 0;
    const features = collection.features.map((feature, index) => {
      if (feature.geometry?.type !== "Polygon") return feature;
      const areaSqm = polygonArea(feature.geometry.coordinates);
      totalArea += areaSqm;
      return cloneFeature(feature, { areaSqm, id: feature.id ?? `poly-${index}` });
    });
    return { data: { type: "FeatureCollection", features }, totalArea };
  };

  const annotatedParking = annotatePolygonCollection(diagnosticParkingSurfaces);
  const annotatedPrivate = annotatePolygonCollection(diagnosticPrivateSpaces);
  const {
    projectParkingSurfaces,
    projectRoofsOverlay,
    projectSpacesOverlay,
    projectLakeOpenOverlay,
    projectLakeRenatureOverlay,
    projectDensityOverlay,
  } = projectGeojson;
  const projectAnnotatedParking = annotatePolygonCollection(projectParkingSurfaces);
  const projectAnnotatedRoofs = annotatePolygonCollection(projectRoofsOverlay);

  const parkingReportData = {
    removedTotal: 284,
    availableTotal: 339,
    surfaceToRequalify: [
      { name: "Parking de la place de la Navigation", detail: "1 place libre / 43" },
      { name: "Parking Louis-de-Savoie", detail: "4 places libres / 49" },
      { name: "Parking de la place de l’église", detail: "0 place libre / 37" },
      { name: "Parking du quai Lochmann", detail: "0 place libre / 155" },
    ],
    absorbing: [
      { name: "Parking souterrain des Charpentiers", detail: "124 places libres / 574" },
      { name: "Parking souterrain de la gare", detail: "99 places libres / 144" },
      { name: "Parking souterrain du Pont-neuf", detail: "46 places libres / 171" },
      { name: "Parking du Parc des Sports", detail: "6 places libres / 446" },
      { name: "Parking de la piscine", detail: "25 places libres / 174" },
      { name: "Parking de la Blancherie", detail: "39 places libres / 87" },
    ],
  };
  parkingReportData.netGain = parkingReportData.availableTotal - parkingReportData.removedTotal;
  const parkingDemoSteps = [
    {
      id: "current",
      label: "Constat",
      title: "Constat : parkings en surface saturés",
      description:
        "Les parkings en surface du Bourg saturent et isolent le centre (Navigation, Louis-de-Savoie, Place de l’église, Quai Lochmann). Nous proposons de requalifier ces dalles minérales : cela représente 284 places à reloger.",
      cards: [{ label: "Places concernées", value: `-${parkingReportData.removedTotal}`, tone: "negative" }],
      listTitle: "Parkings en surface à requalifier",
      list: parkingReportData.surfaceToRequalify,
    },
    {
      id: "capacity",
      label: "Capacité disponible",
      title: "Parkings souterrains voisins sous-exploités",
      description:
        "Le même relevé (samedi 29 mai 2021, 11h30) montre que les parkings souterrains et de grande capacité alentour disposaient encore de plus de 330 places libres.",
      cards: [{ label: "Capacité restante", value: `+${parkingReportData.availableTotal}`, tone: "positive" }],
      listTitle: "Parkings de grande capacité à proximité",
      list: parkingReportData.absorbing,
    },
    {
      id: "summary",
      label: "Conclusion",
      title: "Conclusion : report crédible sans création",
      description:
        "En réaffectant la fréquentation vers ces parkings souterrains, le solde reste positif (+55 places nettes). Une signalétique dynamique et des abonnements visiteurs encadrent ce report tout en libérant l’espace public.",
      cards: [
        { label: "Places requalifiées", value: `-${parkingReportData.removedTotal}`, tone: "negative" },
        { label: "Capacité disponible", value: `+${parkingReportData.availableTotal}`, tone: "positive" },
        { label: "Solde net", value: `+${parkingReportData.netGain}`, tone: "positive" },
      ],
      bullets: [
        "Les parkings souterrains restent sous-utilisés même en pointe.",
        "Une communication en temps réel et des abonnements guident le report.",
        "Les surfaces rendues au Bourg deviennent des espaces piétons/végétalisés.",
      ],
    },
  ];

  // Démo parking : structure de données pour alimenter les slides pédagogiques.
  const projectFeatures = rawProjetFeatures.map((feature) =>
    cloneFeature(feature, {
      title: feature.properties.title.startsWith("Projet") ? feature.properties.title : `Projet – ${feature.properties.title}`,
    }),
  );

  const collectCoords = (collections) => {
    const coords = [];
    const pushCoords = (node) => {
      if (!node) return;
      if (typeof node[0] === "number" && typeof node[1] === "number") {
        coords.push(node);
        return;
      }
      if (Array.isArray(node)) node.forEach(pushCoords);
    };
    collections.forEach((collection) => {
      collection?.features?.forEach((feature) => {
        pushCoords(feature?.geometry?.coordinates);
      });
    });
    return coords;
  };

  const bounds = (() => {
    const coords = [
      ...zoneCoords,
      ...collectCoords([
        { features: projectFeatures },
        diagnosticAutoAxesPrimary,
        diagnosticAutoAxesSecondary,
        diagnosticAutoAxesTertiary,
        projectAutoAxes,
        annotatedParking.data,
        projectAnnotatedParking.data,
        annotatedPrivate.data,
        diagnosticLakeViews,
      ]),
    ];
    if (!coords.length) return [[6.48, 46.49], [6.53, 46.53]];
    const lngs = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);
    const baseBuffer = 0.001;
    const westBuffer = 0.0004;
    return [
      [Math.min(...lngs) - westBuffer, Math.min(...lats) - baseBuffer],
      [Math.max(...lngs) + baseBuffer, Math.max(...lats) + baseBuffer],
    ];
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

  // Gestion du “lightbox” pour afficher les grandes images ou PDF.
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

  // Contenu HTML des popups/projets : volontairement verbeux pour pouvoir évoluer facilement.
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

  // Petites interactions (carrousel, commentaires stockés en localStorage) associées aux popups.
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

  // Panneau latéral “détails du projet” (réutilise le contenu des popups).
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
      closeParkingDemo();
    }
  });

  // Boutons “Diagnostic / Projet” en haut : on mémorise l’état pour masquer les sections du panneau.
  const sectionState = { diagnostic: true, projet: true };
  const sectionButtons = document.querySelectorAll("[data-section-toggle]");
  const updateSectionVisibility = (key) => {
    const section = document.querySelector(`[data-section="${key}"]`);
    const visible = sectionState[key];
    if (section) section.classList.toggle("hidden", !visible);
    const button = document.querySelector(`[data-section-toggle="${key}"]`);
    if (button) {
      button.classList.toggle("active", visible);
      button.setAttribute("aria-pressed", visible ? "true" : "false");
    }
  };
  sectionButtons.forEach((button) => {
    const key = button.dataset.sectionToggle;
    button.addEventListener("click", () => {
      sectionState[key] = !sectionState[key];
      updateSectionVisibility(key);
    });
    updateSectionVisibility(key);
  });

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
  const layerInputByKey = {};
  layerInputs.forEach((input) => {
    const key = input.dataset.layer;
    if (key) layerInputByKey[key] = input;
  });

  const poiMarkers = [];
  // Marqueurs interactifs pour les points d’intérêt du projet.
  const createPoiMarkers = () => {
    projectFeatures.forEach((feature) => {
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

  // Helpers pour montrer/cacher rapidement des groupes de couches MapLibre.
  const setPerimeterVisibility = (visible) => {
    ["focus-zone-layer", "focus-mask-layer"].forEach((layerId) => {
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
  const projectSpacesLayerIds = ["project-spaces-fill", "project-spaces-outline"];
  const projectLakeOpenLayerIds = ["project-lake-open-fill", "project-lake-open-outline"];
  const projectLakeRenatureLayerIds = ["project-lake-renature-fill", "project-lake-renature-outline"];
  const projectRoofsLayerIds = ["project-roofs-fill", "project-roofs-outline"];
  const projectDensityLayerIds = ["project-density-outline"];

  const setDiagnosticAutoVisibility = (visible) => {
    [...diagnosticAutoLineLayerIds, ...diagnosticAutoArrowLayerIds].forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
      }
    });
  };

  const setProjectAutoVisibility = (visible) => {
    [...projectAutoLineLayerIds, ...projectAutoArrowLayerIds].forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
      }
    });
  };

  const setProjectParkingVisibility = (visible) => {
    projectParkingLayerIds.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
      }
    });
  };

  const setProjectSpacesVisibility = (visible) => {
    projectSpacesLayerIds.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
      }
    });
  };

  const setProjectLakeOpenVisibility = (visible) => {
    projectLakeOpenLayerIds.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
      }
    });
  };

  const setProjectLakeRenatureVisibility = (visible) => {
    projectLakeRenatureLayerIds.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
      }
    });
  };

  const setProjectRoofsVisibility = (visible) => {
    projectRoofsLayerIds.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
      }
    });
  };

  const setProjectDensityVisibility = (visible) => {
    projectDensityLayerIds.forEach((layerId) => {
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

  const projectNoiseLayerIds = ["project-noise-before-layer", "project-noise-after-layer"];
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

  const projectAirLayerIds = ["project-air-before-layer", "project-air-after-layer"];
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

  const diagnosticParkingLayerIds = ["diagnostic-parking-fill", "diagnostic-parking-outline"];
  const setDiagnosticParkingVisibility = (visible) => {
    diagnosticParkingLayerIds.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
      }
    });
  };

  const diagnosticPrivateLayerIds = ["diagnostic-private-fill", "diagnostic-private-outline"];
  const setDiagnosticPrivateVisibility = (visible) => {
    diagnosticPrivateLayerIds.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
      }
    });
  };

  const diagnosticLakeLayerIds = ["diagnostic-lake-fill", "diagnostic-lake-outline"];
  const setDiagnosticLakeVisibility = (visible) => {
    diagnosticLakeLayerIds.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
      }
    });
  };

  // On centralise l’état du “bloc pollution” ici pour éviter d’avoir 3 variables globales en pagaille.
  const noiseVisibilityState = { diagnosticMode: "none", projectMode: "none", projectEnabled: false };
  const RASTER_MAX_OPACITY = 0.8;
  let heatLayerVisible = false;
  let sliderMode = null;
  let sliderValue = 100;
  let activeDiagnosticFilter = "none";
  let activeProjectFilter = "none";

  // Chaque scenario “avant/après” partage cette configuration : slider unique piloté par ce dictionnaire.
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

  // Active/désactive le slider et applique la configuration adaptée (chaleur, bruit, air).
  const setSliderMode = (mode) => {
    if (sliderMode === mode) return;
    if (sliderMode && sliderConfigs[sliderMode]?.reset) {
      sliderConfigs[sliderMode].reset();
    }
    sliderMode = mode;
    if (!mode) {
      if (heatSliderContainer) {
        heatSliderContainer.classList.remove("visible");
        heatSliderContainer.setAttribute("aria-hidden", "true");
      }
      if (heatSliderValueLabel) heatSliderValueLabel.textContent = "";
      return;
    }
    const config = sliderConfigs[mode];
    if (heatSliderContainer) {
      heatSliderContainer.classList.add("visible");
      heatSliderContainer.setAttribute("aria-hidden", "false");
    }
    sliderValue = config.initialValue ?? 100;
    if (heatSliderInput) heatSliderInput.value = `${sliderValue}`;
    if (heatSliderTitle) heatSliderTitle.textContent = config.title;
    if (heatSliderMinLabel) heatSliderMinLabel.textContent = config.minLabel;
    if (heatSliderMaxLabel) heatSliderMaxLabel.textContent = config.maxLabel;
    applySliderBlend(sliderValue);
  };

  // On traduit la valeur du slider (0-100) en ratio puis on ajuste les opacités des rasters.
  const applySliderBlend = (value = sliderValue) => {
    if (!sliderMode) return;
    const numeric = Number(value);
    sliderValue = Number.isFinite(numeric) ? Math.min(100, Math.max(0, Math.round(numeric))) : sliderValue;
    const ratio = sliderValue / 100;
    sliderConfigs[sliderMode].apply(ratio);
    if (heatSliderInput && heatSliderInput.value !== `${sliderValue}`) heatSliderInput.value = `${sliderValue}`;
    if (heatSliderValueLabel) heatSliderValueLabel.textContent = sliderConfigs[sliderMode].formatLabel(sliderValue);
  };

  const updateDiagnosticHeatLayerVisibility = () => {
    const shouldShow = heatLayerVisible;
    if (map.getLayer("diagnostic-heat-raster-layer")) {
      map.setLayoutProperty("diagnostic-heat-raster-layer", "visibility", shouldShow ? "visible" : "none");
      if (!shouldShow) {
        map.setPaintProperty("diagnostic-heat-raster-layer", "raster-opacity", 1);
      }
    }
  };

  // La légende s’appuie sur les templates définis plus haut. fromProject=true pour la version “projet”.
  const applyLegendTemplate = (mode, fromProject = false) => {
    const template = fromProject ? pollutionLegendTemplates[mode] : diagnosticPollutionConfigs[mode]?.legend ?? pollutionLegendTemplates[mode];
    if (!template || !noiseLegend || !noiseLegendTitle || !noiseLegendBody) return;
    noiseLegendTitle.innerHTML = template.title;
    noiseLegendBody.innerHTML = template.body;
  };

  // Cette fonction centralise l’affichage/masquage de la légende bruit + du masque sombre.
  const updateNoiseUI = () => {
    const hasDiagnostic = noiseVisibilityState.diagnosticMode !== "none";
    const hasProject = noiseVisibilityState.projectEnabled && noiseVisibilityState.projectMode !== "none";
    const hasSlider = sliderMode !== null;
    const shouldShow = hasDiagnostic || hasProject || heatLayerVisible || projectAttractivityActive || hasSlider;
    if (map.getLayer("focus-mask-layer")) {
      map.setLayoutProperty("focus-mask-layer", "visibility", shouldShow ? "visible" : "none");
    }
    if (noiseLegend) {
      noiseLegend.classList.toggle("visible", shouldShow);
      noiseLegend.setAttribute("aria-hidden", shouldShow ? "false" : "true");
    }
  };

  // Mode “diagnostic chaleur actuel” (c’est lui qui affiche la couche PNG statique sans slider).
  const setHeatLayerVisibility = (visible, { suppressLegendUpdate } = {}) => {
    heatLayerVisible = Boolean(visible);
    if (heatLayerVisible && sliderMode === "heat") {
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

  heatSliderInput?.addEventListener("input", () => {
    if (!sliderMode) return;
    applySliderBlend(heatSliderInput.value);
  });

  // Activation d’un filtre “diagnostic” (bruit ou air). On coupe ce qui pourrait entrer en conflit (chaleur/projet).
  const setDiagnosticPollutionMode = (mode, { suppressLegendUpdate } = {}) => {
    if (mode !== "none" && heatLayerVisible) {
      setHeatLayerVisibility(false, { suppressLegendUpdate: true });
    }
    if (mode !== "none") {
      clearProjectContext();
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

  const deselectLayerGroup = (keys) => {
    keys.forEach((targetKey) => {
      const targetInput = layerInputByKey[targetKey];
      if (!targetInput || !targetInput.checked) return;
      targetInput.checked = false;
      const targetHandler = layerHandlers[targetKey];
      if (targetHandler) targetHandler(false);
    });
  };


  // États internes pour savoir quel filtre “projet” est activé (afin de couper les autres au besoin).
  let projectResilienceActive = false;
  let projectNoiseActive = false;
  let projectAirActive = false;
  let projectAttractivityActive = false;
  const setProjectResilienceState = (active) => {
    projectResilienceActive = active;
    if (active) {
      clearDiagnosticContext({ skipFilterReset: true });
      if (projectNoiseActive) setProjectNoiseState(false);
      if (projectAirActive) setProjectAirState(false);
      noiseVisibilityState.projectEnabled = true;
      noiseVisibilityState.projectMode = "heat2050";
      applyLegendTemplate("heat2050", true);
    } else {
      noiseVisibilityState.projectEnabled = false;
      noiseVisibilityState.projectMode = "none";
    }
    updateNoiseUI();
    setProjectAnnotationsVisibility();
    setProjectHeat2050Visibility(active);
    if (active) {
      setSliderMode("heat");
    } else if (sliderMode === "heat") {
      setSliderMode(null);
    }
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
      if (sliderMode === "noise") setSliderMode(null);
    }
    updateNoiseUI();
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
      if (sliderMode === "air") setSliderMode(null);
    }
    updateNoiseUI();
  };

  const setProjectAttractivityState = (active) => {
    projectAttractivityActive = active;
    if (active) {
      applyLegendTemplate("attractivity", true);
    }
    updateNoiseUI();
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

  const setFilterButtonState = (filterKey, isActive) => {
    const button = filterButtonByKey[filterKey];
    if (!button) return;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  };

  const deactivateFilter = (filterKey) => {
    const definition = filterDefinitions[filterKey];
    if (!definition) return;
    definition.deactivate?.();
    setFilterButtonState(filterKey, false);
    if (activeFilterByGroup[definition.group] === filterKey) {
      activeFilterByGroup[definition.group] = null;
    }
  };

  const resetFiltersForGroup = (group) => {
    const currentKey = activeFilterByGroup[group];
    if (!currentKey) return;
    deactivateFilter(currentKey);
  };

  const activateFilter = (filterKey) => {
    const definition = filterDefinitions[filterKey];
    if (!definition) return;
    const group = definition.group;
    const otherGroup = group === "diagnostic" ? "project" : "diagnostic";
    resetFiltersForGroup(group);
    if (group === "diagnostic") {
      resetFiltersForGroup("project");
      clearProjectContext({ skipFilterReset: true });
    } else {
      resetFiltersForGroup("diagnostic");
      clearDiagnosticContext({ skipFilterReset: true });
    }
    definition.activate?.();
    setFilterButtonState(filterKey, true);
    activeFilterByGroup[group] = filterKey;
  };

  const toggleFilter = (filterKey) => {
    const definition = filterDefinitions[filterKey];
    if (!definition) return;
    const group = definition.group;
    const isAlreadyActive = activeFilterByGroup[group] === filterKey;
    if (isAlreadyActive) {
      deactivateFilter(filterKey);
      return;
    }
    activateFilter(filterKey);
  };

  const bindFilterButtons = () => {
  // Pour chaque bouton on branche un handler qui sait activer le bon filtre en fonction de data-filter.
  filterButtons.forEach((button) => {
      const filterKey = button.dataset.filter;
      if (!filterKey || !filterDefinitions[filterKey]) return;
      filterButtonByKey[filterKey] = button;
      const presetActive = button.classList.contains("active");
      button.setAttribute("aria-pressed", presetActive ? "true" : "false");
      if (presetActive) {
        activeFilterByGroup[filterDefinitions[filterKey].group] = filterKey;
      }
      button.addEventListener("click", () => toggleFilter(filterKey));
    });
  };

  // Petite fonction utilitaire pour tout remettre à zéro côté “projet” (couches, sliders, boutons actifs).
  const clearProjectContext = ({ skipFilterReset = false } = {}) => {
    deselectLayerGroup(projectLayerKeys);
    if (!skipFilterReset) resetFiltersForGroup("project");
    if (projectResilienceActive) setProjectResilienceState(false);
    if (projectNoiseActive) setProjectNoiseState(false);
    if (projectAirActive) setProjectAirState(false);
    if (projectAttractivityActive) setProjectAttractivityState(false);
  };

  const clearDiagnosticContext = ({ skipFilterReset = false } = {}) => {
    deselectLayerGroup(diagnosticLayerKeys);
    if (!skipFilterReset) resetFiltersForGroup("diagnostic");
  };

  const enforceLayerExclusivity = (key, checked) => {
    if (!checked || key === "perimeter") return;
    if (diagnosticLayerKeys.includes(key)) {
      clearProjectContext();
    } else if (projectLayerKeys.includes(key)) {
      clearDiagnosticContext();
    }
  };

  const bindLayerInputs = () => {
    layerInputs.forEach((input) => {
      const key = input.dataset.layer;
      const handler = layerHandlers[key];
      if (handler) handler(Boolean(input.checked));
      input.addEventListener("change", () => {
        const checked = Boolean(input.checked);
        enforceLayerExclusivity(key, checked);
        if (handler) handler(checked);
      });
    });
  };

  // Beaucoup de DOM refs pour la démo, on les charge ici pour éviter de tout redemander plus bas.
  const parkingDemoButton = document.querySelector('[data-action="parking-demo"]');
  const parkingDemoOverlay = document.getElementById("parking-demo");
  const parkingDemoTabs = document.getElementById("parking-demo-tabs");
  const parkingDemoBody = document.getElementById("parking-demo-body");
  const parkingDemoClose = document.getElementById("parking-demo-close");
  const parkingDemoAction = document.getElementById("parking-demo-action");
  let parkingDemoRendered = false;
  let parkingDemoElements = null;
  let parkingDemoActiveId = "current";

  const buildParkingList = (items = []) => items.map((item) => `<div class="parking-demo__item"><strong>${item.name}</strong><span>${item.detail}</span></div>`).join("");

  // On construit la modale de démo (version condensée) à la volée lors du premier affichage.
  const renderParkingDemoStructure = () => {
    if (!parkingDemoBody) return;
    parkingDemoTabs.innerHTML = parkingDemoSteps.map((step) => `<button type="button" class="parking-demo__tab" data-step="${step.id}">${step.label}</button>`).join("");
    parkingDemoBody.innerHTML = `
      <div class="parking-demo__body">
        <div class="parking-demo__slides">
          ${parkingDemoSteps
            .map(
              (step, index) => `
                <article class="parking-demo__slide${index === 0 ? " active" : ""}" data-step="${step.id}">
                  <div class="parking-demo__text">
                    <h3>${step.title}</h3>
                    <p>${step.description}</p>
                  </div>
                  <div id="parking-demo-stats-${step.id}" class="parking-demo__stats"></div>
                  <div id="parking-demo-list-wrapper-${step.id}" class="parking-demo__list-wrapper">
                    <p id="parking-demo-list-title-${step.id}"></p>
                    <div id="parking-demo-list-${step.id}" class="parking-demo__list"></div>
                  </div>
                  <ul id="parking-demo-bullets-${step.id}"></ul>
                </article>
              `,
            )
            .join("")}
        </div>
      </div>
    `;
    parkingDemoElements = {
      stats: {},
      lists: {},
      listTitles: {},
      bullets: {},
    };
    parkingDemoSteps.forEach((step) => {
      parkingDemoElements.stats[step.id] = document.getElementById(`parking-demo-stats-${step.id}`);
      parkingDemoElements.lists[step.id] = document.getElementById(`parking-demo-list-${step.id}`);
      parkingDemoElements.listTitles[step.id] = document.getElementById(`parking-demo-list-title-${step.id}`);
      parkingDemoElements.bullets[step.id] = document.getElementById(`parking-demo-bullets-${step.id}`);
    });
    parkingDemoRendered = true;
  };



  const updateParkingDemoContent = (step) => {
    if (!parkingDemoElements?.stats[step.id]) return;
    const statsContainer = parkingDemoElements.stats[step.id];
    statsContainer.innerHTML = step.cards
      ? step.cards
          .map(
            (card) => `
          <div class="parking-demo__stat-card${card.tone ? ` ${card.tone}` : ""}">
            <h5>${card.label}</h5>
            <strong>${card.value}</strong>
          </div>
        `,
          )
          .join("")
      : "";
    statsContainer.style.display = step.cards?.length ? "flex" : "none";

    const listWrap = parkingDemoElements.lists[step.id];
    const listTitle = parkingDemoElements.listTitles[step.id];
    if (step.list?.length) {
      listWrap.innerHTML = buildParkingList(step.list);
      if (listTitle) listTitle.textContent = step.listTitle || "";
      listWrap.parentElement.style.display = "block";
    } else if (listWrap?.parentElement) {
      listWrap.parentElement.style.display = "none";
      listWrap.innerHTML = "";
    }

    const bullets = parkingDemoElements.bullets[step.id];
    if (bullets) {
      bullets.innerHTML = step.bullets?.length ? step.bullets.map((item) => `<li>${item}</li>`).join("") : "";
      bullets.style.display = step.bullets?.length ? "block" : "none";
    }
  };

  const setParkingDemoStep = (stepId) => {
    if (!parkingDemoTabs) return;
    const step = parkingDemoSteps.find((item) => item.id === stepId) || parkingDemoSteps[0];
    parkingDemoActiveId = step.id;
    parkingDemoTabs.querySelectorAll("button").forEach((btn) => btn.classList.toggle("active", btn.dataset.step === parkingDemoActiveId));
    parkingDemoBody.querySelectorAll(".parking-demo__slide").forEach((slide) => slide.classList.toggle("active", slide.dataset.step === parkingDemoActiveId));
    updateParkingDemoContent(step);
  };

  const renderParkingDemoContent = () => {
    if (!parkingDemoRendered) return;
    parkingDemoTabs.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => setParkingDemoStep(button.dataset.step));
    });
    setParkingDemoStep(parkingDemoActiveId);
  };

  // Chaque onglet change le contenu (cartes + liste + bullets).
  const closeParkingDemo = () => {
    parkingDemoOverlay?.classList.remove("visible");
    parkingDemoOverlay?.setAttribute("aria-hidden", "true");
  };

  // Lance réellement la démo (construction lazy + premier onglet).
  const startParkingDemo = () => {
    if (!parkingDemoOverlay) return;
    if (!parkingDemoRendered) {
      renderParkingDemoStructure();
      renderParkingDemoContent();
    }
    setParkingDemoStep(parkingDemoActiveId);
    parkingDemoOverlay.classList.add("visible");
    parkingDemoOverlay.setAttribute("aria-hidden", "false");
  };

  parkingDemoButton?.addEventListener("click", () => startParkingDemo());
  parkingDemoClose?.addEventListener("click", closeParkingDemo);
  parkingDemoAction?.addEventListener("click", closeParkingDemo);
  parkingDemoOverlay?.addEventListener("click", (event) => {
    if (event.target === parkingDemoOverlay) closeParkingDemo();
  });

  // Petites annotations textuelles qui apparaissent quand on active les scénarios projet (bruit/air).
  const projectAnnotations = {
    noise: [
      {
        coordinates: [6.4968751126029485, 46.510238317446294],
        title: "Axe nord limité à 30 km/h",
        description: "Réduction estimée de 2–3 dB : trafic plus calme, –25 % de personnes très gênées ou réveillées la nuit si la vitesse est respectée.",
        offset: [0, -60],
      },
      {
        coordinates: [6.49860163421879, 46.50937472296998],
        title: "Rue Louis-de-Savoie piétonnisée",
        description:
          "Bruit ramené autour de 40–45 dB(A), ce qui réduit de 40 à 60 % la proportion de personnes fortement gênées et divise presque par deux les perturbations du sommeil (OMS / AEE). Cette baisse s’accompagne d’une diminution mesurable du risque cardiovasculaire lié au bruit, estimée entre 5 et 10 % selon l’exposition initiale.",
        offset: [0, 80],
      },
    ],
    air: [
      {
        coordinates: [6.4968751126029485, 46.510238317446294],
        title: "Axe nord – passer de 50 à 30 km/h",
        description:
          "Réduire la vitesse de 50 à 30 km/h fait baisser les émissions de NO₂ d’environ 15 à 30 %, ramenant la rue de ~30 µg/m³ à 24–27 µg/m³. Ce gain représente 5 à 10 % de crises d’asthme en moins pour les habitants directement exposés.",
        offset: [0, -60],
      },
      {
        coordinates: [6.49860163421879, 46.50937472296998],
        title: "Rue Louis-de-Savoie piétonnisée",
        description:
          "Supprimer la circulation réduit les niveaux de NO₂ de 30 à 50 %, soit d’environ 30 µg/m³ vers 15–20 µg/m³, comparable à une rue calme : 10 à 20 % d’exacerbations d’asthme et d’infections respiratoires en moins, surtout chez les enfants.",
        offset: [0, 80],
      },
    ],
    heat2050: [],
  };
  const projectAnnotationMarkers = [];

  const setProjectAnnotationsVisibility = () => {
    const mode = noiseVisibilityState.projectEnabled ? noiseVisibilityState.projectMode : "none";
    projectAnnotationMarkers.forEach((marker) => {
      const el = marker.getElement();
      if (el) el.style.display = mode !== "none" && marker.__mode === mode ? "" : "none";
    });
  };

  const createProjectAnnotationMarkers = () => {
    Object.entries(projectAnnotations).forEach(([mode, annotations]) => {
      annotations.forEach((annotation) => {
        const el = document.createElement("div");
        el.className = "project-annotation";
        el.innerHTML = `<strong>${annotation.title}</strong><p>${annotation.description}</p>`;
        const marker = new maplibregl.Marker({ element: el, anchor: "left", offset: annotation.offset || [0, 0] })
          .setLngLat(annotation.coordinates)
          .addTo(map);
        marker.__mode = mode;
        projectAnnotationMarkers.push(marker);
      });
    });
    setProjectAnnotationsVisibility();
  };

  const hideBaseIcons = () => {
    const style = map.getStyle();
    if (!style?.layers) return;
    style.layers
      .filter((layer) => layer.type === "symbol" && layer.layout && layer.layout["icon-image"])
      .forEach((layer) => map.setLayoutProperty(layer.id, "visibility", "none"));
  };

  bindFilterButtons();

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
    updateDiagnosticHeatLayerVisibility();
    setDiagnosticPollutionMode(noiseVisibilityState.diagnosticMode);

    const formatArea = (value) => new Intl.NumberFormat("fr-CH").format(Math.round(value));
    const registerSurfacePopup = (layerId, totalArea, label) => {
      map.on("click", layerId, (event) => {
        const feature = event.features?.[0];
        if (!feature) return;
        const area = Number(feature.properties?.areaSqm || 0);
        new maplibregl.Popup({ closeButton: false, maxWidth: "280px" })
          .setLngLat(event.lngLat)
          .setHTML(
            `<div class="surface-popup"><strong>${label}</strong><br />Surface du polygone : ${formatArea(area)} m²<br />Surface cumulée : ${formatArea(totalArea)} m²</div>`,
          )
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

    const createLakePopupHtml = ({ title, description, image }) => `
      <div class="panel-popup">
        ${image ? `<img src="${image}" alt="" />` : ""}
        <div class="panel-popup-body">
          <div class="panel-popup-title">${title || "Relation au lac"}</div>
          ${description ? `<p>${description}</p>` : ""}
        </div>
      </div>
    `;

    const registerLakePopup = (layerId) => {
      map.on("click", layerId, (event) => {
        const feature = event.features?.[0];
        if (!feature) return;
        const { title, description, image } = feature.properties || {};
        new maplibregl.Popup({ closeButton: false, maxWidth: "320px" })
          .setLngLat(event.lngLat)
          .setHTML(createLakePopupHtml({ title, description, image }))
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
    createProjectAnnotationMarkers();

    bindLayerInputs();
    const refreshStyleOverlays = () => {
      hideBaseIcons();
      const projectSpacesInput = layerInputByKey["project-spaces"];
      const visible = Boolean(projectSpacesInput?.checked);
      setProjectSpacesVisibility(visible);
      const lakeOpenInput = layerInputByKey["project-lake-open"];
      setProjectLakeOpenVisibility(Boolean(lakeOpenInput?.checked));
      const lakeRenatureInput = layerInputByKey["project-lake-renature"];
      setProjectLakeRenatureVisibility(Boolean(lakeRenatureInput?.checked));
      const roofInput = layerInputByKey["project-roofs"];
      setProjectRoofsVisibility(Boolean(roofInput?.checked));
      const densityInput = layerInputByKey["project-density"];
      setProjectDensityVisibility(Boolean(densityInput?.checked));
    };
    refreshStyleOverlays();
    map.on("styledata", refreshStyleOverlays);
  });

  projectIntentionsButton?.addEventListener("click", () => {
    console.info("Bouton intentions cliqué — contenu à définir.");
  });
});
