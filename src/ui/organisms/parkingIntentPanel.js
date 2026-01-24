import { Heading } from "../atoms/heading";
import { Paragraph } from "../atoms/paragraph";
import { PopupCarousel, bindPopupCarousel } from "../molecules/popupCarousel";

const parkingImages = [
  "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/Screenshot%202026-01-22%20at%206.39.33%E2%80%AFPM.png",
];

const parkingParagraphs = [
  "Ce schéma illustre la disponibilité des places de stationnement à Morges un samedi de forte affluence (29 mai 2021 à 11h30). Il met en évidence un contraste marqué entre les parkings situés au cœur du Bourg et ceux localisés à proximité immédiate.",
  "Dans le Bourg, la majorité des parkings sont saturés ou presque, entraînant un déficit global de 284 places disponibles. À l’inverse, les parkings périphériques présentent encore une capacité importante, avec un excédent de 339 places libres.",
  "Cette situation révèle une concentration excessive de la demande de stationnement dans le centre-ville, alors même que des capacités significatives restent sous-utilisées à courte distance. Elle souligne l’enjeu d’une meilleure orientation des automobilistes vers les parkings périphériques afin de réduire la congestion et d’optimiser l’usage global de l’offre de stationnement.",
  "Au-delà du constat chiffré, cette situation invite à une réflexion sur les leviers d’accompagnement permettant de mieux répartir la demande de stationnement. Une adaptation de la tarification constitue un outil central : une tarification plus élevée des parkings en surface, combinée à des tarifs plus attractifs pour les parkings souterrains, permettrait d’orienter les automobilistes vers ces infrastructures mieux dimensionnées et moins visibles dans l’espace public.",
  "Par ailleurs, la mise en place d’une signalétique intelligente aux entrées du Bourg historique représenterait un complément efficace. Des panneaux dynamiques indiquant en temps réel le nombre de places disponibles et la direction des parkings les plus proches et les plus disponibles contribueraient à réduire la recherche de places en centre-ville, à limiter le trafic de transit et à améliorer la lisibilité globale de l’offre de stationnement.",
  "Ces mesures combinées participeraient à une utilisation plus rationnelle des capacités existantes, tout en améliorant la qualité des espaces publics du centre-ville.",
];

export const renderParkingIntentPanel = () => {
  const heading = Heading({ level: 3, text: "Répartition des places de stationnement disponibles à Morges" });
  const paragraphs = parkingParagraphs.map((text) => Paragraph({ text })).join("");
  const carousel = PopupCarousel({ id: "parking-intent", images: parkingImages });

  return `
    <div class="popup-content intention-details" data-poi-id="parking-intent">
      <div class="intention-details__hero">
        <div class="intention-details__badge">Intentions de stationnement</div>
        ${heading}
      </div>
      <div class="intention-details__gallery">
        <div class="intention-details__gallery-title">Schéma de disponibilité</div>
        ${carousel}
      </div>
      <div class="intention-details__body">
        ${paragraphs}
      </div>
    </div>
  `;
};

export const bindParkingIntentPanel = ({ container, openLightbox }) => {
  if (!container) return;
  bindPopupCarousel({ container, images: parkingImages, openLightbox });
};
