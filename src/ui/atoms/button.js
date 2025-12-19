export const Button = ({ text = "", type = "button", className = "", attrs = "" } = {}) =>
  `<button type="${type}"${className ? ` class="${className}"` : ""}${attrs ? ` ${attrs}` : ""}>${text}</button>`;
