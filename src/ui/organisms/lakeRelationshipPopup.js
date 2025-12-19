export const renderLakeRelationshipPopup = ({ title = "Relation au lac", description = "", image = "" } = {}) => `
  <div class="panel-popup">
    ${image ? `<img src="${image}" alt="" />` : ""}
    <div class="panel-popup-body">
      <div class="panel-popup-title">${title}</div>
      ${description ? `<p>${description}</p>` : ""}
    </div>
  </div>
`;
