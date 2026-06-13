import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const deployFiles = [
  "docker-deploy/Dockerfile",
  "docker-deploy/compose.yaml",
  "docker-deploy/.dockerignore",
  "docker-deploy/.gitignore",
  "docker-deploy/.env.example",
  "docker-deploy/README.md",
  "docker-deploy/app/index.html",
  "docker-deploy/app/src/styles.css",
  "docker-deploy/app/src/main.js",
  "docker-deploy/app/blog/server.py",
  "docker-deploy/app/blog/requirements.txt",
  "docker-deploy/app/blog/editor.html",
  "docker-deploy/app/blog/editor.js",
  "docker-deploy/app/blog/marked.min.js",
];

describe("standalone Docker deployment package", () => {
  it("contains every runtime and deployment file", () => {
    expect(deployFiles.filter((file) => !existsSync(file))).toEqual([]);
  });

  it("uses a persistent database and an environment-provided token", () => {
    const compose = readFileSync("docker-deploy/compose.yaml", "utf8");
    const server = readFileSync("docker-deploy/app/blog/server.py", "utf8");
    const envExample = readFileSync("docker-deploy/.env.example", "utf8");

    expect(compose).toContain('"127.0.0.1:8066:8066"');
    expect(compose).toContain("./data:/data");
    expect(compose).toContain("BLOG_TOKEN=${BLOG_TOKEN:?");
    expect(server).toContain('os.getenv("BLOG_DB_PATH", "/data/blog.db")');
    expect(server).toContain('BLOG_TOKEN = os.getenv("BLOG_TOKEN")');
    expect(server).toContain("BLOG_TOKEN environment variable is required");
    expect(server).toContain('host="0.0.0.0"');
    expect(envExample).toContain("BLOG_TOKEN=");
    expect(server).not.toMatch(/BLOG_TOKEN\s*=\s*os\.getenv\([^,\n]+,\s*["'][^"']+["']/);
  });
});
