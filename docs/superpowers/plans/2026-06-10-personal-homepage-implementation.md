# Personal Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished personal homepage with a 96px monochrome grid-light background, featured project cards, project/blog index, build method, tech stack, about, contact, and glass article reading preview.

**Architecture:** Use a Vite static app with focused files: `index.html` for semantic content, `src/styles.css` for visual system and responsive layout, `src/content.js` for editable site data, and `src/main.js` for navigation state and small interactions. Keep the design dependency-light and deployable as static files.

**Tech Stack:** Vite, native HTML/CSS/JavaScript, Vitest with jsdom for content and navigation behavior tests.

---

### Task 1: Scaffold Static App And Data

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `src/content.js`
- Create: `src/main.js`
- Create: `src/styles.css`
- Create: `tests/content.test.js`

- [ ] **Step 1: Write failing content tests**

Create `tests/content.test.js` asserting required homepage sections and content categories exist.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run`
Expected: fail because package/test files are not yet wired or exports do not exist.

- [ ] **Step 3: Implement minimal Vite app and content exports**

Create package scripts, `index.html`, and `src/content.js` with sections, projects, notes, build steps, tech groups, and contact data.

- [ ] **Step 4: Run tests to verify pass**

Run: `npm test -- --run`
Expected: pass.

### Task 2: Navigation Interaction

**Files:**
- Modify: `src/main.js`
- Test: `tests/navigation.test.js`

- [ ] **Step 1: Write failing navigation tests**

Test menu toggle opens/closes and active section updates when `setActiveSection()` is called.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/navigation.test.js`
Expected: fail because functions are missing.

- [ ] **Step 3: Implement navigation helpers**

Export `toggleCommandMenu()` and `setActiveSection()`, then wire them to the DOM on page load.

- [ ] **Step 4: Run tests to verify pass**

Run: `npm test -- --run`
Expected: pass.

### Task 3: Visual System And Full Page

**Files:**
- Modify: `index.html`
- Modify: `src/styles.css`
- Modify: `src/main.js`

- [ ] **Step 1: Build semantic page**

Add hero, featured project, projects/notes index, build method, tech stack, about, article glass preview, and contact sections.

- [ ] **Step 2: Implement visual system**

Create 96px internal grid background, black-light animation, B-style black featured card, CD-1 index rows, transparent glass article panel, and command-index navigation.

- [ ] **Step 3: Run tests**

Run: `npm test -- --run`
Expected: pass.

- [ ] **Step 4: Run production build**

Run: `npm run build`
Expected: pass and output `dist/`.

### Task 4: Local Preview

**Files:**
- No code changes expected.

- [ ] **Step 1: Start dev server**

Run: `npm run dev -- --host 127.0.0.1`
Expected: Vite serves the homepage.

- [ ] **Step 2: Verify browser render**

Open the local URL and verify page is nonblank, responsive, and visual sections are present.

---

Self-review: The plan covers all approved homepage sections, the reusable background, article glass reading treatment, and non-standard navigation. No placeholders remain.
