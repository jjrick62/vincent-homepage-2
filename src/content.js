export const navItems = [
  { index: "01", id: "featured", label: "Featured", summary: "精选项目与黑色重点卡" },
  { index: "02", id: "projects", label: "Projects", summary: "项目索引与案例" },
  { index: "03", id: "notes", label: "Notes", summary: "技术博客与复盘" },
  { index: "04", id: "method", label: "Method", summary: "Prompt -> Component -> Ship" },
  { index: "05", id: "contact", label: "Contact", summary: "Email / GitHub" },
];

export const featuredProjects = [
  {
    title: "AI Agent 控制台",
    summary: "任务拆解、工具调用、状态可视化，用一个可操作界面展示 AI 工作流。",
    tags: ["React", "Agent", "Motion", "UI"],
  },
  {
    title: "3D 数据地图",
    summary: "把抽象数据关系放进可旋转、可浏览的空间场景。",
    tags: ["Three.js", "Data", "WebGL"],
  },
];

export const projectIndex = [
  {
    kind: "PROJECT",
    title: "Motion Portfolio 实验",
    summary: "黑白网格、流光显影与滚动触发动画。",
  },
  {
    kind: "BLOG",
    title: "如何让 AI 前端不显廉价",
    summary: "审美约束、动效节奏和结构稳定性。",
  },
  {
    kind: "PROJECT",
    title: "个人博客生成器",
    summary: "从笔记到可发布文章的自动整理流程。",
  },
  {
    kind: "BLOG",
    title: "Agent 页面表达笔记",
    summary: "把不可见的推理过程变成可读界面。",
  },
];

export const notes = [
  {
    title: "如何让 AI 前端不显廉价",
    category: "AI Frontend",
    date: "2026.06",
  },
  {
    title: "Agent 工具调用的页面表达",
    category: "Interface",
    date: "2026.05",
  },
  {
    title: "Three.js 可视化中的克制设计",
    category: "Visualization",
    date: "2026.04",
  },
];

export const buildSteps = [
  { label: "Prompt", text: "先定义审美、结构和交互边界。" },
  { label: "Component", text: "把意图拆成可复用的界面组件。" },
  { label: "Motion", text: "用少量动效表达状态与构造过程。" },
  { label: "Review", text: "检查文本、布局、响应式和可读性。" },
  { label: "Ship", text: "沉淀为项目案例和技术复盘。" },
];

export const techGroups = [
  { label: "Frontend", items: ["JavaScript", "React", "Vite", "CSS Motion"] },
  { label: "AI", items: ["Prompt Design", "Agent Workflow", "Tool Use"] },
  { label: "Visualization", items: ["Three.js", "WebGL", "Charts"] },
  { label: "Data", items: ["Python", "SQL", "Analysis"] },
  { label: "Tools", items: ["Git", "Markdown", "Automation"] },
];

export const contactLinks = [
  { label: "Email", href: "mailto:vincent@example.com" },
  { label: "GitHub", href: "https://github.com/" },
];
