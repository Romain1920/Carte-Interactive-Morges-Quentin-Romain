import { Heading } from "../atoms/heading";
import { Paragraph } from "../atoms/paragraph";
import { PopupCarousel, bindPopupCarousel } from "../molecules/popupCarousel";

const buildPlaceholder = (label) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
    <rect width="800" height="500" fill="#e2e8f0" />
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Georgia, serif" font-size="28" fill="#475569">${label}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const placeholderImages = [buildPlaceholder("Visuel stationnement 1"), buildPlaceholder("Visuel stationnement 2")];

const parkingParagraphs = [
  "Cette intention montre la logique de report des stationnements afin de libérer des espaces centraux et clarifier les circulations.",
  "Les visuels détaillent les reports principaux ainsi que les impacts attendus sur les usages quotidiens du centre-ville.",
  "Les données précises et les images finales seront intégrées au fur et à mesure des prochaines étapes.",
];

export const renderParkingIntentPanel = () => {
  const heading = Heading({ level: 3, text: "Démonstration des reports de stationnement" });
  const paragraphs = parkingParagraphs.map((text) => Paragraph({ text })).join("");
  const carousel = PopupCarousel({ id: "parking-intent", images: placeholderImages });

  return `
    <div class="popup-content intention-details" data-poi-id="parking-intent">
      ${heading}
      ${carousel}
      ${paragraphs}
    </div>
  `;
};

export const bindParkingIntentPanel = ({ container, openLightbox }) => {
  if (!container) return;
  bindPopupCarousel({ container, images: placeholderImages, openLightbox });
};
