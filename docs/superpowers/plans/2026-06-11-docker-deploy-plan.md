# Docker Deployment Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a self-contained `docker-deploy/` directory that runs the homepage and blog in one Docker container.

**Architecture:** Copy only runtime files into the deployment directory. A Python slim image installs FastAPI dependencies and starts Uvicorn; Compose supplies the token, port mapping, restart policy, health check, and SQLite volume.

**Tech Stack:** Docker, Docker Compose, Python 3.12, FastAPI, SQLite.

---

### Task 1: Define the deployment contract

**Files:**
- Create: `tests/docker-deploy.test.js`

- [ ] Assert that the deployment directory includes the Dockerfile, Compose file, environment example, application files, and documentation.
- [ ] Assert that Compose mounts `/data`, exposes port 8066, and does not contain the development token.
- [ ] Run `npm test -- tests/docker-deploy.test.js` and verify it fails while the package is absent.

### Task 2: Assemble the standalone runtime

**Files:**
- Create: `docker-deploy/Dockerfile`
- Create: `docker-deploy/compose.yaml`
- Create: `docker-deploy/.dockerignore`
- Create: `docker-deploy/.env.example`
- Create: `docker-deploy/README.md`
- Copy: `index.html`, `src/`, `blog/`

- [ ] Copy the current runtime assets without Node development dependencies.
- [ ] Make the packaged server read `BLOG_DB_PATH`, defaulting to `/data/blog.db`.
- [ ] Make Uvicorn listen on `0.0.0.0:8066`.
- [ ] Add health check and persistent volume configuration.

### Task 3: Verify the package

**Files:**
- Test: `tests/docker-deploy.test.js`

- [ ] Run the deployment contract test and full Vitest suite.
- [ ] Compile the packaged Python server with `python -m py_compile`.
- [ ] Parse `compose.yaml` when Docker Compose is available; otherwise document that image build verification requires Docker on the target machine.

