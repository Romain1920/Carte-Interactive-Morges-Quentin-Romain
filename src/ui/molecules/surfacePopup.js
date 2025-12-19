export const renderSurfacePopup = ({ label, area, totalArea, formatValue = (value) => value }) => {
  const format = (value) => formatValue(Number.isFinite(value) ? value : 0);
  return `<div class="surface-popup"><strong>${label}</strong><br />Surface du polygone : ${format(area)} m²<br />Surface cumulée : ${format(totalArea)} m²</div>`;
};
