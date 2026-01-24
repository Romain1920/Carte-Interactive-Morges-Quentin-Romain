import { Heading } from "../atoms/heading";
import { Paragraph } from "../atoms/paragraph";
import { PopupCarousel, bindPopupCarousel } from "../molecules/popupCarousel";

const panelImages = [
  "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/Screenshot%202026-01-23%20at%205.33.51%E2%80%AFPM.png",
];

const staticAssets = {
  sectionBefore: "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/Screenshot%202026-01-23%20at%205.36.17%E2%80%AFPM.png",
  sectionAfter: "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/Screenshot%202026-01-23%20at%205.36.46%E2%80%AFPM.png",
};

const renewalParagraphs = [
  "Rue’naissance vise à anticiper les effets du changement climatique et à adapter le centre-bourg de Morges afin d’en préserver durablement la qualité et l’attractivité. Une attention particulière est portée à la préservation des vues et des perspectives sur les bâtiments emblématiques du bourg, tels que le temple, l’église ou la Maison de Commune, afin de renforcer la lisibilité du patrimoine et l’identité urbaine de Morges.",
  "Aujourd’hui, malgré des aménagements positifs comme la piétonnisation de la Grand-Rue, le centre reste très minéral. À l’horizon 2060, les températures estivales dépasseront fréquemment les 36 °C, avec une accumulation de chaleur en journée et une restitution nocturne défavorable à la santé, au confort des habitants et à l’usage des espaces publics. Ces conditions réduisent également l’attractivité commerciale, les rues très chaudes et peu ombragées étant moins propices à la fréquentation des commerces.",
  "Enfin, la réflexion intègre une meilleure organisation des flux et des continuités urbaines, pour renforcer les liaisons à travers le bourg et améliorer la connexion entre le secteur nord de la gare et le lac. L’ensemble vise à maintenir un centre vivant, accessible et attractif, capable de répondre aux enjeux climatiques, sanitaires et économiques des prochaines décennies.",
];

export const renderStreetRenewalPanel = () => {
  const heading = Heading({ level: 3, text: "Rue’naissance — Grand‑Rue & Rue de Savoie" });
  const paragraphs = renewalParagraphs.map((text) => Paragraph({ text })).join("");
  const carousel = PopupCarousel({ id: "street-renewal", images: panelImages });

  return `
    <div class="popup-content renewal-proposal" data-poi-id="street-renewal">
      <div class="renewal-proposal__hero">
        <div class="renewal-proposal__badge">Requalification & adaptation</div>
        ${heading}
      </div>
      <div class="renewal-proposal__gallery">
        <div class="renewal-proposal__gallery-title">Plan en hauteur</div>
        ${carousel}
      </div>
      <div class="renewal-proposal__comparison">
        <div class="renewal-proposal__comparison-title">Coupe avant / après</div>
        <div class="before-after" style="--split: 50%;">
          <img class="before-after__image" src="${staticAssets.sectionAfter}" alt="Coupe après intervention" />
          <div class="before-after__overlay">
            <img class="before-after__image" src="${staticAssets.sectionBefore}" alt="Coupe avant intervention" />
          </div>
          <div class="before-after__handle" aria-hidden="true"></div>
          <input
            type="range"
            class="before-after__slider"
            min="0"
            max="100"
            value="50"
            aria-label="Balayer pour comparer avant et après"
            oninput="this.parentElement.style.setProperty('--split', this.value + '%')"
          />
          <div class="before-after__labels" aria-hidden="true">
            <span>Avant</span>
            <span>Après</span>
          </div>
        </div>
      </div>
      <div class="renewal-proposal__body">
        ${paragraphs}
      </div>
    </div>
  `;
};

export const bindStreetRenewalPanel = ({ container, openLightbox }) => {
  if (!container) return;
  bindPopupCarousel({ container, images: panelImages, openLightbox });
};
