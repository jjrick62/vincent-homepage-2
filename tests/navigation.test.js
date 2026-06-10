import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import { setActiveSection, toggleCommandMenu } from "../src/main.js";

function createNavDom() {
  const dom = new JSDOM(`
    <button class="command-toggle" aria-expanded="false">Menu</button>
    <nav class="command-panel" data-open="false">
      <a class="command-link" href="#featured" data-section="featured">Featured</a>
      <a class="command-link" href="#projects" data-section="projects">Projects</a>
      <a class="command-link" href="#notes" data-section="notes">Notes</a>
    </nav>
  `);

  return {
    button: dom.window.document.querySelector(".command-toggle"),
    panel: dom.window.document.querySelector(".command-panel"),
    links: [...dom.window.document.querySelectorAll(".command-link")],
  };
}

describe("command navigation interactions", () => {
  it("toggles the command panel open and closed", () => {
    const { button, panel } = createNavDom();

    toggleCommandMenu(button, panel);

    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(panel.dataset.open).toBe("true");

    toggleCommandMenu(button, panel);

    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(panel.dataset.open).toBe("false");
  });

  it("marks the active section link", () => {
    const { links } = createNavDom();

    setActiveSection(links, "notes");

    expect(links.find((link) => link.dataset.section === "notes").dataset.active).toBe("true");
    expect(links.find((link) => link.dataset.section === "featured").dataset.active).toBe("false");
  });
});
