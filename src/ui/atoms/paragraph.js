export const Paragraph = ({ text = "" } = {}) => {
  if (!text) return "";
  return `<p>${text}</p>`;
};
