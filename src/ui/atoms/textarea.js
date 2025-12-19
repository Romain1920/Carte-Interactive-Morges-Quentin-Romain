export const Textarea = ({ placeholder = "", className = "" } = {}) =>
  `<textarea${className ? ` class="${className}"` : ""} placeholder="${placeholder}"></textarea>`;
