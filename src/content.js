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

export const primaryProjects = [
  {
    title: "个人主页 2.0",
    summary: "简约黑白 + 磨砂玻璃。Hero、项目展示、技术博客和密钥鉴权在线编辑器。",
    stack: "FastAPI · SQLite · 原生 JS · 黑白网格动效",
    github: "https://github.com/jjrick62/vincent-homepage-2",
  },
  {
    title: "RAG 企业级问答系统",
    summary: "多文档检索增强生成，PDF、网页、数据库三源索引，支持 Hybrid Search。",
    stack: "Python · FastAPI · LangChain · ChromaDB",
    github: "https://github.com/jjrick62/rag-enterprise-qa",
  },
  {
    title: "手势地球",
    summary: "摄像头 21 点手部关键点识别，通过手势控制 3D 地球旋转和缩放。",
    stack: "Three.js · MediaPipe Hands",
    github: "https://github.com/jjrick62/gesture-earth-demo",
    live: "https://jjrick62.github.io/gesture-earth-demo",
  },
  {
    title: "旅行相册 Web",
    summary: "30 万+ 粒子渲染全球海岸线与行政区划，支持离线 PWA 与 3D 投影卡片。",
    stack: "Three.js · PWA · IndexedDB · GeoJSON",
    github: "https://github.com/jjrick62/travel-album-3d",
    live: "https://jjrick62.github.io/travel-album-3d",
  },
  {
    title: "旅行相册 Android",
    summary: "旅行相册 Web 版的 Capacitor 封装，打包为 Android APK。",
    stack: "Capacitor · Three.js · PWA",
    github: "https://github.com/jjrick62/colorful-meridian-android",
  },
];

export const secondaryProjects = [
  {
    title: "算术闹钟",
    summary: "答对 5 道随机加减法题关闭闹钟，悬浮窗与通知栏常驻。",
    stack: "Flutter · Dart · Android",
    github: "https://github.com/jjrick62/alarm_math_app",
  },
  {
    title: "Claude 移动桥",
    summary: "把桌面 Claude Code CLI 包装成手机浏览器可远程操控的 AI Agent 服务。",
    stack: "Python Flask · WebSocket",
    github: "https://github.com/jjrick62/claude-mobile-chat",
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
