# About Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the About section skill tags with a monochrome technical growth profile.

**Architecture:** Keep the feature static and semantic. HTML owns the three profile groups and roadmap content; CSS provides the continuous dossier layout, responsive behavior, and monochrome hierarchy.

**Tech Stack:** HTML5, CSS, Vitest.

---

### Task 1: Lock the content contract

**Files:**
- Modify: `tests/static-serving.test.js`

- [ ] Add a test that requires the three profile headings, Agent/Spark/Hadoop roadmap text, focus line, and removal of `.about-tags`.
- [ ] Run `npm test -- tests/static-serving.test.js` and verify the new assertion fails because the old tag grid remains.

### Task 2: Replace the About markup

**Files:**
- Modify: `index.html`

- [ ] Replace `.about-tags` with a semantic `.about-profile` containing current position, working method, and future direction.
- [ ] Update the About introduction to describe the current professional focus without hobby content.

### Task 3: Build the monochrome dossier layout

**Files:**
- Modify: `src/styles.css`
- Modify: `index.html`

- [ ] Remove the inline `.about-tags` CSS from `index.html`.
- [ ] Add profile columns, numbered entries, roadmap rules, grayscale hover treatment, and responsive breakpoints to `src/styles.css`.
- [ ] Run `npm test -- tests/static-serving.test.js`, then `npm test` and `npm run build`.
- [ ] Inspect the section at desktop and mobile widths in the browser.
