import { Heading } from "../atoms/heading";
import { Paragraph } from "../atoms/paragraph";
import { PopupCarousel, bindPopupCarousel } from "../molecules/popupCarousel";

const buildPlaceholder = (label) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
    <rect width="800" height="500" fill="#efe9e1" />
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Georgia, serif" font-size="28" fill="#6b6157">${label}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const placeholderImages = [
  "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/Compost%204.png",
  "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/Compost%203.png",
  "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/Compost%202.png",
  "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/Compost_V1.png",
];

const staticAssets = {
  sectionBefore: "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/Screenshot%202026-01-22%20at%204.56.47%E2%80%AFPM.png",
  sectionAfter: "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/Screenshot%202026-01-22%20at%204.56.52%E2%80%AFPM.png",
};

const densityParagraphs = [
  "Le projet « Composte » trouve son origine dans une double intervention urbaine : la surélévation et la densification du bâtiment de la poste, ainsi que la transformation d'un espace minéral fermé situé au cœur de la vieille ville de Morges. Cette dénomination évoque la composition hybride entre l'infrastructure postale et l'élément végétal, établissant un dialogue entre bâti et nature.",
  "La végétalisation constitue le principe structurant du projet, agissant comme trait d'union entre la poste réaménagée et le parc nouvellement créé. Cet espace vert assume une double fonction dans le tissu urbain morgien. D'une part, il s'inscrit comme lieu de passage, caractérisé par un réseau de cheminements multiples qui facilitent la traversée. D'autre part, il se définit comme lieu de partage grâce à son espace central qui invite à la pause et à l'appropriation collective. En sus, une place de jeux pour surtout les petits mais aussi les grands ajoute une facette à cet élément de partage, crucial au cœur de Morges. Cette conception polyvalente permet d'établir également une continuité spatiale entre le temple et la maison des associations, contribuant ainsi à renforcer la cohérence du centre historique.",
  "L'approche repose sur la valorisation du patrimoine arboré existant. Les arbres présents sur le site, jusqu'alors négligés et étouffés par l'emprise minérale du revêtement bétonné et gravillonné, constituent le point de départ d'une renaturation progressive. Le parti pris paysager s'inspire des démarches mises en œuvre dans le parc du Prieuré, intégrant notamment la biodiversité au sein de l’urbanité. Cette stratégie participe à la création d'un îlot de fraîcheur au cœur de la ville, répondant aux enjeux climatiques contemporains.",
  "Fondamentalement, le projet « Composte » s'inscrit dans une logique de reconquête de l'espace public. Il s'agit de réaffecter une superficie auparavant dédiée à la voiture pour la restituer aux habitants et à la nature, établissant ainsi un équilibre harmonieux entre usages sociaux et qualité environnementale dans le centre urbain de Morges.",
];

export const renderDensityProposalPanel = () => {
  const heading = Heading({ level: 3, text: "Composte" });
  const lead = Paragraph({
    text: "Une densification douce qui relie la poste réaménagée et un parc urbain vivant au cœur de Morges.",
  });
  const paragraphs = densityParagraphs.map((text) => Paragraph({ text })).join("");
  const carousel = PopupCarousel({ id: "project-density", images: placeholderImages });

  return `
    <div class="popup-content density-proposal" data-poi-id="project-density">
      <div class="density-proposal__hero">
        <div class="density-proposal__badge">Intentions de densification</div>
        ${heading}
        ${lead}
      </div>
      <div class="density-proposal__gallery">
        <div class="density-proposal__gallery-title">Visuels du projet</div>
        ${carousel}
      </div>
      <div class="density-proposal__comparison">
        <div class="density-proposal__comparison-title">Coupe avant / après</div>
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
      <div class="density-proposal__body">
        ${paragraphs}
      </div>
    </div>
  `;
};

export const bindDensityProposalPanel = ({ container, openLightbox }) => {
  if (!container) return;
  bindPopupCarousel({ container, images: placeholderImages, openLightbox });
};
