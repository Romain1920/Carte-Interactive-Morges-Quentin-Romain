export const Heading = ({ level = 3, text = "" } = {}) => {
  const sanitizedLevel = Math.min(6, Math.max(1, Number(level) || 3));
  return `<h${sanitizedLevel}>${text}</h${sanitizedLevel}>`;
};
