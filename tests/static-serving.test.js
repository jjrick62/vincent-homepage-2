import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("FastAPI static serving compatibility", () => {
  it("loads homepage styles through a browser-native stylesheet link", () => {
    const html = readFileSync("index.html", "utf8");
    const main = readFileSync("src/main.js", "utf8");

    expect(html).toContain('href="/src/styles.css"');
    expect(main).not.toContain('import "./styles.css"');
  });

  it("loads editor JavaScript from the mounted static route", () => {
    const html = readFileSync("blog/editor.html", "utf8");

    expect(html).toContain('src="/static/editor.js"');
    expect(html).not.toContain('src="./editor.js"');
  });

  it("links published blog cards to a public reading route", () => {
    const html = readFileSync("index.html", "utf8");
    const server = readFileSync("blog/server.py", "utf8");

    expect(html).toContain("href=\"/read/${p.id}\"");
    expect(server).toContain('@app.get("/read/{post_id}")');
    expect(server).toContain('@app.get("/api/published/{post_id}")');
  });

  it("presents the about section as a monochrome technical growth profile", () => {
    const html = readFileSync("index.html", "utf8");
    const css = readFileSync("src/styles.css", "utf8");

    expect(html).toContain('class="about-profile"');
    expect(html).toContain("当前定位");
    expect(html).toContain("工作方式");
    expect(html).toContain("未来方向");
    expect(html).toContain("AI Agent / Multi-Agent");
    expect(html).toContain("Spark 分布式计算");
    expect(html).toContain("深化 Hadoop 生态");
    expect(html).toContain("大数据工程与实时处理");
    expect(html).toContain("FOCUS 2026+");
    expect(html).not.toContain('class="about-tags"');
    expect(html).not.toContain('class="stack-grid" style="grid-template-columns: repeat(4');
    expect(css).not.toMatch(/#[0-9a-f]{6}[^;\n]*(?:green|lime)/i);
  });

  it("uses consistent project actions instead of clickable featured cards", () => {
    const html = readFileSync("index.html", "utf8");
    const css = readFileSync("src/styles.css", "utf8");

    expect(html).not.toMatch(/<a class="black-feature-card/);
    expect(html.match(/class="project-actions"/g)).toHaveLength(3);
    expect(html.match(/>访问项目<\/a>/g)).toHaveLength(3);
    expect(html.match(/>查看源码<\/a>/g)).toHaveLength(3);
    expect(html).toContain('href="/travel/rag/"');
    expect(html).toContain('href="/travel/gesture/"');
    expect(html).toContain('href="/travel/normal/"');
    expect(html.match(/class="project-card-link"/g)).toHaveLength(2);
    expect(html).toContain('class="project-card-link" href="/travel/gesture/"');
    expect(html).toContain('class="project-card-link" href="/travel/normal/"');
    expect(html).not.toContain('class="featured-grid" style=');
    expect(css).toContain(".project-actions");
    expect(css).toContain(".project-card-link");
    expect(css).toContain("min-height: 44px");
    expect(css).not.toContain('content: "↗"');
  });

  it("does not advertise Graph RAG on the homepage project card", () => {
    const html = readFileSync("index.html", "utf8");
    const content = readFileSync("src/content.js", "utf8");

    expect(html).not.toContain("Graph RAG");
    expect(content).not.toContain("Graph RAG");
  });

  it("requires the blog administrator token from the environment", () => {
    const server = readFileSync("blog/server.py", "utf8");

    expect(server).toContain('BLOG_TOKEN = os.getenv("BLOG_TOKEN")');
    expect(server).toContain("BLOG_TOKEN environment variable is required");
    expect(server).not.toMatch(/BLOG_TOKEN\s*=\s*os\.getenv\([^,\n]+,\s*["'][^"']+["']/);
  });
});
