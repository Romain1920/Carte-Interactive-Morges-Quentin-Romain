import { Heading } from "../atoms/heading";
import { Paragraph } from "../atoms/paragraph";
import { PopupCarousel, bindPopupCarousel } from "../molecules/popupCarousel";

const panelImages = [
  "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/Screenshot%202026-01-24%20at%2011.52.06%E2%80%AFAM.png",
];

const staticAssets = {
  sun: "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/Screenshot%202026-01-24%20at%2012.41.23%E2%80%AFPM.png",
  rain: "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/Screenshot%202026-01-24%20at%2012.41.41%E2%80%AFPM.png",
};

const heritageParagraphs = [
  "L’inondation provoquée par la Morge en 2024 a mis en évidence la vulnérabilité de la ville de Morges face aux aléas climatiques. Lors de cet événement, le secteur délimité par la place Dufour au Nord et le port du Château au Sud a émergé comme un site aux enjeux importants. Fortement inondé, celui-ci a également révélé un potentiel de protection : en canalisant l’eau dans ce secteur, il est possible de préserver le bourg de futures inondations. Ce n’est donc peut-être pas un hasard si les douves du château se situaient autrefois à cet endroit. Si celles-ci servaient à défendre le château contre ses assaillants, la “Place (e) au vert”, elle, protège le centre historique de Morges des inondations.",
  "La gestion des risques liés à l’eau implique la création d’un second bras de déchargement de la Morge, composé de places publiques et d’une rue temporairement inondables. Celles-ci permettent d’adapter ce secteur, actuellement fortement minéralisé, aux transformations climatiques à venir. Les arbres et la végétation rafraîchissent l’air par évapotranspiration et fournissent de l’ombre aux piétons et cyclistes. Les revêtements perméables et les espaces en pleine terre favorisent l’infiltration, tandis que les bassins de rétention retiennent l’eau de pluie excédentaire.",
  "De plus, à l’exception d’une voie carrossable dédiée aux livraisons pour les commerçants du bourg, ainsi qu’aux personnes à mobilité réduite, le secteur est entièrement réservé aux mobilités actives. Les places publiques ainsi créées jouissent d’une grande qualité. Les piétons y sont en sécurité, ce qui permet aux parents de laisser jouer leurs enfants et aux promeneurs d’y flâner en toute tranquillité.",
  "Véritable trait-d’union entre le Parc de l’Indépendance et le quai Lochmann renaturé, les jardins historiques du château, aujourd’hui entourés de grilles, sont ouverts au public et retrouvent leur opulence passée. Des aménagements, tels que des prairies fleuries et la plantation d’essences intéressantes pour la biodiversité, les rendent accueillants pour les non-humains également.",
  "La “Place (e) au vert” n’est donc pas seulement la transformation d’une zone historiquement vulnérable en site de protection hydraulique et lieu de convivialité piétonne, mais aussi la revitalisation d’un patrimoine naturel longtemps négligé.",
];

export const renderSafetyHeritagePanel = () => {
  const heading = Heading({ level: 3, text: "Sécurité & patrimoine — Place (e)au vert" });
  const paragraphs = heritageParagraphs.map((text) => Paragraph({ text })).join("");
  const carousel = PopupCarousel({ id: "safety-heritage", images: panelImages });

  return `
    <div class="popup-content renewal-proposal" data-poi-id="safety-heritage">
      <div class="renewal-proposal__hero">
        <div class="renewal-proposal__badge">Sécurité & patrimoine</div>
        ${heading}
      </div>
      <div class="renewal-proposal__gallery">
        <div class="renewal-proposal__gallery-title">Plan d’intention</div>
        ${carousel}
      </div>
      <div class="renewal-proposal__comparison">
        <div class="renewal-proposal__comparison-title">Aménagements au soleil / sous la pluie</div>
        <div class="before-after" style="--split: 50%;">
          <img class="before-after__image" src="${staticAssets.rain}" alt="Aménagements sous la pluie" />
          <div class="before-after__overlay">
            <img class="before-after__image" src="${staticAssets.sun}" alt="Aménagements au soleil" />
          </div>
          <div class="before-after__handle" aria-hidden="true"></div>
          <input
            type="range"
            class="before-after__slider"
            min="0"
            max="100"
            value="50"
            aria-label="Balayer pour comparer au soleil et sous la pluie"
            oninput="this.parentElement.style.setProperty('--split', this.value + '%')"
          />
          <div class="before-after__labels" aria-hidden="true">
            <span>Au soleil</span>
            <span>Sous la pluie</span>
          </div>
        </div>
      </div>
      <div class="renewal-proposal__body">
        ${paragraphs}
      </div>
    </div>
  `;
};

export const bindSafetyHeritagePanel = ({ container, openLightbox }) => {
  if (!container) return;
  bindPopupCarousel({ container, images: panelImages, openLightbox });
};
