export const cloneFeature = (feature = {}, overrides = {}) => {
  if (!feature || typeof feature !== "object") return feature;
  return {
    ...feature,
    geometry: {
      ...feature.geometry,
      coordinates: Array.isArray(feature.geometry?.coordinates) ? [...feature.geometry.coordinates] : feature.geometry?.coordinates,
    },
    properties: { ...feature.properties, ...overrides },
  };
};

export const createAreaAnnotator = ({ origin = [0, 0], earthRadius = 6378137 } = {}) => {
  const baseLatRad = (origin[1] * Math.PI) / 180;
  const baseLngRad = (origin[0] * Math.PI) / 180;

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

  const annotatePolygonCollection = (collection = { features: [] }) => {
    const features = Array.isArray(collection?.features) ? collection.features : [];
    let totalArea = 0;
    const annotatedFeatures = features.map((feature, index) => {
      if (feature?.geometry?.type !== "Polygon") return feature;
      const areaSqm = polygonArea(feature.geometry.coordinates);
      totalArea += areaSqm;
      return cloneFeature(feature, { areaSqm, id: feature.id ?? `poly-${index}` });
    });
    return { data: { type: "FeatureCollection", features: annotatedFeatures }, totalArea };
  };

  return {
    projectToMeters,
    ringArea,
    polygonArea,
    annotatePolygonCollection,
  };
};

export const collectCoordinates = (collections = []) => {
  const coords = [];
  const pushCoords = (node) => {
    if (!node) return;
    if (typeof node[0] === "number" && typeof node[1] === "number") {
      coords.push(node);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(pushCoords);
      return;
    }
    if (typeof node === "object") {
      if (Array.isArray(node.features)) {
        node.features.forEach((feature) => pushCoords(feature?.geometry?.coordinates));
      } else if (node.geometry) {
        pushCoords(node.geometry.coordinates);
      }
    }
  };
  collections.forEach((entry) => pushCoords(entry));
  return coords;
};

export const computeBounds = (coords = [], { baseBuffer = 0.001, westBuffer = 0.0004, fallback = [[6.48, 46.49], [6.53, 46.53]] } = {}) => {
  if (!Array.isArray(coords) || !coords.length) return fallback;
  const lngs = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);
  return [
    [Math.min(...lngs) - westBuffer, Math.min(...lats) - baseBuffer],
    [Math.max(...lngs) + baseBuffer, Math.max(...lats) + baseBuffer],
  ];
};
