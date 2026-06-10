# 博客编辑器 — 设计方案

**日期：** 2026-06-10
**状态：** draft

---

## 背景

个人主页 2.0 需要搭配一个博客编辑入口，供 Vincent 自己在线撰写、管理、发布技术文章。编辑页面复用主页瑞士平面风 + 磨砂玻璃视觉体系。

## 技术选型

| 层 | 选型 | 理由 |
|---|---|---|
| 后端 | Python FastAPI | Vincent 熟悉，RAG 项目同款 |
| 存储 | SQLite (blog.db) | 零配置，一个文件，部署时丢服务器即可 |
| 前端 | 原生 JS + 复用 `src/styles.css` | 不引入新依赖，风格统一 |
| Markdown | marked.js (CDN) | 轻量客户端渲染 |
| 代码高亮 | highlight.js (CDN) | 技术博客必备 |

## 文件结构

```
个人主页2.0/
├── index.html              # 主页（已有，不改）
├── src/
│   ├── styles.css          # 复用，不改
│   ├── main.js             # 主页逻辑
│   └── content.js          # 数据
├── blog/
│   ├── editor.html         # 博客编辑器页面
│   ├── editor.js           # 编辑器交互逻辑
│   ├── server.py           # FastAPI 后端（单文件）
│   └── requirements.txt   # FastAPI + uvicorn + python-multipart
└── blog.db                  # SQLite 数据库（自动生成，gitignore）
```

## 编辑器页面布局

### 桌面端（> 980px）

```
┌── 导航栏（磨砂玻璃，复用 .site-header）──────────┐
│ Vincent · 博客管理                               │
├──────────────────────────────────────────────────┤
│ 文章列表（左 30%）       │  编辑区（右 70%）       │
│                          │                        │
│ [全部] [AI] [前端] [其他]│  ┌ Markdown 输入 ────┐ │
│                          │  │                    │ │
│ ● 文章标题 · 草稿        │  │                    │ │
│   2026-06-10 · AI        │  └───────────────────┘ │
│                          │                        │
│ ○ 文章标题 · 已发布       │  ┌ 实时预览 ─────────┐ │
│   2026-06-08 · 前端       │  │ 渲染后的 HTML      │ │
│                          │  │                    │ │
│ [+ 新建文章]              │  └────────────────────┘ │
│                          │                        │
│                          │  [保存草稿]  [发布]     │
└──────────────────────────────────────────────────┘
```

### 移动端（≤ 980px）

```
┌── 导航栏 ──────────────────┐
│ Vincent · 博客管理          │
├─────────────────────────────┤
│ 标签筛选（横滑）             │
│ [全部] [AI] [前端] [其他]    │
├─────────────────────────────┤
│ 文章列表（全宽）             │
│ ● 文章标题 · 草稿            │
│ ○ 文章标题 · 已发布          │
│ [+ 新建文章]                │
├─ 编辑 / 预览 切换按钮 ──────┤
│ [编辑] [预览]               │
├─────────────────────────────┤
│ ┌ Markdown 输入 ──────────┐ │
│ │                         │ │
│ └─────────────────────────┘ │
│ ┌ 预览 ──────────────────┐  │
│ │ 渲染后的 HTML           │  │
│ └─────────────────────────┘  │
│ [保存草稿]  [发布]           │
└──────────────────────────────┘
```

移动端策略：
- 文章列表变全宽，点击文章后切入编辑模式
- 标签栏缩成横向滚动，不换行
- 编辑/预览切换为上下堆叠，不再左右分屏
- 导航栏 `.brand small` 隐藏，节省空间
- 所有按钮最小触摸区域 44×44px

## 样式复用

编辑器页面直接引入主页 CSS：

```html
<link rel="stylesheet" href="../src/styles.css">
```

新增的编辑器专属样式写在 `<style>` 块内，仅覆盖以下部分：
- 编辑区 textarea 样式（等宽字体、暗色底、金色 focus 边框）
- 预览区排版（Prose 风格 Markdown 渲染）
- 文章列表项 hover/选中态
- 移动端断点覆盖（980px / 640px）

不修改 `src/styles.css`，不碰主页任何文件。

## API 设计

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/posts` | 文章列表，支持 `?tag=&status=` |
| GET | `/api/posts/:id` | 单篇文章 |
| POST | `/api/posts` | 新建文章 |
| PUT | `/api/posts/:id` | 更新文章 |
| DELETE | `/api/posts/:id` | 删除文章 |
| GET | `/api/tags` | 所有标签列表 |

### SQLite 表结构

```sql
CREATE TABLE posts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT NOT NULL DEFAULT '',
    content    TEXT NOT NULL DEFAULT '',
    tags       TEXT NOT NULL DEFAULT '',       -- 逗号分隔
    status     TEXT NOT NULL DEFAULT 'draft',  -- 'draft' | 'published'
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 数据流

```
浏览器 editor.html
  │
  ├─ GET /api/posts ──────────→ server.py → SQLite → JSON 响应
  ├─ POST /api/posts ─────────→ server.py → SQLite → JSON 响应
  ├─ PUT /api/posts/:id ──────→ server.py → SQLite → JSON 响应
  └─ DELETE /api/posts/:id ───→ server.py → SQLite → JSON 响应

预览：客户端 marked.js 实时渲染，不经过后端
```

## 交互细节

1. 打开页面 → 加载文章列表，默认显示全部
2. 点击标签 → 过滤列表（前端过滤 + API ?tag= 筛选）
3. 点击"新建文章" → 清空编辑器，标题焦点
4. 点击列表中的文章 → 编辑器填充内容，右侧实时预览
5. 编辑标题/内容 → 预览实时更新（marked.js 客户端渲染）
6. 点击"保存草稿" → POST/PUT API，status='draft'
7. 点击"发布" → POST/PUT API，status='published'
8. Markdown 编辑区支持 Tab 缩进、Ctrl+S 快捷保存

## 启动方式

```bash
# 安装依赖
cd blog/
pip install -r requirements.txt

# 启动后端（含静态文件服务）
python server.py
# → http://127.0.0.1:8080/editor.html

# 前端开发（Vite HMR）
cd ../
npm run dev
# → http://127.0.0.1:5173 主页

# 两个端口独立运行，互不影响
```

## 后续集成

本阶段只做编辑器，不做主页博客板块渲染。后续把 `blog.db` 的文章数据接到主页 `/blog` 路由——方案留两个口子：
1. 主页直接 fetch `http://127.0.0.1:8080/api/posts?status=published` 渲染文章列表
2. 或 build 时 server.py 导出 JSON，主页静态读取
