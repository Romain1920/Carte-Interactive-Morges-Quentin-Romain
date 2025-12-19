const buildParkingList = (items = []) => items.map((item) => `<div class="parking-demo__item"><strong>${item.name}</strong><span>${item.detail}</span></div>`).join("");

const renderTabs = (steps = []) => steps.map((step) => `<button type="button" class="parking-demo__tab" data-step="${step.id}">${step.label}</button>`).join("");

const renderSlides = (steps = []) =>
  steps
    .map(
      (step, index) => `
        <article class="parking-demo__slide${index === 0 ? " active" : ""}" data-step="${step.id}">
          <div class="parking-demo__text">
            <h3>${step.title}</h3>
            <p>${step.description}</p>
          </div>
          <div id="parking-demo-stats-${step.id}" class="parking-demo__stats"></div>
          <div id="parking-demo-list-wrapper-${step.id}" class="parking-demo__list-wrapper">
            <p id="parking-demo-list-title-${step.id}"></p>
            <div id="parking-demo-list-${step.id}" class="parking-demo__list"></div>
          </div>
          <ul id="parking-demo-bullets-${step.id}"></ul>
        </article>
      `,
    )
    .join("");

const renderParkingDemoStructure = ({ steps, tabsContainer, bodyContainer }) => {
  if (!tabsContainer || !bodyContainer) return null;
  tabsContainer.innerHTML = renderTabs(steps);
  bodyContainer.innerHTML = `
      <div class="parking-demo__body">
        <div class="parking-demo__slides">
          ${renderSlides(steps)}
        </div>
      </div>
    `;
  const elements = { stats: {}, lists: {}, listTitles: {}, bullets: {} };
  steps.forEach((step) => {
    elements.stats[step.id] = document.getElementById(`parking-demo-stats-${step.id}`);
    elements.lists[step.id] = document.getElementById(`parking-demo-list-${step.id}`);
    elements.listTitles[step.id] = document.getElementById(`parking-demo-list-title-${step.id}`);
    elements.bullets[step.id] = document.getElementById(`parking-demo-bullets-${step.id}`);
  });
  return elements;
};

const renderCards = (cards = []) =>
  cards
    .map(
      (card) => `
        <div class="parking-demo__stat-card${card.tone ? ` ${card.tone}` : ""}">
          <h5>${card.label}</h5>
          <strong>${card.value}</strong>
        </div>
      `,
    )
    .join("");

const renderBullets = (bullets = []) => bullets.map((bullet) => `<li>${bullet}</li>`).join("");

const applyStepContent = (step, elements) => {
  const statsContainer = elements.stats[step.id];
  const listContainer = elements.lists[step.id];
  const listTitle = elements.listTitles[step.id];
  const bullets = elements.bullets[step.id];

  if (statsContainer) {
    statsContainer.innerHTML = step.cards?.length ? renderCards(step.cards) : "";
    statsContainer.style.display = step.cards?.length ? "flex" : "none";
  }

  if (listContainer) {
    if (step.list?.length) {
      listContainer.innerHTML = buildParkingList(step.list);
      listContainer.parentElement.style.display = "block";
      if (listTitle) listTitle.textContent = step.listTitle || "";
    } else if (listContainer.parentElement) {
      listContainer.parentElement.style.display = "none";
      listContainer.innerHTML = "";
    }
  }

  if (bullets) {
    bullets.innerHTML = step.bullets?.length ? renderBullets(step.bullets) : "";
    bullets.style.display = step.bullets?.length ? "block" : "none";
  }
};

export const createParkingDemo = ({ overlay, tabsContainer, bodyContainer, closeButton, actionButton, steps = [] }) => {
  if (!overlay || !tabsContainer || !bodyContainer || !steps.length) {
    return { open: () => {}, close: () => {} };
  }

  let rendered = false;
  let activeId = steps[0].id;
  let elements = null;
  let tabsBound = false;

  const ensureStructure = () => {
    if (rendered) return;
    elements = renderParkingDemoStructure({ steps, tabsContainer, bodyContainer });
    rendered = true;
  };

  const setStep = (stepId) => {
    ensureStructure();
    const step = steps.find((item) => item.id === stepId) || steps[0];
    activeId = step.id;
    tabsContainer.querySelectorAll("button").forEach((btn) => btn.classList.toggle("active", btn.dataset.step === activeId));
    bodyContainer.querySelectorAll(".parking-demo__slide").forEach((slide) => slide.classList.toggle("active", slide.dataset.step === activeId));
    applyStepContent(step, elements);
  };

  const bindTabs = () => {
    if (!tabsContainer || tabsBound) return;
    tabsContainer.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        setStep(button.dataset.step);
      });
    });
    tabsBound = true;
  };

  const open = () => {
    ensureStructure();
    bindTabs();
    setStep(activeId);
    overlay.classList.add("visible");
    overlay.setAttribute("aria-hidden", "false");
  };

  const close = () => {
    overlay.classList.remove("visible");
    overlay.setAttribute("aria-hidden", "true");
  };

  closeButton?.addEventListener("click", close);
  actionButton?.addEventListener("click", close);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });

  return { open, close, setStep };
};
