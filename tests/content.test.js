import { describe, expect, it } from "vitest";
import {
  buildSteps,
  contactLinks,
  featuredProjects,
  navItems,
  notes,
  primaryProjects,
  projectIndex,
  secondaryProjects,
  techGroups,
} from "../src/content.js";

describe("homepage content model", () => {
  it("defines the required nonstandard navigation sections in order", () => {
    expect(navItems.map((item) => item.id)).toEqual([
      "featured",
      "projects",
      "notes",
      "method",
      "contact",
    ]);
    expect(navItems.every((item) => item.index && item.label && item.summary)).toBe(true);
  });

  it("has focused featured projects and a readable project/blog index", () => {
    expect(featuredProjects).toHaveLength(2);
    expect(featuredProjects.every((project) => project.title && project.tags.length >= 2)).toBe(true);
    expect(projectIndex.some((item) => item.kind === "PROJECT")).toBe(true);
    expect(projectIndex.some((item) => item.kind === "BLOG")).toBe(true);
  });

  it("includes build method, tech groups, notes, and contact links", () => {
    expect(buildSteps.map((step) => step.label)).toEqual([
      "Prompt",
      "Component",
      "Motion",
      "Review",
      "Ship",
    ]);
    expect(techGroups.length).toBeGreaterThanOrEqual(4);
    expect(notes.length).toBeGreaterThanOrEqual(3);
    expect(contactLinks.map((link) => link.label)).toEqual(["Email", "GitHub"]);
  });

  it("models the README primary and secondary projects for homepage display", () => {
    expect(primaryProjects.map((project) => project.title)).toEqual([
      "个人主页 2.0",
      "RAG 企业级问答系统",
      "手势地球",
      "旅行相册 Web",
      "旅行相册 Android",
    ]);
    expect(secondaryProjects.map((project) => project.title)).toEqual([
      "算术闹钟",
      "Claude 移动桥",
    ]);
    expect(primaryProjects.every((project) => project.github && project.stack)).toBe(true);
  });
});
