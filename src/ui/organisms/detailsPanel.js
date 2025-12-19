export const createDetailsPanel = ({ panel, body, closeButton, onOpen, onClose } = {}) => {
  const open = ({ render, bind }) => {
    if (!panel || !body || !render) return;
    body.innerHTML = render();
    bind?.(body);
    panel.classList.add("visible");
    onOpen?.();
  };

  const close = () => {
    if (!panel) return;
    panel.classList.remove("visible");
    onClose?.();
  };

  closeButton?.addEventListener("click", close);
  panel?.addEventListener("click", (event) => {
    if (event.target === panel) close();
  });

  return { open, close };
};
