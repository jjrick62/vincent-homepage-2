export function toggleCommandMenu(button, panel) {
  const nextOpen = panel.dataset.open !== "true";
  panel.dataset.open = String(nextOpen);
  button.setAttribute("aria-expanded", String(nextOpen));
}

export function setActiveSection(links, sectionId) {
  links.forEach((link) => {
    link.dataset.active = String(link.dataset.section === sectionId);
  });
}

function initCommandNavigation() {
  const button = document.querySelector(".command-toggle");
  const panel = document.querySelector(".command-panel");
  const links = [...document.querySelectorAll(".command-link")];

  if (!button || !panel) return;

  button.addEventListener("click", () => toggleCommandMenu(button, panel));
  links.forEach((link) => {
    link.addEventListener("click", () => {
      panel.dataset.open = "false";
      button.setAttribute("aria-expanded", "false");
    });
  });

  const sections = links
    .map((link) => document.getElementById(link.dataset.section))
    .filter(Boolean);

  if (!sections.length || !("IntersectionObserver" in window)) {
    setActiveSection(links, links[0]?.dataset.section);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveSection(links, visible.target.id);
    },
    { rootMargin: "-18% 0px -58% 0px", threshold: [0.1, 0.25, 0.5] },
  );

  sections.forEach((section) => observer.observe(section));
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initCommandNavigation);
}
