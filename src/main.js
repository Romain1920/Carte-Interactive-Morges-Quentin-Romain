import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { injectSpeedInsights } from "@vercel/speed-insights";
import { inject as injectAnalytics } from "@vercel/analytics";

injectSpeedInsights();
injectAnalytics();

window.addEventListener("DOMContentLoaded", () => {
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
  const filterButtons = Array.from(document.querySelectorAll(".filter-button"));
  const filterButtonByKey = {};
  const activeFilterByGroup = { diagnostic: null, project: null };
  const morgesCenter = [6.496, 46.509];
  const earthRadius = 6378137;
  const baseLatRad = (morgesCenter[1] * Math.PI) / 180;
  const baseLngRad = (morgesCenter[0] * Math.PI) / 180;

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
    [6.501450412415291, 46.511292415945086],
    [6.499424591895478, 46.51159613368384],
    [6.497261352993151, 46.51151939444321],
    [6.496758095499918, 46.511268297909396],
    [6.4962254892134625, 46.510826295068476],
    [6.495571369410231, 46.51000506091868],
    [6.495226510898121, 46.509149342485536],
    [6.495011584792374, 46.508113434212646],
    [6.495337961993485, 46.50709626291264],
    [6.495362662266068, 46.50627646339152],
    [6.496114711894938, 46.505621501513424],
    [6.496979003785363, 46.50521311116872],
    [6.4985990680766905, 46.505691408172424],
    [6.499519390541594, 46.5059110226022],
    [6.500215671573158, 46.506672202208755],
    [6.500300362680759, 46.50762913542213],
    [6.501264950087629, 46.508240619707166],
    [6.502390058702923, 46.50934288196913],
    [6.5027034663427985, 46.510361741089454],
    [6.502318737378544, 46.51109826086595],
    [6.501450412415291, 46.511292415945086],
  ];

  const noiseMaskCoords = [
    [6.501450412415291, 46.511292415945086],
    [6.499424591895478, 46.51159613368384],
    [6.497261352993151, 46.51151939444321],
    [6.496758095499918, 46.511268297909396],
    [6.4962254892134625, 46.510826295068476],
    [6.495571369410231, 46.51000506091868],
    [6.495226510898121, 46.509149342485536],
    [6.495011584792374, 46.508113434212646],
    [6.495337961993485, 46.50709626291264],
    [6.495362662266068, 46.50627646339152],
    [6.496114711894938, 46.505621501513424],
    [6.496979003785363, 46.50521311116872],
    [6.4985990680766905, 46.505691408172424],
    [6.499519390541594, 46.5059110226022],
    [6.500215671573158, 46.506672202208755],
    [6.500300362680759, 46.50762913542213],
    [6.501264950087629, 46.508240619707166],
    [6.502390058702923, 46.50934288196913],
    [6.5027034663427985, 46.510361741089454],
    [6.502318737378544, 46.51109826086595],
    [6.501450412415291, 46.511292415945086],
  ];

  const focusZone = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "Périmètre" },
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
        geometry: { type: "Polygon", coordinates: [noiseMaskCoords] },
      },
    ],
  };

  const noiseBounds = (() => {
    const lngs = noiseMaskCoords.map((c) => c[0]);
    const lats = noiseMaskCoords.map((c) => c[1]);
    return {
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
    };
  })();

  const noiseCanvasWidth = 4096;
  const lngSpan = noiseBounds.maxLng - noiseBounds.minLng || 1e-6;
  const latSpan = noiseBounds.maxLat - noiseBounds.minLat || 1e-6;
  const noiseCanvasHeight = Math.max(2048, Math.round((latSpan / lngSpan) * noiseCanvasWidth));
  const noiseBbox = `${noiseBounds.minLng},${noiseBounds.minLat},${noiseBounds.maxLng},${noiseBounds.maxLat}`;

  const createMaskedImageRenderer = ({ alpha = 0.85, resolveSrc }) => {
    const canvas = document.createElement("canvas");
    canvas.width = noiseCanvasWidth;
    canvas.height = noiseCanvasHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
    }

    const draw = (mapInstance) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        ctx.clearRect(0, 0, noiseCanvasWidth, noiseCanvasHeight);
        ctx.save();
        ctx.beginPath();
        noiseMaskCoords.forEach(([lng, lat], idx) => {
          const x = ((lng - noiseBounds.minLng) / lngSpan) * noiseCanvasWidth;
          const y = ((noiseBounds.maxLat - lat) / latSpan) * noiseCanvasHeight;
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.clip();
        ctx.globalAlpha = alpha;
        ctx.drawImage(image, 0, 0, noiseCanvasWidth, noiseCanvasHeight);
        ctx.restore();
        mapInstance?.triggerRepaint();
      };
      image.src = resolveSrc();
    };

    return { canvas, draw };
  };

  const createMaskedWmsRenderer = ({ layer, alpha = 0.85 }) =>
    createMaskedImageRenderer({
      alpha,
      resolveSrc: () =>
        `https://wms.geo.admin.ch/?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=TRUE&BGCOLOR=0x00000000&LAYERS=${layer}&SRS=EPSG:4326&BBOX=${noiseBbox}&WIDTH=${noiseCanvasWidth}&HEIGHT=${noiseCanvasHeight}`,
    });

  const createMaskedLocalImageRenderer = ({ imagePath, alpha = 0.85 }) =>
    createMaskedImageRenderer({
      alpha,
      resolveSrc: () => imagePath,
    });

  const heatFillExpression = [
    "match",
    ["round", ["coalesce", ["get", "T_WR"], 0]],
    1,
    "#0ea5e9",
    2,
    "#38bdf8",
    3,
    "#facc15",
    4,
    "#f97316",
    5,
    "#dc2626",
    "#0ea5e9",
  ];

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

  const projectPollutionConfigs = {
    air: {
      key: "air",
      sourceId: "project-air",
      layerId: "project-air-layer",
      wmsLayer: "ch.bafu.luftreinhaltung-stickstoffdioxid",
      alpha: 0.75,
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

  Object.values(diagnosticPollutionConfigs).forEach((config) => {
    if (config.wmsLayer) Object.assign(config, createMaskedWmsRenderer({ layer: config.wmsLayer, alpha: config.alpha }));
  });

  Object.values(projectPollutionConfigs).forEach((config) => {
    if (config.wmsLayer) {
      Object.assign(config, createMaskedWmsRenderer({ layer: config.wmsLayer, alpha: config.alpha }));
    }
  });

  const pollutionCanvasCoordinates = [
    [noiseBounds.minLng, noiseBounds.maxLat],
    [noiseBounds.maxLng, noiseBounds.maxLat],
    [noiseBounds.maxLng, noiseBounds.minLat],
    [noiseBounds.minLng, noiseBounds.minLat],
  ];

  const cloneFeature = (feature, overrides = {}) => ({
    ...feature,
    geometry: { ...feature.geometry, coordinates: [...feature.geometry.coordinates] },
    properties: { ...feature.properties, ...overrides },
  });

  const diagnosticFeatures = [];

  const diagnosticAutoAxesPrimary = {
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

  const diagnosticAutoAxesSecondary = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [
            [6.521726909130038, 46.51778626113868],
            [6.520813817843157, 46.51783065853215],
            [6.519418332648826, 46.51789986825811],
            [6.518893037347558, 46.517917500513306],
            [6.5184044916196076, 46.51790999190509],
            [6.517411492124747, 46.51781789898482],
            [6.517065647654154, 46.5177851598589],
            [6.5168325057775105, 46.517734483929466],
            [6.515799386145899, 46.51761738106768],
            [6.513477563787053, 46.51735186956948],
            [6.511480500514598, 46.51710151632039],
            [6.509293794530041, 46.516856463163194],
            [6.508896375071936, 46.516849503085815],
            [6.508621915142371, 46.51680828483323],
            [6.507501017933429, 46.51664220078099],
            [6.5069119632437795, 46.516502466111085],
            [6.50580020766523, 46.516103064146904],
            [6.504437936180417, 46.515578670069154],
            [6.50415114219732, 46.51543670356163],
            [6.503790377740609, 46.515206391498076],
            [6.503384723525724, 46.51488494446459],
            [6.502658860690346, 46.514261153236966],
            [6.501877076632802, 46.51360084215247],
            [6.501473048909835, 46.51326257443014],
            [6.501310010339687, 46.51311285947171],
            [6.500783216540129, 46.51267052543691],
            [6.500424500708535, 46.51235893869402],
            [6.500262550694509, 46.51219346683935],
            [6.500119780541846, 46.51199839903111],
            [6.500013880545918, 46.511794119761],
            [6.499986123088533, 46.511711230016914],
            [6.4999333108080775, 46.51149797548117],
            [6.499931914355522, 46.51139223338985],
            [6.4999368116902465, 46.51128839534074],
            [6.4999288938122275, 46.511166008934204],
            [6.4998889100325865, 46.51109312822637],
            [6.499827589968525, 46.51105450969969],
            [6.499717297565654, 46.51104649476461],
            [6.499211856875037, 46.511136269339595],
            [6.4988993598324285, 46.511203574182545],
            [6.498648336866, 46.51121450505296],
            [6.498499428451175, 46.5111882397002],
            [6.498291740970021, 46.51113155330125],
            [6.498050207054968, 46.511059281714004],
            [6.497849784516094, 46.51095253225261],
            [6.497754817746535, 46.51087785938315],
            [6.49746067513977, 46.51064656308589],
            [6.496973387399011, 46.51025937252292],
            [6.496899720391048, 46.51019485243167],
            [6.496607704451221, 46.509649071568006],
            [6.496393854510477, 46.50924048548982],
            [6.496205486642244, 46.50889179170755],
            [6.496158713724916, 46.508761438830355],
            [6.496151459785388, 46.50866337910858],
            [6.496171274096636, 46.508481443344365],
            [6.4961961933903, 46.50817859441828],
            [6.496212632242931, 46.50802415000929],
            [6.4962277614305615, 46.50790250293961],
            [6.496211728539376, 46.50785638691791],
            [6.4961865019480705, 46.507811835622825],
            [6.496137015015498, 46.507780605246694],
            [6.496051754501026, 46.50773731920063],
            [6.4959163162829805, 46.507697776851494],
            [6.49483509943577, 46.50754833301149],
            [6.49437726277191, 46.507485632365025],
            [6.49359819056161, 46.50736908075702],
            [6.493157814903147, 46.50728479256164],
            [6.492777594461227, 46.507193272786886],
            [6.492460912693525, 46.507115439096786],
            [6.4916703949158165, 46.506883279031804],
            [6.491033113971361, 46.50666779255719],
            [6.490692891260315, 46.50651924197197],
            [6.490308237109609, 46.50634061013371],
            [6.4901685237666085, 46.50628089246222],
            [6.490106272564626, 46.50628097284407],
            [6.490013585358062, 46.50628863876375],
            [6.489904619114196, 46.50628050581216],
            [6.4898603475968875, 46.506263559194366],
            [6.489807946016262, 46.50622265876369],
            [6.489787815511246, 46.50617546379824],
            [6.489763922281316, 46.50612285013564],
            [6.489686509297527, 46.50606436286396],
            [6.489396925345237, 46.50577773600797],
            [6.4890647089145, 46.50544074051334],
            [6.488655215665689, 46.50501731600521],
            [6.488387748916604, 46.50476931582458],
            [6.48761100313935, 46.503934734424575],
            [6.487537429687235, 46.50387614077674],
            [6.4874759681428875, 46.503826848739884],
            [6.4874083936956985, 46.50379872395064],
            [6.48734498873844, 46.50376705315254],
            [6.48730760381606, 46.503735467019695],
            [6.487291233719115, 46.50370236682109],
            [6.487294491016761, 46.503668218856106],
            [6.48727584860803, 46.50362340093035],
            [6.487216479365852, 46.50349859979418],
            [6.486827014595505, 46.503077553854304],
            [6.486182679022653, 46.502415951083655],
            [6.485835495716196, 46.502047153889364],
            [6.485337544588732, 46.501527471992304],
            [6.485057088521424, 46.50121675523302],
            [6.484586666840533, 46.50074167248584],
            [6.484318986746172, 46.50049085445436],
            [6.484207919903419, 46.50036601025136],
            [6.483999364318606, 46.50010372568466],
            [6.483770031376186, 46.49985565975677],
            [6.4834108525886895, 46.499476833527645],
            [6.483017069768051, 46.49905817405203],
            [6.482616987929087, 46.49863139794889],
            [6.482234719184772, 46.498234277532625],
            [6.482074935302258, 46.498039550744046],
            [6.481976191217461, 46.497910146271394],
            [6.4818746632756, 46.497758911566926],
            [6.48179527545893, 46.49754882647743],
            [6.4817502640514935, 46.497403792644214],
            [6.481701867011545, 46.49708266542362],
            [6.481660661271828, 46.49690830230212],
            [6.481597695399632, 46.49670886572515],
            [6.48149413870613, 46.496530574445785],
            [6.481371949074853, 46.49636989697665],
            [6.48123848834053, 46.49621300341585],
            [6.480834102769592, 46.49590714056319],
            [6.480635674565832, 46.49579274251283],
            [6.480328812992505, 46.49562750528244],
            [6.4801480765523864, 46.495554518948346],
            [6.479936451120019, 46.49547699767516],
            [6.479814785596341, 46.49544063068585],
            [6.479697428502158, 46.495439316373904],
            [6.47964547541177, 46.495430892310864],
            [6.479597668871016, 46.495406523551736],
            [6.479540389865051, 46.49535850364645],
            [6.479471150644604, 46.49531266259342],
            [6.4792197954136155, 46.495193719757005],
            [6.478946065201659, 46.49509730932316],
            [6.478131668441033, 46.49481783153197],
            [6.477542504995659, 46.49461612010145],
            [6.476958516381149, 46.49441050703701],
            [6.476051952918704, 46.494091864028476],
            [6.475353311047611, 46.493853107519456],
            [6.4748875149084535, 46.49369564027114],
          ],
        },
      },
    ],
  };

  const coneBaseData = [
    {
      coordinates: [6.502018594868456, 46.512924952548545],
      bearing: 100,
      title: "Arrivée par l'est",
      description: "Apperçu du littoral en approche du site par l'Est. Accès impossible mais vue agréable. ",
      image: "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/20251009_145607.jpg",
    },
    {
      coordinates: [6.501356850392333, 46.5110231303041],
      bearing: 50,
      title: "Perspective sur la baie et la Marina",
      description: "Dégagement de la vue et accès en trompe l'oeil. Vue dégagé et emplacement idéal en bordure de baie mais malgré un aménagement laissant espérer la possibilité de baignade celle-ci est interdite par la présence d'une petite Marina ",
      image: "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/20251009_145505.jpg",
    },
    {
      coordinates: [6.501943833511341, 46.51057462619408],
      bearing: 180,
      title: "Entrée sur les quais Igor Starvinsky et Lochmann depuis l'Est",
      description: "On retrouve la même relation limitée que depuis l'approche par l'Est, accès et relation avec le Lac physiquement impossible sauf qu'ici, la croissance des massifs végétaux esthétique, empêche à plusieurs points la vue sur la Lac.",
      image: "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/20251009_153431.jpg",
    },
    {
      coordinates: [6.499741357559488, 46.50800873941242],
      bearing: 160,
      title: "Accès au Lac",
      description: "Depuis l'approche de l'Est jusqu'au parc de l'indépendance, ce petit espace est le seul permettant l'accès direct au Lac pour les usagers. Bien que très minéralisé et limité dans son approche, il montre le potentiel d'un traitrement différent du littoral sur le reste du littoral. ",
      image: "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/20251009_153921.jpg",
    },
    {
      coordinates: [6.499049572322902, 46.50769169116244],
      bearing: 190,
      title: "Vue sur le port de Morges",
      description: "Lieu emblématique du littoral morgien, ce port, malgré l'accès limité au Lac qu'il impose, offre une vue superbe en bordure de vielle ville avec ses tourelles et ses drapeaux, il amène beaucoup de cachet à la place de la Navigation",
      image: "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/20251009_154108.jpg",
    },
    {
      coordinates: [6.4969549392799255, 46.50530171580491],
      bearing: 200,
      title: "Fin de parcours au Parc de l'Indépendance ",
      description: "La vue dégagée malgrée la digue d'enrochement et la rembarde démontre le gain visuel d'un littoral aménagé pour favoriser la vue. Malgré tout, le traitement très minéral laisse encore du potentiel gagnerait à être renaturé en partie",
      image: "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/20251009_154735.jpg",
    },
  ];

  const degToRad = (value) => (value * Math.PI) / 180;

  const destinationFromPoint = (center, distance, bearingDeg) => {
    const bearingRad = degToRad(bearingDeg);
    const latRad = (center[1] * Math.PI) / 180;
    const angularDistance = distance / earthRadius;
    const destLat = Math.asin(Math.sin(latRad) * Math.cos(angularDistance) + Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(bearingRad));
    const destLng =
      (center[0] * Math.PI) / 180 +
      Math.atan2(Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(latRad), Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(destLat));
    return [destLng * (180 / Math.PI), destLat * (180 / Math.PI)];
  };

  const createConePolygon = (center, bearingDeg) => {
    const halfSpread = 22;
    const longDistance = 85;
    const steps = 6;
    const coords = [center];
    for (let i = 0; i <= steps; i += 1) {
      const angle = bearingDeg - halfSpread + (2 * halfSpread * i) / steps;
      coords.push(destinationFromPoint(center, longDistance, angle));
    }
    coords.push(center);
    return [coords];
  };

  const diagnosticLakeViews = {
    type: "FeatureCollection",
    features: coneBaseData.map((view, index) => ({
      type: "Feature",
      properties: {
        id: `lake-view-${index}`,
        title: view.title,
        description: view.description,
        image: view.image,
      },
      geometry: { type: "Polygon", coordinates: createConePolygon(view.coordinates, view.bearing) },
    })),
  };

  const diagnosticParkingSurfaces = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [6.496740361875448, 46.507307623459496],
              [6.496768392153997, 46.50728407218919],
              [6.4954880716186105, 46.50642135143851],
              [6.495465022385507, 46.506458578761105],
              [6.496740361875448, 46.507307623459496],
            ],
          ],
        },
      },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.497048890965973, 46.50637461256626],[6.497120837430418, 46.50634940879405],[6.497291606564025, 46.506599347678346],[6.4972562769224975, 46.506612102561164],[6.497433247526717, 46.506864619366844],[6.497393240131134, 46.50687446792284],[6.497048890965973, 46.50637461256626]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.497356749050932, 46.50658229988694],[6.497425291718445, 46.50657049177478],[6.497448461380746, 46.50663090271072],[6.497512888637701, 46.50673566732606],[6.49760988016013, 46.50684651448538],[6.497644743757171, 46.50688248299684],[6.4975828930412245, 46.50690601729481],[6.497509619207129, 46.5068337485783],[6.49745131504717, 46.506764924906946],[6.497398259448947, 46.506686681117586],[6.497366219812396, 46.50662240829983],[6.497356749050932, 46.50658229988694]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.499051326506605, 46.50781259554588],[6.499068436141735, 46.507799221803204],[6.499969854757954, 46.50837227160071],[6.499947967917399, 46.50838904982367],[6.499051326506605, 46.50781259554588]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.499083776364201, 46.50791485565012],[6.499103092447411, 46.507899574417536],[6.499867169826933, 46.508384354882615],[6.499845439853742, 46.50840118358256],[6.499083776364201, 46.50791485565012]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.500045221756753, 46.508447150937776],[6.500198222983621, 46.5085474774866],[6.5002215133185635, 46.5085325311615],[6.500064539175866, 46.50843589326747],[6.500045221756753, 46.508447150937776]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.499990665306125, 46.50849751028372],[6.500011314967364, 46.508478996362356],[6.500150334852286, 46.50856993341489],[6.500289791593351, 46.50866299997369],[6.500339564803219, 46.50870724733008],[6.500312543906875, 46.50871865920289],[6.500239553081174, 46.50866052859827],[6.50016026682223, 46.50860794743323],[6.499990665306125, 46.50849751028372]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.500309853321718, 46.50861852906085],[6.500331415033887, 46.50861022071965],[6.500477832637929, 46.50874331819517],[6.500536864446481, 46.50880985504229],[6.50060826910619, 46.50890223891017],[6.500710832787258, 46.50905217874996],[6.500817568841892, 46.50920457072836],[6.500895686115237, 46.50932758309269],[6.501056028495521, 46.50955662252595],[6.50129384778404, 46.50989147371732],[6.501263952471775, 46.50989838151396],[6.500970375420416, 46.50949009433429],[6.500895260281113, 46.509380021381034],[6.500800902267798, 46.50923994001017],[6.500636454213835, 46.50899976501515],[6.500567755527532, 46.50890160518008],[6.500515575772803, 46.50883322737156],[6.500463263677317, 46.50877424530766],[6.5004081206819295, 46.50871650138755],[6.500335578015516, 46.50865336335967],[6.500309853321718, 46.50861852906085]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.5003672242107005, 46.50877285004121],[6.500389704710833, 46.50876409947573],[6.500495795830922, 46.5088767166852],[6.500604064595328, 46.50902578661127],[6.500826248668611, 46.5093520467776],[6.5007954490280255, 46.50936180749891],[6.50070438764101, 46.509229755042966],[6.500644496899101, 46.509142569010834],[6.5005714062046955, 46.509041536820526],[6.500521280029216, 46.5089703716987],[6.500464186601584, 46.50889155131601],[6.500409335416564, 46.50882167541579],[6.5003672242107005, 46.50877285004121]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.500851312459859, 46.50943553681151],[6.5008786118988064, 46.509428034857365],[6.501031831905596, 46.509651315475146],[6.501142336435905, 46.50980341848654],[6.501211751297834, 46.50991588298614],[6.501186104087224, 46.5099223128007],[6.501130372334297, 46.5098446918115],[6.501064397269792, 46.50975460574635],[6.500987701765003, 46.509645233172535],[6.500937218061845, 46.509573488967796],[6.500892158802477, 46.509500946183344],[6.500851312459859, 46.50943553681151]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.501361685195061, 46.51017212087246],[6.5013837712299525, 46.510165303149826],[6.501486798005686, 46.51030992914595],[6.501561898739559, 46.51041715860893],[6.501587169531399, 46.51046065828941],[6.501607655259544, 46.51054443287434],[6.501598778070352, 46.510605256413704],[6.501563612371354, 46.510661034341055],[6.5015079681251216, 46.51071485943747],[6.501429847858608, 46.51076450167224],[6.501342086424611, 46.510790986709],[6.500170918453973, 46.51097994875673],[6.500164149079322, 46.510952953203414],[6.500525803751438, 46.510896087876084],[6.500856812226572, 46.51084473831097],[6.501005376840941, 46.51082039031675],[6.501167085436436, 46.510796224550454],[6.501292229522415, 46.51077989170784],[6.501368300245436, 46.51076128725962],[6.5014180001508635, 46.51074414465927],[6.501462914075403, 46.510713868740176],[6.50151503208928, 46.51067290953205],[6.501543516106236, 46.51063526571238],[6.501561625553969, 46.510596815782975],[6.501569488000827, 46.51056018587941],[6.501562652288985, 46.510509666083415],[6.50154724134294, 46.510462600150724],[6.501498677668087, 46.510382480258784],[6.501361685195061, 46.51017212087246]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.501491054540114, 46.51022456437893],[6.50151951882182, 46.51021536049586],[6.501643390692208, 46.51039778816487],[6.501693832702062, 46.51049201177186],[6.501696222485224, 46.510574698593935],[6.501681481462212, 46.510651698580205],[6.501636088153621, 46.51070847441429],[6.501608458497439, 46.510740288295366],[6.501500743382492, 46.51080297315163],[6.501486110389085, 46.51078678904266],[6.501563772468225, 46.510741556768565],[6.5015895840711275, 46.510728303726616],[6.50165704327341, 46.51064855537692],[6.501669008584849, 46.510577531136946],[6.501665899021261, 46.51049349947401],[6.501623847307214, 46.51042147733526],[6.501491054540114, 46.51022456437893]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.500279244819434, 46.51105743210047],[6.500287145738467, 46.51100895987766],[6.501220895775314, 46.51086306890128],[6.501213723431084, 46.510910668663044],[6.500279244819434, 46.51105743210047]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.500637992006449, 46.51032396006996],[6.500689625757229, 46.510350827528335],[6.500716554806562, 46.5103867875989],[6.500785518889611, 46.51049324070504],[6.500820202035163, 46.51053696573563],[6.500697343337924, 46.51055972352111],[6.500108349286399, 46.51066520214356],[6.500091675335025, 46.510592022510686],[6.500090965371463, 46.51055051189339],[6.500078349651393, 46.51042156779],[6.500637992006449, 46.51032396006996]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.500719256343859, 46.510289571420294],[6.5007279066936, 46.510306145436815],[6.5012168341680825, 46.51015912367535],[6.501199358859231, 46.51013632698933],[6.500719256343859, 46.510289571420294]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.499752078824764, 46.508580298218114],[6.499895486553617, 46.50848091685109],[6.499920339375193, 46.508497055725705],[6.499776516924073, 46.50859569923192],[6.499752078824764, 46.508580298218114]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.499303851473064, 46.50887601499277],[6.499319613738914, 46.50889304862951],[6.4995079907814, 46.50876817939791],[6.4994871478837, 46.508753257904495],[6.499303851473064, 46.50887601499277]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.496640162317334, 46.50924990395242],[6.496774174085218, 46.50917668852632],[6.496834555609934, 46.50921136471872],[6.496710994865175, 46.50928093331916],[6.496640162317334, 46.50924990395242]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.496866394433032, 46.50912242753314],[6.496928927571275, 46.509153230531886],[6.497117720571311, 46.50904751486777],[6.497046149557593, 46.50901293781023],[6.496866394433032, 46.50912242753314]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.496715244588168, 46.509320611597104],[6.496737154386472, 46.509340018320835],[6.496998216519024, 46.509209711126346],[6.496984795311062, 46.509177109425444],[6.496715244588168, 46.509320611597104]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.497091419414323, 46.509122311642955],[6.497107753444589, 46.50914754306005],[6.497246057203961, 46.509102608960056],[6.49721970120836, 46.50907808870803],[6.497091419414323, 46.509122311642955]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.496560519944998, 46.50943649055277],[6.496710798587506, 46.509356652831954],[6.496960897421311, 46.50922833874768],[6.497125845497345, 46.5093859041808],[6.497118737742755, 46.50942832009043],[6.496658860035441, 46.50963300490392],[6.496560519944998, 46.50943649055277]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.4993932450713165, 46.510925157987735],[6.499418337076975, 46.51095864483894],[6.499743477786177, 46.51088622118962],[6.499816979957311, 46.51082005695572],[6.4993932450713165, 46.510925157987735]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.497023359347758, 46.50883519180194],[6.4970525341700895, 46.50882143003934],[6.497173843948585, 46.50893890328013],[6.497148350149024, 46.50895522933666],[6.497023359347758, 46.50883519180194]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.496585817946269, 46.50865209421825],[6.496671747418135, 46.508669356000844],[6.496503768613792, 46.50873785766834],[6.496420488678218, 46.50872305659555],[6.496585817946269, 46.50865209421825]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.497646498080617, 46.507776035869604],[6.497668216985971, 46.50776049160596],[6.498132368853707, 46.50809890389966],[6.498107513471996, 46.508113853518246],[6.497646498080617, 46.507776035869604]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.497956750409664, 46.50790699943587],[6.497982568907606, 46.50789291092877],[6.4982295704064015, 46.508062400357446],[6.498206405441348, 46.50807635985183],[6.497956750409664, 46.50790699943587]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.498717619702687, 46.508598284200126],[6.4987301220732645, 46.50856985366492],[6.498735187147234, 46.50855649498985],[6.498909245518473, 46.50869884377718],[6.498885973835872, 46.50873412092391],[6.498717619702687, 46.508598284200126]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.499049382020411, 46.50889280770666],[6.4990806281949824, 46.50887746205363],[6.499208859453438, 46.509019621837034],[6.4991875928390535, 46.5090302426499],[6.499049382020411, 46.50889280770666]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.499322842819743, 46.50916367625139],[6.499355017852305, 46.50915191497672],[6.499508791883503, 46.5093026257625],[6.49947172277274, 46.50931456872113],[6.499322842819743, 46.50916367625139]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.499611692251065, 46.50943905247878],[6.499640876330273, 46.509429434636765],[6.4997273440553345, 46.50952382155408],[6.499698653438254, 46.50953503860594],[6.499611692251065, 46.50943905247878]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.4971637484248825, 46.50717728441658],[6.497242394957704, 46.507197802631104],[6.4974082848490085, 46.50709764359265],[6.4974623351045615, 46.507071650680054],[6.49754618688067, 46.507056710823065],[6.497580923060221, 46.50705599484873],[6.497461089811874, 46.5070215567617],[6.497401130349761, 46.5070424798402],[6.497326387772565, 46.507077547279415],[6.4971637484248825, 46.50717728441658]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.497525311700448, 46.50740501665378],[6.497554464762611, 46.50742228480993],[6.497786260368833, 46.50724350775398],[6.4977576550043405, 46.50722767934881],[6.497525311700448, 46.50740501665378]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.4976269599693195, 46.507434903258776],[6.497654641300087, 46.5074498818317],[6.497704626148659, 46.50740660489698],[6.497676736070574, 46.5073930935242],[6.4976269599693195, 46.507434903258776]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.4978031360427195, 46.50729424139281],[6.497824341305007, 46.50730436586514],[6.4978630256322, 46.50726731008354],[6.497841554074968, 46.50725903537307],[6.4978031360427195, 46.50729424139281]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.496740361875448, 46.507307623459496],[6.496768392153997, 46.50728407218919],[6.4954880716186105, 46.50642135143851],[6.495465022385507, 46.506458578761105],[6.496740361875448, 46.507307623459496]]] } },
    ],
  };

  const diagnosticPrivateSpaces = {
    type: "FeatureCollection",
    features: [
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.500238266840821, 46.50963041368379],[6.500838514059875, 46.50945240057267],[6.501182956271617, 46.509962044140245],[6.500397555192421, 46.51017963109386],[6.500238266840821, 46.50963041368379]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.500224145504925, 46.508965381905476],[6.5001300336692465, 46.50885968042258],[6.500341115114522, 46.50877965838206],[6.500594809088997, 46.50908868925663],[6.500101784085173, 46.50924246275555],[6.500029475709278, 46.50916109624227],[6.500082179248374, 46.5091322613084],[6.500034355233917, 46.50906326980039],[6.500224145504925, 46.508965381905476]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.497873528377307, 46.50730767373011],[6.497953344621687, 46.50724430831081],[6.498227987782245, 46.50738984535604],[6.498489604703154, 46.50754905281343],[6.4987336095445905, 46.50769658536279],[6.498659951396806, 46.50773971748486],[6.498551937138016, 46.507681713167216],[6.498455672699229, 46.50774700438046],[6.498388099090642, 46.50770112116122],[6.498342670640715, 46.50773210539743],[6.498288715907068, 46.50769962154514],[6.498329401517071, 46.50766711473325],[6.498185020191368, 46.507586484918725],[6.498119662352868, 46.507544852126124],[6.497950830158242, 46.50746705455859],[6.49801022250299, 46.507401486653436],[6.497873528377307, 46.50730767373011]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.4988196067176505, 46.508120133073575],[6.4988986520006575, 46.5080609478608],[6.498928172352855, 46.50807843002611],[6.499103425145296, 46.50795750746977],[6.499610701719934, 46.50827699030401],[6.499753371424194, 46.50836499716312],[6.4995007147734825, 46.508503177902746],[6.499419067637224, 46.508419300625945],[6.499339395368361, 46.5083587783249],[6.499278553275894, 46.50839369526954],[6.499157062851216, 46.50831222695216],[6.499117554506885, 46.508337242089546],[6.4989421059571, 46.50821980078427],[6.49896519653552, 46.50820199651411],[6.4988196067176505, 46.508120133073575]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.500589259330797, 46.509426360483786],[6.500768253668868, 46.509364477871294],[6.500596025155879, 46.50909151315645],[6.500417322920595, 46.50914640238783],[6.50046423301168, 46.509213717549905],[6.500452291782481, 46.509219851532926],[6.500499104673504, 46.50928976225069],[6.500589259330797, 46.509426360483786]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.501294318834394, 46.510291726194254],[6.501402567219167, 46.510260191940624],[6.501546058377613, 46.51045800515079],[6.500839987468309, 46.51051645827741],[6.500800583041018, 46.51046765116479],[6.50101045534813, 46.510411546508955],[6.5010407432298605, 46.510443954925684],[6.50135759145815, 46.51040769617023],[6.501294318834394, 46.510291726194254]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.496565998967669, 46.50943605289784],[6.496954512105114, 46.50923086211282],[6.497002211928399, 46.509214405536675],[6.497061458482651, 46.509299198205696],[6.4971035369385675, 46.509286240219154],[6.497121211167242, 46.50931461568846],[6.497214203303892, 46.50928093059529],[6.497257244637756, 46.509336802724334],[6.497389070731319, 46.50928888077702],[6.4974606510813, 46.50937897711501],[6.497377211318052, 46.50941005503585],[6.497478500884026, 46.50953859849562],[6.4973869435690945, 46.509567636076504],[6.497300399580625, 46.50945568963285],[6.497149016162049, 46.50950970780664],[6.497158336251074, 46.50952361905199],[6.496973547357785, 46.5095873544866],[6.496948499781889, 46.50959642385301],[6.496929079242568, 46.50957215540587],[6.496680417570401, 46.509665935868405],[6.496565998967669, 46.50943605289784]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.498644503493989, 46.5107484060673],[6.498787941572029, 46.51086087323155],[6.498772787751484, 46.51089407009109],[6.498801570670819, 46.51092756036073],[6.49901608784314, 46.51088225580008],[6.498969039478508, 46.51077539818817],[6.498851096588272, 46.51067334772454],[6.498644503493989, 46.5107484060673]]] } },
      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[6.498342098715891, 46.510795918765844],[6.498139952954433, 46.510867656815655],[6.498014681221957, 46.510719799940695],[6.497978021458856, 46.51068646538966],[6.498229002160462, 46.51059246721691],[6.498342098715891, 46.510795918765844]]] } },
    ],
  };

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
  const projectParkingSurfaces = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [6.495523080780791, 46.50650032632334],
              [6.495544207364722, 46.50645668899746],
              [6.496796868838325, 46.507318372299984],
              [6.496763008116146, 46.50733951167677],
              [6.495523080780791, 46.50650032632334],
            ],
          ],
        },
        properties: { name: null, description: null },
      },
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [6.4966289493137195, 46.50864233633299],
              [6.4966893319977945, 46.50865969890006],
              [6.4964979482329275, 46.50874578299975],
              [6.496407056305918, 46.50872803331762],
              [6.4966289493137195, 46.50864233633299],
            ],
          ],
        },
        properties: { name: null, description: null },
      },
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [6.501226204642317, 46.51090825437806],
              [6.501241394645769, 46.510862811649226],
              [6.500220358418638, 46.51101505125853],
              [6.500213375027253, 46.511057370581526],
              [6.501226204642317, 46.51090825437806],
            ],
          ],
        },
        properties: { name: null, description: null },
      },
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [6.499901842243361, 46.5084832977443],
              [6.499921574550343, 46.508497106524715],
              [6.499569463245598, 46.5087245453475],
              [6.499551676395529, 46.508712720541816],
              [6.499901842243361, 46.5084832977443],
            ],
          ],
        },
        properties: { name: null, description: null },
      },
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [6.49750812602713, 46.50741934387084],
              [6.49759052681529, 46.50741752628272],
              [6.49783108029518, 46.50724555139142],
              [6.497772767476919, 46.50721739201838],
              [6.49750812602713, 46.50741934387084],
            ],
          ],
        },
        properties: { name: null, description: null },
      },
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [6.499729814868739, 46.51088112025285],
              [6.499777576815894, 46.51082961313548],
              [6.499373923413431, 46.510934864288316],
              [6.4993907181807415, 46.510962527357925],
              [6.499729814868739, 46.51088112025285],
            ],
          ],
        },
        properties: { name: null, description: null },
      },
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [6.500188901108367, 46.51097914514757],
              [6.500180534827158, 46.51094924095604],
              [6.501220870762295, 46.51079387477705],
              [6.501205295563406, 46.51083603680611],
              [6.500188901108367, 46.51097914514757],
            ],
          ],
        },
        properties: { name: null, description: null },
      },
    ],
  };
  const projectAnnotatedParking = annotatePolygonCollection(projectParkingSurfaces);
  const projectDensityOverlay = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "Dessin", type: "linepolygon", id: "drawing_feature_1764506454258" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [6.49634034860895, 46.508990002927604],
              [6.496842674539247, 46.5087771188374],
              [6.497060865890384, 46.50901363401565],
              [6.4968339794181285, 46.50915245756312],
              [6.49682146079734, 46.509142686166356],
              [6.496584556741687, 46.50924497364675],
              [6.49634034860895, 46.508990002927604],
            ],
          ],
        },
      },
    ],
  };
  const projectRoofsOverlay = {
    type: "FeatureCollection",
    features: [
      { type: "Feature", properties: { name: "Dessin", type: "linepolygon", id: "drawing_feature_1764505573001" }, geometry: { type: "Polygon", coordinates: [[[6.496983138283954, 46.50749641452886],[6.497153306077033, 46.50744999049578],[6.497217383634782, 46.50742346526031],[6.497193854605442, 46.5074008935349],[6.497146602022009, 46.50737736444365],[6.497096629541198, 46.50736614356588],[6.497039532568109, 46.5073668597348],[6.496984698021155, 46.50737901291815],[6.496934388094862, 46.50740677779753],[6.496882828371553, 46.50743863494427],[6.496871064593057, 46.50742857529],[6.496691487090754, 46.50754192082923],[6.496673785060709, 46.507561682594755],[6.496663506397245, 46.50757922843457],[6.496654282765976, 46.5076006993885],[6.496653228168495, 46.50762456898119],[6.496658175715812, 46.5076484618016],[6.496670393832373, 46.50767290549285],[6.496690721509807, 46.507693363288844],[6.496848934807868, 46.5077813158467],[6.496885408448549, 46.50770314330756],[6.497090273497445, 46.50759804159121],[6.497041456618777, 46.50756124090566],[6.49705625094707, 46.50755191123115],[6.496983138283954, 46.50749641452886]]] } },
      { type: "Feature", properties: { name: "Dessin", type: "linepolygon", id: "drawing_feature_1764505619234" }, geometry: { type: "Polygon", coordinates: [[[6.496379643221724, 46.50797958027169],[6.496416248441828, 46.50800885457234],[6.496440468994313, 46.508028179898645],[6.496363119192381, 46.508074745770394],[6.496311637172794, 46.508296416123066],[6.496263775227529, 46.50829726892325],[6.496208945872424, 46.508572021741585],[6.496235880107277, 46.5085763790126],[6.496390905421372, 46.508522548717444],[6.4963817612699035, 46.50851191929183],[6.4964376540481155, 46.50849294859642],[6.4966726537729835, 46.508415640748844],[6.496594518242218, 46.50827209549527],[6.496721996261357, 46.508229926386456],[6.496640049908738, 46.508102089451604],[6.496528787235308, 46.508087910008605],[6.496505505647616, 46.50806754183737],[6.49661188275465, 46.50799783632925],[6.496643187673917, 46.508017505020234],[6.4966751950555475, 46.507996555818295],[6.496764204516028, 46.50805725707802],[6.496907494844847, 46.507982743758916],[6.49677412790825, 46.5078858685097],[6.4967326418707465, 46.507908675335706],[6.496621407488122, 46.507826862644514],[6.496379643221724, 46.50797958027169]]] } },
      { type: "Feature", properties: { name: "Dessin", type: "linepolygon", id: "drawing_feature_1764505733004" }, geometry: { type: "Polygon", coordinates: [[[6.498458427873693, 46.50817799645075],[6.498899594160945, 46.50782696081746],[6.498801606194386, 46.50776587409732],[6.498381472481289, 46.508120882502325],[6.498458427873693, 46.50817799645075]]] } },
      { type: "Feature", properties: { name: "Dessin", type: "linepolygon", id: "drawing_feature_1764505773810" }, geometry: { type: "Polygon", coordinates: [[[6.498199309625175, 46.50846700028859],[6.498342662043601, 46.50836392350441],[6.498527812548297, 46.50849435053937],[6.498358971239534, 46.508601208365285],[6.498199309625175, 46.50846700028859]]] } },
      { type: "Feature", properties: { name: "Dessin", type: "linepolygon", id: "drawing_feature_1764505786927" }, geometry: { type: "Polygon", coordinates: [[[6.498419682815945, 46.50866126849146],[6.498612538894174, 46.508544959699584],[6.498699726980542, 46.50861984856117],[6.498512586787252, 46.50875195534456],[6.498419682815945, 46.50866126849146]]] } },
      { type: "Feature", properties: { name: "Dessin", type: "linepolygon", id: "drawing_feature_1764505799155" }, geometry: { type: "Polygon", coordinates: [[[6.498602564206465, 46.50883416630867],[6.49879182792027, 46.508696728417775],[6.4988553571931105, 46.508756222385],[6.498661280794506, 46.508892358918],[6.498602564206465, 46.50883416630867]]] } },
      { type: "Feature", properties: { name: "Dessin", type: "linepolygon", id: "drawing_feature_1764505824237" }, geometry: { type: "Polygon", coordinates: [[[6.4997673899734085, 46.509003943381686],[6.499774957491931, 46.50901601741635],[6.4998670306275095, 46.508981750282075],[6.49991281942035, 46.508988416045966],[6.499935982901664, 46.50900835379897],[6.500044727674298, 46.50896747377951],[6.499992999725248, 46.50891180666871],[6.4997673899734085, 46.509003943381686]]] } },
      { type: "Feature", properties: { name: "Dessin", type: "linepolygon", id: "drawing_feature_1764505840156" }, geometry: { type: "Polygon", coordinates: [[[6.499940199371743, 46.50905015800264],[6.49997342771329, 46.50908696618006],[6.499851306516605, 46.50913401523661],[6.4998610836484145, 46.50914282884001],[6.499837026156947, 46.509151517053176],[6.499879778289606, 46.50919648664614],[6.4996431431200055, 46.509294460268386],[6.499586916751638, 46.50922731362856],[6.499643669062313, 46.509204670789984],[6.499619710522007, 46.509178639869624],[6.499940199371743, 46.50905015800264]]] } },
      { type: "Feature", properties: { name: "Dessin", type: "linepolygon", id: "drawing_feature_1764505866170" }, geometry: { type: "Polygon", coordinates: [[[6.500219942569161, 46.509209818282855],[6.50041335556762, 46.50914724959663],[6.500453694092407, 46.50921137577876],[6.500263053530488, 46.50927402018188],[6.500219942569161, 46.509209818282855]]] } },
      { type: "Feature", properties: { name: "Dessin", type: "linepolygon", id: "drawing_feature_1764505872661" }, geometry: { type: "Polygon", coordinates: [[[6.500273008535056, 46.509348848720975],[6.500357338399484, 46.50947426734228],[6.500564732976781, 46.509410868730235],[6.500488773945523, 46.50930460489914],[6.500384011676448, 46.509333893444314],[6.500371489331851, 46.50931755093432],[6.500273008535056, 46.509348848720975]]] } },
      { type: "Feature", properties: { name: "Dessin", type: "linepolygon", id: "drawing_feature_1764505890505" }, geometry: { type: "Polygon", coordinates: [[[6.499994536978642, 46.51014745247949],[6.500015119517918, 46.51024720003376],[6.500153596240527, 46.51023361790529],[6.500291093186935, 46.510207271102644],[6.500259087244868, 46.510104076597486],[6.500122339784684, 46.510129484251124],[6.499994536978642, 46.51014745247949]]] } },
      { type: "Feature", properties: { name: "Dessin", type: "linepolygon", id: "drawing_feature_1764505911532" }, geometry: { type: "Polygon", coordinates: [[[6.499682806563531, 46.51053505337845],[6.499737276370771, 46.510604954574596],[6.499513061435987, 46.51067818565674],[6.499453823036691, 46.510617929897805],[6.499682806563531, 46.51053505337845]]] } },
      { type: "Feature", properties: { name: "Dessin", type: "linepolygon", id: "drawing_feature_1764505924709" }, geometry: { type: "Polygon", coordinates: [[[6.499219104209865, 46.51063273485817],[6.499153201178145, 46.510568804161714],[6.499237731089279, 46.510527386980314],[6.4993284325394045, 46.51047116296861],[6.499438302729299, 46.51056261150979],[6.499319684383422, 46.51060528226718],[6.499219104209865, 46.51063273485817]]] } },
      { type: "Feature", properties: { name: "Dessin", type: "linepolygon", id: "drawing_feature_1764505941544" }, geometry: { type: "Polygon", coordinates: [[[6.4987932183885455, 46.51025342229448],[6.498951018082648, 46.510399969835696],[6.498997667080127, 46.51044126108273],[6.499076199271103, 46.51050071400941],[6.499165373012777, 46.51046475418067],[6.499252365855997, 46.51040783182533],[6.499165673415203, 46.51035137227353],[6.499112507417216, 46.51030491753074],[6.4990982773864525, 46.5103124605434],[6.498930420537862, 46.51017232406481],[6.4987932183885455, 46.51025342229448]]] } },
      { type: "Feature", properties: { name: "Dessin", type: "linepolygon", id: "drawing_feature_1764505965878" }, geometry: { type: "Polygon", coordinates: [[[6.4978155656578975, 46.509679407517616],[6.497837288246106, 46.509715435639684],[6.4979163274424545, 46.509743856520444],[6.498175556975387, 46.509640581145234],[6.498248910983192, 46.50958763345326],[6.498185241886431, 46.509513041154946],[6.498082801767056, 46.5095682075564],[6.497998042045029, 46.50961731095431],[6.4978155656578975, 46.509679407517616]]] } },
      { type: "Feature", properties: { name: "Dessin", type: "linepolygon", id: "drawing_feature_1764505984015" }, geometry: { type: "Polygon", coordinates: [[[6.498041044337649, 46.51002083578135],[6.497919844432413, 46.509830385828465],[6.49815745152906, 46.509737132788125],[6.498314807293006, 46.50991429293571],[6.498041044337649, 46.51002083578135]]] } },
      { type: "Feature", properties: { name: "Dessin", type: "linepolygon", id: "drawing_feature_1764506003948" }, geometry: { type: "Polygon", coordinates: [[[6.49866065464468, 46.51028660674808],[6.49872301914065, 46.51034908167035],[6.498545638511315, 46.51042655743894],[6.498484843797917, 46.51036601767465],[6.49866065464468, 46.51028660674808]]] } },
      { type: "Feature", properties: { name: "Dessin", type: "linepolygon", id: "drawing_feature_1764506026750" }, geometry: { type: "Polygon", coordinates: [[[6.4962397385751185, 46.50887625385413],[6.496694751731642, 46.50868363058599],[6.496794348783398, 46.508796467194344],[6.496681343357253, 46.50884263391043],[6.496770907490691, 46.50893965632389],[6.496429963351736, 46.50906776187676],[6.496336658086185, 46.508985346266925],[6.4962397385751185, 46.50887625385413]]] } },
    ],
  };
  const projectAnnotatedRoofs = annotatePolygonCollection(projectRoofsOverlay);

  const projectSpacesOverlay = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "Dessin", type: "linepolygon" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [6.495890897623929, 46.50761069910587],
              [6.495996027978302, 46.50769243912074],
              [6.496110855692086, 46.50774141627851],
              [6.496186197185288, 46.50778901753635],
              [6.496225836177111, 46.507839278374],
              [6.496248367503031, 46.507881517031436],
              [6.496352356202259, 46.507910270932236],
              [6.496372350278281, 46.50786998910658],
              [6.496394737831875, 46.50782195041699],
              [6.4964269104390295, 46.50778146969215],
              [6.496461505510653, 46.50773688214297],
              [6.496516716985932, 46.50766248526967],
              [6.496597658260256, 46.507595990257485],
              [6.496674488426237, 46.50753360274293],
              [6.496756464381258, 46.507482940234546],
              [6.4969319847485005, 46.507376329835246],
              [6.497047024468837, 46.507343585614166],
              [6.497111197297977, 46.50734444785377],
              [6.497199279254021, 46.50737759431692],
              [6.497251753099924, 46.50742027311328],
              [6.497352970479291, 46.50753823149212],
              [6.497443568250913, 46.50763192539255],
              [6.497606725629981, 46.507756723131585],
              [6.497823088822088, 46.50791782369437],
              [6.4982511328962875, 46.50823629907442],
              [6.498316928877601, 46.5082780823488],
              [6.498295502088673, 46.50829390090584],
              [6.498612265382403, 46.50852870703704],
              [6.498883943510545, 46.50876260752129],
              [6.498983492482244, 46.508855980795126],
              [6.499227350989339, 46.50910037696698],
              [6.499369173814983, 46.5092345281883],
              [6.499566418286237, 46.50940678709511],
              [6.4996802885855764, 46.50953878322803],
              [6.499802121208248, 46.50974770252402],
              [6.4998685994450085, 46.51009089840898],
              [6.499939717914328, 46.51052320377019],
              [6.499941471375714, 46.510619190396994],
              [6.4998241899384155, 46.51070032565963],
              [6.499879829274058, 46.510812524234304],
              [6.499901000423049, 46.51090913392308],
              [6.499851969552251, 46.51097970749774],
              [6.49981222011255, 46.511000318177686],
              [6.499939642213956, 46.5110577970337],
              [6.500036057293789, 46.51110303190501],
              [6.500128880695285, 46.51109701676407],
              [6.500271513382005, 46.51107181411502],
              [6.5002843014357605, 46.51101086701751],
              [6.501398914168009, 46.510836256181875],
              [6.501460156073581, 46.510819962251624],
              [6.501523642440736, 46.51079517795771],
              [6.501598406432919, 46.510749030929674],
              [6.501653874099582, 46.510686420070634],
              [6.5016831535936594, 46.51063267841289],
              [6.501693658813822, 46.51056805589137],
              [6.5016910350017305, 46.51052702760681],
              [6.501666882446211, 46.510459133031375],
              [6.500930843111551, 46.50936909157333],
              [6.5005403782937945, 46.50881000273138],
              [6.500483939454043, 46.508740005021615],
              [6.500355417227584, 46.50863164272477],
              [6.50023985965612, 46.508543138700325],
              [6.498249350912378, 46.50732467621326],
              [6.497974070008158, 46.50715454350187],
              [6.497778269446169, 46.507033165818186],
              [6.4976702938147, 46.50698817332692],
              [6.497595776648294, 46.506916612908995],
              [6.497655282571704, 46.50688798290791],
              [6.497443226771076, 46.50663779607607],
              [6.497418830189604, 46.50655500700126],
              [6.497465147711652, 46.506538431001985],
              [6.497452304120202, 46.506381656626544],
              [6.497467739949148, 46.50626994150818],
              [6.497112356534003, 46.50619167697876],
              [6.497211107745724, 46.50634759555048],
              [6.497065555338682, 46.50638947803809],
              [6.497405899173866, 46.50689008812718],
              [6.497452019724115, 46.50696972893238],
              [6.497527634407515, 46.507023505070634],
              [6.4976433799681, 46.50703877163249],
              [6.497779338431593, 46.50711467363811],
              [6.499915011398642, 46.508446970730695],
              [6.500347188615688, 46.50872856582147],
              [6.500476061347591, 46.50889623493754],
              [6.500954624255735, 46.50959924039673],
              [6.501381989053072, 46.51021287076271],
              [6.5015539434355665, 46.510471711820465],
              [6.5015726458962675, 46.51058562186325],
              [6.501529404806329, 46.51069069738455],
              [6.501424385724982, 46.51076704365804],
              [6.501335763052585, 46.51077883557697],
              [6.501310736462595, 46.51081044544642],
              [6.500111731693554, 46.51100228711124],
              [6.500057073000568, 46.51085464132165],
              [6.500029800045874, 46.510729581006146],
              [6.500033878468106, 46.51070270840044],
              [6.500229917488298, 46.5106790066517],
              [6.500218395755214, 46.510647002028946],
              [6.500837548217773, 46.51054722224854],
              [6.500677135374621, 46.51034605555791],
              [6.501342707851339, 46.5101644339685],
              [6.501307796808739, 46.51011302854029],
              [6.500707582963727, 46.510290308034364],
              [6.500041183647891, 46.510430289404944],
              [6.499896094516735, 46.50972411841042],
              [6.499862309500222, 46.50961876182259],
              [6.499551509535447, 46.509192065241194],
              [6.499301387070829, 46.50893045244717],
              [6.499026521884233, 46.50870099604006],
              [6.499027247713777, 46.508676213160385],
              [6.498486289131382, 46.5082714504178],
              [6.498510711151988, 46.50825730099212],
              [6.4978599534906065, 46.50781174993604],
              [6.497640524909632, 46.50767478572819],
              [6.497556629123782, 46.50762057958387],
              [6.497543277518116, 46.507563929460694],
              [6.497930643372149, 46.50721461241315],
              [6.497884819359297, 46.5071849102118],
              [6.4974687140287966, 46.507511027116664],
              [6.4972349792056505, 46.50734543279325],
              [6.497175223974783, 46.507261426302016],
              [6.49718011270155, 46.5072273584186],
              [6.497511607346014, 46.507049006917605],
              [6.497529831659434, 46.5070268642766],
              [6.497445491840416, 46.50696928427388],
              [6.496670837111821, 46.507426571145494],
              [6.496436838380407, 46.50758540769646],
              [6.496296684004749, 46.507635718907366],
              [6.496225003950319, 46.507645223107964],
              [6.49611308090976, 46.50763803797448],
              [6.495890897623929, 46.50761069910587],
            ],
          ],
        },
      },
      {
        type: "Feature",
        properties: { name: "Dessin", type: "linepolygon" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [6.496458096164247, 46.50930269004332],
              [6.496504092521046, 46.50933623366402],
              [6.496544494636567, 46.50934285831302],
              [6.496597915709151, 46.50933603638472],
              [6.496633453891105, 46.50930677128361],
              [6.496623959914075, 46.50926095264794],
              [6.496593136532889, 46.50922977324844],
              [6.496813660797284, 46.50914137683619],
              [6.496822103602536, 46.509151659645156],
              [6.496950732886402, 46.509073008764595],
              [6.497107062221214, 46.50898372186958],
              [6.497249899128226, 46.5091066344003],
              [6.496998337891146, 46.50920919116942],
              [6.497073107677559, 46.50929916992435],
              [6.497102212747829, 46.50928621231136],
              [6.4971208117074415, 46.50931188652785],
              [6.4972114410730235, 46.50927940176822],
              [6.497257036107346, 46.50933812578981],
              [6.497391021325083, 46.50929008152573],
              [6.497459199900822, 46.509383023993486],
              [6.497376123664117, 46.5094184391807],
              [6.49747228419167, 46.50953752022122],
              [6.497384967453702, 46.50956945284114],
              [6.497298064160221, 46.50945395216547],
              [6.497143614945514, 46.50951003204796],
              [6.497152839638006, 46.50952365921843],
              [6.4969507298768265, 46.509598397052656],
              [6.49692699689642, 46.50957146077395],
              [6.49665451401125, 46.50967692152331],
              [6.496458096164247, 46.50930269004332],
            ],
          ],
        },
      },
      {
        type: "Feature",
        properties: { name: "Dessin", type: "linepolygon" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [6.496337155644847, 46.50794158611465],
              [6.496447270578704, 46.507733745659316],
              [6.496528516635417, 46.50764213122069],
              [6.4966018876677625, 46.50760877178865],
              [6.496972193887255, 46.50784404718611],
              [6.497505341960537, 46.50825393493043],
              [6.497846637274584, 46.50851739586166],
              [6.497850899441621, 46.50857500000177],
              [6.497906212217401, 46.508628157189136],
              [6.498009479105638, 46.50867056069077],
              [6.498905260349584, 46.509519161115556],
              [6.4993287105464566, 46.5099158884439],
              [6.499818983581898, 46.51045328448073],
              [6.499929363349994, 46.51063176427114],
              [6.499852931231826, 46.51072535673636],
              [6.499796646709071, 46.51066952565184],
              [6.499686460132268, 46.510497976998266],
              [6.499670263376246, 46.51045248603276],
              [6.498916717383119, 46.50980816048096],
              [6.4989233271360325, 46.509769365835275],
              [6.498594070764037, 46.50945431865681],
              [6.49823801321501, 46.50969272184058],
              [6.49776955111765, 46.509867587817666],
              [6.49706618747404, 46.51013209142784],
              [6.49699095057356, 46.51006516652479],
              [6.497750596498474, 46.5097689942554],
              [6.498182181235828, 46.50962989193404],
              [6.498519219027023, 46.50939349360344],
              [6.49830127769784, 46.50918492967224],
              [6.498043236732629, 46.508929182877196],
              [6.497757361864303, 46.508667057485475],
              [6.497332495316072, 46.508331495280665],
              [6.4970607167148575, 46.50809267319562],
              [6.4969567456894275, 46.50794094299903],
              [6.4969011612668925, 46.507974553296364],
              [6.496760982482368, 46.50787332618321],
              [6.496728140257636, 46.50790180184083],
              [6.496610487290813, 46.507817308365375],
              [6.496337155644847, 46.50794158611465],
            ],
          ],
        },
      },
      {
        type: "Feature",
        properties: { name: "Dessin", type: "linepolygon" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [6.496554381279969, 46.507099376143515],
              [6.496756058915287, 46.50703102315409],
              [6.496820497911535, 46.50692221763601],
              [6.4972606268000925, 46.506620090322315],
              [6.497411912727455, 46.506872996893094],
              [6.49747523627259, 46.50694301468621],
              [6.4969143727927285, 46.507226255200166],
              [6.496875254851974, 46.50730513258433],
              [6.496554381279969, 46.507099376143515],
            ],
          ],
        },
      },
    ],
  };

  const projectLakeOpenOverlay = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [6.499182831999206, 46.507523445430486],
              [6.499266267072467, 46.50743818803357],
              [6.499343759376604, 46.50754536886718],
              [6.499432779632309, 46.50763818209108],
              [6.499564903918534, 46.50773134724316],
              [6.500504394194448, 46.50833943511475],
              [6.500416647127505, 46.50840027781508],
              [6.500012352417324, 46.50814233384329],
              [6.499790560436155, 46.508001962111116],
              [6.49964671562018, 46.50791397889118],
              [6.499532991848648, 46.507842391412964],
              [6.4993852923474, 46.50774254742613],
              [6.499267683216869, 46.507640633307396],
              [6.499182831999206, 46.507523445430486],
            ],
          ],
        },
      },
    ],
  };

  const projectLakeRenatureOverlay = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [6.500454462549974, 46.508426903457014],
              [6.500538604683611, 46.50837474055297],
              [6.5006706247822805, 46.5084835193047],
              [6.500768140095553, 46.50857238142042],
              [6.500858635276247, 46.50868013905106],
              [6.501011567323242, 46.50890165572613],
              [6.501260963091319, 46.509241557785934],
              [6.501714257263292, 46.50989214289213],
              [6.501918149517284, 46.51011626994558],
              [6.502037137601975, 46.51026016807153],
              [6.502164061235801, 46.510445309203156],
              [6.502198536286014, 46.510509383887495],
              [6.501984511905669, 46.51056863350806],
              [6.501960612565256, 46.51048966747279],
              [6.501940410807864, 46.51045596592097],
              [6.501860588483452, 46.51034477402457],
              [6.501752307989174, 46.510188194384085],
              [6.501450096894488, 46.509754717053184],
              [6.501080088108059, 46.509226938306085],
              [6.500781737836701, 46.508804038466785],
              [6.500688411164354, 46.508662632271886],
              [6.500630483225462, 46.50859451010286],
              [6.500454462549974, 46.508426903457014],
            ],
          ],
        },
      },
    ],
  };

  const parkingReportData = {
    removedTotal: 284,
    availableTotal: 339,
    removed: [
      { name: "Parking souterrain des Charpentiers", detail: "124 places libres / 574" },
      { name: "Parking de la place de la Navigation", detail: "1 place libre / 43" },
      { name: "Parking Louis-de-Savoie", detail: "4 places libres / 49" },
      { name: "Parking de la place de l’église", detail: "0 place libre / 37" },
      { name: "Parking du quai Lochmann", detail: "0 place libre / 155" },
    ],
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
        "Les parkings en surface du Bourg (Navigation, Louis-de-Savoie, Place de l’église, Quai Lochmann) saturent et coupent la relation au lac. Nous proposons de requalifier ces dalles minérales : cela représente 284 places à reloger.",
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

  const diagnosticAutoAxesTertiary = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [
            [6.496921308213458, 46.50736438019211],
            [6.496972357449504, 46.507282454637675],
            [6.497080035263552, 46.50720716057103],
            [6.497234517511708, 46.507115383206084],
            [6.497410213294337, 46.5070128297491],
            [6.497499210408182, 46.50700085699905],
            [6.497583546618866, 46.507001806331445],
            [6.497685032031424, 46.50703858667231],
            [6.498046358516017, 46.50723674458778],
            [6.500218522408775, 46.508589335944464],
            [6.500342588423238, 46.50868238362723],
            [6.50053915052786, 46.5088976904071],
            [6.500866094023121, 46.50937301829305],
            [6.501130139634095, 46.509755462565465],
            [6.501571251116731, 46.51036499186972],
            [6.501629765152895, 46.51045878036702],
            [6.501647330971985, 46.51051516293315],
            [6.501649905752865, 46.51057257867588],
            [6.501636810750851, 46.51062879515584],
            [6.501603371600973, 46.51068032652204],
            [6.501555146196, 46.51072669564033],
            [6.501478051543527, 46.51077337863253],
            [6.501400621392773, 46.51080276949331],
            [6.501288743575033, 46.51082927637119],
            [6.499988092255196, 46.511026604203785],
          ],
        },
      },
    ],
  };

  const projectAutoWestEast = [
    [6.475438880170141, 46.493852832246844],
    [6.476000172576537, 46.49405090238244],
    [6.47672859907116, 46.49430208799687],
    [6.477772359644058, 46.49466423033653],
    [6.478949884912211, 46.495072219876334],
    [6.479210069596569, 46.49515648782354],
    [6.4793276623746685, 46.495188150783726],
    [6.479493837517201, 46.49522770618859],
    [6.479603563671845, 46.49524588872814],
    [6.479683236649696, 46.495232537384595],
    [6.479721958934533, 46.495234892482195],
    [6.479764178680311, 46.49524231997668],
    [6.479809163990286, 46.49525879172046],
    [6.479839287140332, 46.495284664721076],
    [6.479865662374697, 46.49532849508162],
    [6.479899572613486, 46.49537468389074],
    [6.480111388838777, 46.495491690034356],
    [6.480458038239927, 46.4956597187284],
    [6.4809159723847864, 46.495919341290744],
    [6.481019501497112, 46.49598788091946],
    [6.481154000735081, 46.49609488801033],
    [6.481263318766094, 46.49619116796383],
    [6.4813768815278605, 46.49631157328883],
    [6.481444294880701, 46.496392381380275],
    [6.481532915373931, 46.49651501837458],
    [6.4816079036060055, 46.4966575148148],
    [6.481677201252601, 46.496822552283405],
    [6.481723236431552, 46.49698083949925],
    [6.481739330283024, 46.49708936290098],
    [6.481757639108579, 46.497234628085984],
    [6.481778144342682, 46.497364185877395],
    [6.48181640893618, 46.4974851291487],
    [6.481857946863979, 46.497608022271834],
    [6.4818947923587995, 46.49769874220453],
    [6.481958933921756, 46.497814488374786],
    [6.4820413275810385, 46.49793866081625],
    [6.4821127925509225, 46.49803425866081],
    [6.482330730933213, 46.49828276326062],
    [6.4826198935368575, 46.49859347827354],
    [6.4828678025035344, 46.49884670445154],
    [6.483322248421561, 46.49933566100609],
    [6.4837898323502, 46.499835179667386],
    [6.483948414932256, 46.50000227806349],
    [6.48412306992253, 46.500188087397724],
    [6.48430675068691, 46.50038821181481],
    [6.484420594521441, 46.500503949490636],
    [6.484896503337559, 46.50101346973765],
    [6.48543160785546, 46.501577427428025],
    [6.486146971015576, 46.50231586379342],
    [6.487140258913072, 46.50338165680995],
    [6.487315189913331, 46.50353189292932],
    [6.487423144362949, 46.503596812241604],
    [6.487503316473769, 46.50363755661579],
    [6.487569957522287, 46.50369125666652],
    [6.487591697870939, 46.50374601047083],
    [6.487629170368506, 46.50385771324377],
    [6.4876564482344214, 46.50392585082043],
    [6.488206161106291, 46.50457571654349],
    [6.488767844163757, 46.505110310185195],
    [6.4894236799479, 46.50576135069207],
    [6.489575474749012, 46.505877270335816],
    [6.489686934591452, 46.50593238368506],
    [6.489806692829052, 46.50598413726255],
    [6.4899065415843635, 46.50601313221294],
    [6.490022526400607, 46.50601574193474],
    [6.490088932338006, 46.50603065518515],
    [6.4901602025770755, 46.50607905146955],
    [6.490197618996444, 46.50612796310092],
    [6.4902505865574565, 46.50620679706465],
    [6.490359601514066, 46.50626893280629],
    [6.490598071540348, 46.50635809311396],
    [6.491101320224307, 46.50653658583602],
    [6.491583401380446, 46.50672233853848],
    [6.492079626362064, 46.50692782634631],
    [6.492406202292177, 46.507036645625305],
    [6.492757193406616, 46.507141611117085],
    [6.492973134952843, 46.50719573883076],
    [6.493438638472816, 46.50729012253441],
    [6.494276278864041, 46.50742133899973],
    [6.494660815425619, 46.507466765922246],
    [6.495097949423329, 46.50755299273764],
    [6.495458980345318, 46.507610865379114],
    [6.495795258539998, 46.50766888605738],
    [6.496004223582955, 46.50772670528349],
    [6.496143356694158, 46.507788167946465],
    [6.496196778148725, 46.507832819968975],
    [6.496239030155887, 46.50787483352828],
    [6.496262315590668, 46.507966525232824],
    [6.4962633574141915, 46.50806533105615],
    [6.4962289868215155, 46.50823034117771],
    [6.4961827145200735, 46.5084579485816],
    [6.496156506536173, 46.50860256353123],
    [6.496152919721213, 46.50873126453399],
    [6.496196437877396, 46.50888307244863],
    [6.496331670714012, 46.50912979134079],
    [6.496455846334228, 46.50935761980128],
    [6.496675376095102, 46.50978060124126],
    [6.49684596058913, 46.510091618803116],
    [6.496911344110243, 46.51019951223484],
    [6.497016500956833, 46.51029362642061],
    [6.497147065546922, 46.51039074162605],
    [6.497641270940366, 46.51078420038898],
    [6.497817220320587, 46.51093247441222],
    [6.497914319134943, 46.51099519918903],
    [6.498066341607317, 46.51106770938401],
    [6.498222336684903, 46.51111376255833],
    [6.498307347886911, 46.51113578768276],
    [6.498494672075666, 46.511186232822354],
    [6.498610958096884, 46.51120990851316],
    [6.498709787510966, 46.51122059167368],
    [6.498810312918457, 46.51122096770866],
    [6.498984375834489, 46.511187208301514],
    [6.4993239214333, 46.51111722450242],
    [6.499578139957282, 46.51106413932904],
    [6.499718096942406, 46.51104047729901],
    [6.499834570975561, 46.51104600616779],
    [6.499902784270016, 46.51107897122336],
    [6.499951524880343, 46.51112475641494],
    [6.499983317327823, 46.51117838200685],
    [6.499989757101383, 46.51126717134983],
    [6.499998423051594, 46.511459362188006],
    [6.500017587954549, 46.51160473991302],
    [6.5000384072349116, 46.51171786078964],
    [6.500104927883493, 46.511875146198214],
    [6.500208696121092, 46.51204977634774],
    [6.500275988294159, 46.51214294516022],
    [6.500430503459042, 46.512306791358135],
    [6.500636837836276, 46.512486756888],
    [6.501107840779147, 46.51287345859511],
    [6.501472076642192, 46.5131687067079],
    [6.501959737547365, 46.51360852505935],
    [6.502753475814572, 46.514270455185176],
    [6.503448991160475, 46.51485581787039],
    [6.503778988064871, 46.51514004161702],
    [6.503861173922918, 46.51519996401393],
    [6.5039873549219065, 46.515279077670456],
    [6.504111745048731, 46.51536110372425],
    [6.504232967227997, 46.51542764125428],
    [6.504379320900603, 46.51549947762868],
    [6.505202747230742, 46.51582592371827],
    [6.505430287642122, 46.515902914252116],
    [6.506331035476681, 46.51623430904773],
    [6.506718502049031, 46.516375588280496],
    [6.507273822507548, 46.51655485945028],
    [6.507667650399472, 46.51663546173359],
    [6.508268774603228, 46.51669782869686],
    [6.509775000364202, 46.51688078508987],
    [6.511837367287607, 46.517109674193165],
    [6.513557954357473, 46.51731149458932],
    [6.51535389273544, 46.517535072107215],
    [6.517030587336146, 46.517726414009346],
    [6.517565880896437, 46.51778699775024],
    [6.518401993527096, 46.51785210492954],
    [6.519083507442143, 46.51787765558828],
    [6.519593668067655, 46.51786410749912],
    [6.5212989198154006, 46.51778994088849],
    [6.523726053284224, 46.517664693801734],
  ];

  const projectAutoEastWest = [
    [6.5249438403401445, 46.51764100313303],
    [6.524363540281023, 46.517652850812055],
    [6.523664620398424, 46.51769420639281],
    [6.520136682884968, 46.51786669985383],
    [6.519159399671542, 46.51791539645402],
    [6.51870765686107, 46.51791915290093],
    [6.518388871250631, 46.51790713209082],
    [6.518005474962164, 46.51787220130699],
    [6.517599766052478, 46.51782238609705],
    [6.517382301932587, 46.517819114514715],
    [6.517214235640277, 46.51780715707446],
    [6.517029465229, 46.517775920476076],
    [6.516889161827616, 46.51774112262715],
    [6.51464095961027, 46.51747905080457],
    [6.511116095167524, 46.51705757280238],
    [6.509437481342511, 46.516870271833504],
    [6.5091429979085795, 46.516845908619096],
    [6.508650981663905, 46.5167897303083],
    [6.50814346450411, 46.51673341421584],
    [6.507681767374885, 46.516674442960095],
    [6.5073612882687035, 46.51661459567832],
    [6.506981540068327, 46.51652263613919],
    [6.505398805166041, 46.51595490159181],
    [6.504831407714093, 46.51573630475121],
    [6.504457927023985, 46.515583206427976],
    [6.5042135209815335, 46.515459306394156],
    [6.503813510346519, 46.515222078510504],
    [6.50364071660654, 46.51509071861165],
    [6.5034182405570355, 46.51490618156059],
    [6.503083909719118, 46.514616395177804],
    [6.502799607245014, 46.51438205097636],
    [6.501888691539219, 46.51360925651665],
    [6.5016043724525865, 46.513379316293886],
    [6.501491052054332, 46.51327710809704],
    [6.501357500152906, 46.513146962132566],
    [6.501083901715028, 46.51291094925959],
    [6.500845118601173, 46.5127176449992],
    [6.500345944476659, 46.51228425053316],
    [6.500232336959184, 46.512151987980985],
    [6.500132599744327, 46.51202719958408],
    [6.50005652984596, 46.511902785584475],
    [6.500012163499454, 46.51177084892313],
    [6.4999725676206745, 46.51166653504287],
    [6.499942758317884, 46.511520952661414],
    [6.49992616783967, 46.511424597038015],
    [6.499924604628083, 46.51120969849228],
    [6.499911057169043, 46.511158736239956],
    [6.499864134867862, 46.51110079688468],
    [6.499773301147564, 46.511063726733674],
    [6.499637319664977, 46.51108051394899],
    [6.499395180438013, 46.511129411879494],
    [6.498832641453795, 46.51123724126737],
    [6.498738344417362, 46.51125912358522],
    [6.498686683287001, 46.51130047154302],
    [6.498645596326312, 46.511319483470615],
    [6.498583292160236, 46.51131660267263],
    [6.498530112220099, 46.5112773874166],
    [6.498427116272456, 46.51121809714359],
    [6.498247748681795, 46.51116877039082],
    [6.4980567416726185, 46.51112128819036],
    [6.497910185672667, 46.51105156692549],
    [6.497717265629119, 46.51090417406055],
    [6.497138916569101, 46.51043402838678],
    [6.496943544589587, 46.51027855177917],
    [6.496900080081103, 46.510242522543976],
    [6.496846385358636, 46.51016986743113],
    [6.496213903590137, 46.50899041002585],
    [6.4961421774968535, 46.508850709017665],
    [6.496126747158361, 46.50879780673402],
    [6.496108331075796, 46.50873455335053],
    [6.496105470337909, 46.508647461295666],
    [6.496126879428859, 46.508488204491485],
    [6.496153684808826, 46.50834306182576],
    [6.496174945470313, 46.50823146055637],
    [6.4961867518818135, 46.5081166963932],
    [6.496207174426581, 46.50803577451221],
    [6.496187826480276, 46.507891530974966],
    [6.496141730323267, 46.507816670086626],
    [6.495942178878271, 46.507723323616865],
    [6.495620480545879, 46.50765860946375],
    [6.4946857741210815, 46.50752371555255],
    [6.493902591453963, 46.50741490458362],
    [6.493597082627333, 46.50736225550887],
    [6.493061483468521, 46.507271164356816],
    [6.492467204061321, 46.50711330486167],
    [6.4917803789156, 46.5069130904889],
    [6.491227595336758, 46.50673815103481],
    [6.490833640502154, 46.50658686378684],
    [6.49052104034603, 46.506432782573974],
    [6.490331289052126, 46.50634348233969],
    [6.49020269128521, 46.50628992968556],
    [6.4901292030788325, 46.50626258567201],
    [6.4900478436691325, 46.50627299063083],
    [6.489957731861925, 46.50627736304648],
    [6.489888253639207, 46.50625951048737],
    [6.489833136869184, 46.50623301359043],
    [6.489797716260987, 46.50619559174586],
    [6.489766487456298, 46.50616341387621],
    [6.4897223434430185, 46.50610391417789],
    [6.489661883680931, 46.50603517761947],
    [6.48946163756161, 46.50584207366226],
    [6.489042588465566, 46.50543083512194],
    [6.488620316095639, 46.50498512976065],
    [6.487639847091331, 46.503969440698064],
    [6.487531676887111, 46.50387387876689],
    [6.487427173105034, 46.50381558211746],
    [6.487354116914614, 46.50379160343899],
    [6.487307653122615, 46.5037582849724],
    [6.487289583414637, 46.5037306491458],
    [6.487281309686987, 46.50368918756721],
    [6.487282053374728, 46.50364691165492],
    [6.487236069868469, 46.50355254284246],
    [6.486986322187438, 46.50324908083267],
    [6.4862303215327755, 46.50246988188359],
    [6.486089629284967, 46.50231497169125],
    [6.485786246639676, 46.50199056943079],
    [6.485644844268536, 46.50184741858635],
    [6.485120267687114, 46.50130034354341],
    [6.484689974242023, 46.50084767466122],
    [6.484381907840762, 46.50055120199006],
    [6.484275328130416, 46.50044390613966],
    [6.484186581275758, 46.50032276508163],
    [6.48411379925866, 46.50024028430137],
    [6.483817042780998, 46.499894712703295],
    [6.483244264611811, 46.499290297170425],
    [6.482642832380571, 46.49865618355146],
    [6.482260335145672, 46.49824493039524],
    [6.48215714564966, 46.498126104567945],
    [6.48210115873045, 46.4980609003216],
    [6.481999657764525, 46.497934510771614],
    [6.481914214814045, 46.49779970273288],
    [6.481817627068903, 46.49760227522283],
    [6.481747348345961, 46.4973584891483],
    [6.481714749088281, 46.497162051714064],
    [6.481693026422345, 46.49701751802261],
    [6.481681999313907, 46.496963295231886],
    [6.481651629300928, 46.49685406428067],
    [6.481604673310315, 46.49673020843091],
    [6.481535563728803, 46.49659568488944],
    [6.481465099318921, 46.496478857593324],
    [6.4813209019982025, 46.496302426278255],
    [6.481137611933369, 46.49612433145852],
    [6.480906016642481, 46.49594535602765],
    [6.480637086215832, 46.49579185594773],
    [6.480148432515912, 46.49554809905283],
    [6.479901605614928, 46.49545872181033],
    [6.479803715837535, 46.49543669292265],
    [6.479731454441613, 46.49543976293943],
    [6.4796599674438395, 46.49543915847313],
    [6.479603944849873, 46.49541685835733],
    [6.479557161547394, 46.49538692711545],
    [6.479515621858892, 46.495345156502445],
    [6.479461779563619, 46.495306173242206],
    [6.479252438834987, 46.49520341483372],
    [6.478969847286414, 46.49510705456711],
    [6.478380791426263, 46.49490156829906],
    [6.477949050365262, 46.49475531836004],
    [6.4773170715226485, 46.494531476463344],
    [6.4764397390497175, 46.49423027475161],
    [6.475664398093551, 46.49395602988253],
    [6.4750753299685195, 46.49375340271848],
    [6.474202385130171, 46.49345630127976],
  ];

  const projectAutoAxes = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { id: "project-axis-1" },
        geometry: { type: "LineString", coordinates: projectAutoWestEast },
      },
      {
        type: "Feature",
        properties: { id: "project-axis-2" },
        geometry: { type: "LineString", coordinates: projectAutoEastWest },
      },
    ],
  };

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
      closeParkingDemo();
    }
  });

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

  const noiseVisibilityState = { diagnosticMode: "none", projectMode: "none", projectEnabled: false };
  const RASTER_MAX_OPACITY = 0.8;
  let heatLayerVisible = false;
  let sliderMode = null;
  let sliderValue = 100;
  let activeDiagnosticFilter = "none";
  let activeProjectFilter = "none";

  const sliderConfigs = {
    heat: {
      title: "Comparer le scénario 2060",
      minLabel: "Scénario 2060",
      maxLabel: "2060 + projet",
      initialValue: 100,
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
  };

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

  const applyLegendTemplate = (mode, fromProject = false) => {
    const source = fromProject ? projectPollutionConfigs : diagnosticPollutionConfigs;
    const template = source[mode]?.legend ?? pollutionLegendTemplates[mode];
    if (!template || !noiseLegend || !noiseLegendTitle || !noiseLegendBody) return;
    noiseLegendTitle.innerHTML = template.title;
    noiseLegendBody.innerHTML = template.body;
  };

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

  const applyProjectPollutionVisibility = ({ suppressLegendUpdate } = {}) => {
    Object.values(projectPollutionConfigs).forEach((config) => {
      if (map.getLayer(config.layerId)) {
        const visible = noiseVisibilityState.projectEnabled && noiseVisibilityState.projectMode === config.key;
        map.setLayoutProperty(config.layerId, "visibility", visible ? "visible" : "none");
      }
    });
    if (!suppressLegendUpdate && noiseVisibilityState.projectEnabled && noiseVisibilityState.projectMode !== "none") {
      applyLegendTemplate(noiseVisibilityState.projectMode, true);
    }
    setProjectAnnotationsVisibility();
    updateNoiseUI();
  };

  let suppressResilienceCleanup = false;

  const setProjectPollutionMode = (mode, { suppressLegendUpdate } = {}) => {
    if (projectResilienceActive && !suppressResilienceCleanup) {
      setProjectResilienceState(false);
    }
    if (mode !== "none" && projectAttractivityActive) {
      setProjectAttractivityState(false);
      if (activeFilterByGroup.project === "project-attractivity") {
        activeFilterByGroup.project = null;
      }
    }
    if (mode !== "none") {
      clearDiagnosticContext();
    }
    const nextMode = projectPollutionConfigs[mode] ? mode : "none";
    noiseVisibilityState.projectMode = nextMode;
    noiseVisibilityState.projectEnabled = nextMode !== "none";
    applyProjectPollutionVisibility({ suppressLegendUpdate });
  };

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


  let projectResilienceActive = false;
  let projectNoiseActive = false;
  let projectAttractivityActive = false;
  const setProjectResilienceState = (active) => {
    projectResilienceActive = active;
    if (active) {
      suppressResilienceCleanup = true;
      setProjectPollutionMode("none", { suppressLegendUpdate: true });
      suppressResilienceCleanup = false;
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
      activate: () => setProjectPollutionMode("air"),
      deactivate: () => setProjectPollutionMode("none", { suppressLegendUpdate: true }),
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

  const clearProjectContext = ({ skipFilterReset = false } = {}) => {
    deselectLayerGroup(projectLayerKeys);
    if (!skipFilterReset) resetFiltersForGroup("project");
    if (projectResilienceActive) setProjectResilienceState(false);
    if (projectNoiseActive) setProjectNoiseState(false);
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

  const parkingDemoButton = document.querySelector('[data-action="parking-demo"]');
  const parkingDemoOverlay = document.getElementById("parking-demo");
  const parkingDemoTabs = document.getElementById("parking-demo-tabs");
  const parkingDemoBody = document.getElementById("parking-demo-body");
  const parkingDemoClose = document.getElementById("parking-demo-close");
  const parkingDemoAction = document.getElementById("parking-demo-action");
  let parkingDemoRendered = false;
  let parkingDemoElements = null;
  let parkingDemoActiveId = null;

  const buildParkingList = (items = []) => items.map((item) => `<div class="parking-demo__item"><strong>${item.name}</strong><span>${item.detail}</span></div>`).join("");

  const buildParkingCards = (cards = []) =>
    cards
      .map(
        (card) => `
      <div class="parking-demo__stat-card${card.tone ? ` ${card.tone}` : ""}">
        <h5>${card.label}</h5>
        <strong>${card.value}</strong>
      </div>
    `,
      )
      .join("");

  const renderParkingDemoStructure = () => {
    if (!parkingDemoTabs || !parkingDemoBody) return;
    parkingDemoTabs.innerHTML = parkingDemoSteps.map((step) => `<button type="button" class="parking-demo__tab" data-step="${step.id}">${step.label}</button>`).join("");
    parkingDemoBody.innerHTML = `
      <div class="parking-demo__body">
        <div class="parking-demo__text">
          <h3 id="parking-demo-title"></h3>
          <p id="parking-demo-desc"></p>
        </div>
        <div id="parking-demo-stats" class="parking-demo__stats"></div>
        <div id="parking-demo-list-wrapper" class="parking-demo__list-wrapper">
          <p id="parking-demo-list-title"></p>
          <div id="parking-demo-list" class="parking-demo__list"></div>
        </div>
        <ul id="parking-demo-bullets"></ul>
      </div>
    `;
    parkingDemoElements = {
      title: document.getElementById("parking-demo-title"),
      description: document.getElementById("parking-demo-desc"),
      stats: document.getElementById("parking-demo-stats"),
      listWrapper: document.getElementById("parking-demo-list-wrapper"),
      listTitle: document.getElementById("parking-demo-list-title"),
      list: document.getElementById("parking-demo-list"),
      bullets: document.getElementById("parking-demo-bullets"),
    };
    parkingDemoTabs.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => setParkingDemoStep(button.dataset.step));
    });
    parkingDemoRendered = true;
  };

  const updateParkingDemoContent = (step) => {
    if (!parkingDemoElements || !step) return;
    parkingDemoElements.title.textContent = step.title || "";
    parkingDemoElements.description.textContent = step.description || "";
    if (step.cards?.length) {
      parkingDemoElements.stats.innerHTML = buildParkingCards(step.cards);
      parkingDemoElements.stats.style.display = "flex";
    } else {
      parkingDemoElements.stats.innerHTML = "";
      parkingDemoElements.stats.style.display = "none";
    }
    if (step.list?.length) {
      parkingDemoElements.listWrapper.style.display = "block";
      parkingDemoElements.listTitle.textContent = step.listTitle || "";
      parkingDemoElements.list.innerHTML = buildParkingList(step.list);
    } else {
      parkingDemoElements.listWrapper.style.display = "none";
      parkingDemoElements.list.innerHTML = "";
    }
    if (step.bullets?.length) {
      parkingDemoElements.bullets.style.display = "block";
      parkingDemoElements.bullets.innerHTML = step.bullets.map((item) => `<li>${item}</li>`).join("");
    } else {
      parkingDemoElements.bullets.style.display = "none";
      parkingDemoElements.bullets.innerHTML = "";
    }
  };

  const setParkingDemoStep = (stepId) => {
    if (!parkingDemoTabs) return;
    const step = parkingDemoSteps.find((item) => item.id === stepId) || parkingDemoSteps[0];
    parkingDemoActiveId = step.id;
    parkingDemoTabs.querySelectorAll("button").forEach((btn) => btn.classList.toggle("active", btn.dataset.step === parkingDemoActiveId));
    updateParkingDemoContent(step);
  };

  const closeParkingDemo = () => {
    parkingDemoOverlay?.classList.remove("visible");
    parkingDemoOverlay?.setAttribute("aria-hidden", "true");
  };

  const startParkingDemo = () => {
    if (!parkingDemoOverlay) return;
    if (!parkingDemoRendered) renderParkingDemoStructure();
    parkingDemoOverlay.classList.add("visible");
    parkingDemoOverlay.setAttribute("aria-hidden", "false");
    setParkingDemoStep(parkingDemoSteps[0].id);
  };

  parkingDemoButton?.addEventListener("click", () => startParkingDemo());
  parkingDemoClose?.addEventListener("click", closeParkingDemo);
  parkingDemoAction?.addEventListener("click", closeParkingDemo);
  parkingDemoOverlay?.addEventListener("click", (event) => {
    if (event.target === parkingDemoOverlay) closeParkingDemo();
  });

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
    Object.values(diagnosticPollutionConfigs).forEach((config) => {
      map.addSource(config.sourceId, {
        type: "canvas",
        canvas: config.canvas,
        coordinates: pollutionCanvasCoordinates,
      });
    });
    Object.values(projectPollutionConfigs).forEach((config) => {
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
        "fill-color": "#94a3b8",
        "fill-opacity": 0.5,
      },
    });
    map.addLayer({
      id: "project-parking-outline",
      type: "line",
      source: "project-parking",
      layout: { visibility: "none" },
      paint: {
        "line-color": "#475569",
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
    Object.values(projectPollutionConfigs).forEach((config) => {
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
    applyProjectPollutionVisibility();

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
