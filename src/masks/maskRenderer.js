import { diagnosticGeojson } from "../data/geojson/diagnosticGeojson";

// On récupère la géométrie du périmètre pour découper nos rasters “maison”.
const { noiseMaskCoords } = diagnosticGeojson;

// Calcul rapide de la bbox pour dimensionner le canvas et appeler les services WMS.
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

// Fabrique un canvas masqué qui ne dessine l’image que sur le périmètre souhaité.
const createMaskedImageRenderer = ({ alpha = 0.85, resolveSrc }) => {
  const canvas = document.createElement("canvas");
  canvas.width = noiseCanvasWidth;
  canvas.height = noiseCanvasHeight;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
  }

  const draw = () => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      ctx?.clearRect(0, 0, noiseCanvasWidth, noiseCanvasHeight);
      ctx?.save();
      ctx?.beginPath();
      noiseMaskCoords.forEach(([lng, lat], idx) => {
        const x = ((lng - noiseBounds.minLng) / lngSpan) * noiseCanvasWidth;
        const y = ((noiseBounds.maxLat - lat) / latSpan) * noiseCanvasHeight;
        if (!ctx) return;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx?.closePath();
      ctx?.clip();
      if (ctx) ctx.globalAlpha = alpha;
      ctx?.drawImage(image, 0, 0, noiseCanvasWidth, noiseCanvasHeight);
      ctx?.restore();
    };
    image.src = resolveSrc();
    return image;
  };

  return {
    canvas,
    draw,
  };
};

// Et la variante pour les PNG locaux générés avec GDAL.
const createMaskedLocalImageRenderer = ({ imagePath, alpha = 0.85 }) =>
  createMaskedImageRenderer({
    alpha,
    resolveSrc: () => imagePath,
  });

// MapLibre a besoin des 4 coins pour positionner un canvas source.
const pollutionCanvasCoordinates = [
  [noiseBounds.minLng, noiseBounds.maxLat],
  [noiseBounds.maxLng, noiseBounds.maxLat],
  [noiseBounds.maxLng, noiseBounds.minLat],
  [noiseBounds.minLng, noiseBounds.minLat],
];

export {
  createMaskedImageRenderer,
  createMaskedLocalImageRenderer,
  noiseMaskCoords,
  noiseBounds,
  noiseCanvasWidth,
  noiseCanvasHeight,
  pollutionCanvasCoordinates,
};
