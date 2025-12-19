import { Heading } from "../atoms/heading";
import { Paragraph } from "../atoms/paragraph";
import { PopupCarousel, bindPopupCarousel } from "../molecules/popupCarousel";
import { CommentsSection, bindCommentsSection } from "../molecules/commentsSection";

const sanitizeFeature = (feature = {}) => {
  const defaults = feature?.properties || {};
  const id = defaults.id || defaults.title || "poi";
  return {
    id,
    title: defaults.title || "Point",
    description: defaults.description || "",
    images: defaults.images || [],
  };
};

export const renderProjectDetailsPanel = (feature) => {
  const { id, title, description, images } = sanitizeFeature(feature);
  const heading = Heading({ level: 3, text: title });
  const body = Paragraph({ text: description });
  const carousel = PopupCarousel({ id, images });
  const comments = CommentsSection({ id });

  return `
    <div class="popup-content" data-poi-id="${id}">
      ${heading}
      ${body}
      ${carousel}
      ${comments}
    </div>
  `;
};

export const bindProjectDetailsPanel = ({ container, feature, openLightbox }) => {
  if (!container) return;
  const { id, images } = sanitizeFeature(feature);

  bindPopupCarousel({ container, images, openLightbox });
  bindCommentsSection(container, id);
};
