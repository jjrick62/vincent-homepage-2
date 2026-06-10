# 博客编辑器 — 设计方案 v2

**日期：** 2026-06-10
**状态：** draft

---

## 背景

个人主页 2.0 需要博客编辑器，供 Vincent 自己在线撰写、管理、发布技术文章。

## 核心策略：坐进现有壳子

不新写 CSS，不引入新设计语言。编辑器 `editor.html` 直接从 `index.html` 复制骨架，把 `<main>` 替换为编辑区。所有 UI 复用现有 CSS 类。

编辑器只补一个 `<style>` 块——编辑区专用样式（textarea 等宽字体、预览区 prose 排版、移动端覆盖），其余的 `.site-shell` `.grid-field` `.site-header` `.black-feature-card` `.note-card` `.article-glass` `.index-row` `.tag-row` `.eyebrow` `h1` `h2` `.footer-links` 全部复用 `src/styles.css`。

---

## 技术选型

| 层 | 选型 |
|---|---|
| 后端 | Python FastAPI |
| 存储 | SQLite (blog.db) |
| 前端 | 原生 JS，复用 `src/styles.css` |
| Markdown | marked.js (CDN) |
| 代码高亮 | highlight.js (CDN) |

---

## 文件结构

```
个人主页2.0/
├── index.html              # 主页（不改）
├── src/
│   ├── styles.css          # 复用，不改
│   ├── main.js
│   └── content.js
├── blog/
│   ├── editor.html         # 编辑器（复制 index.html 骨架 + 替换 main）
│   ├── editor.js           # 编辑器交互逻辑
│   ├── server.py           # FastAPI 后端（单文件）
│   └── requirements.txt   # FastAPI + uvicorn + python-multipart
└── blog.db                  # SQLite 自动生成，gitignore
```

`editor.html` 制作方式：
1. 复制 `index.html` 的全部 `<head>` 和 `<body>` 壳子
2. `<link>` 指向 `../src/styles.css`
3. `<title>` 改为 "博客管理"
4. 保留 `.grid-field` + `.grid-ray`（背景）
5. 保留 `.site-header`（导航，文字改成"博客管理"）
6. 把整个 `<main>...</main>` 替换成编辑器布局
7. 末尾加一个 `<style>` 块（编辑区专用样式）
8. `<script>` 指向 `./editor.js`

---

## 编辑器页面布局

### 桌面端（> 980px）

```
┌── .site-header（磨砂固定顶栏）──────────────┐
│ [V] Vincent                     [博客管理 ▤] │
├─────────────────────────────────────────────┤
│ .grid-field 网格背景 + 扫光动画               │
│                                             │
│  ┌ 左侧 280px ──────────┐ ┌ 右侧编辑区 ─────┤│
│  │ .eyebrow "POSTS"      │ │               ││
│  │                       │ │ .black-feature-card              ││
│  │ 标签 .tag-row:         │ │ ┌ .card-kicker "EDITOR"          ││
│  │ [全部][AI][前端][工程]  │ │ │                               ││
│  │                       │ │ │ textarea 黑底白字等宽            ││
│  │ 文章列表 .index-row:   │ │ │                               ││
│  │ ┌ PROJECT · 已发布 ─┐ │ │ └───────────────────────────────┘││
│  │ │ 文章标题           │ │ │                                  ││
│  │ │ 2026-06-10     →  │ │ │ .article-glass（预览区）          ││
│  │ └──────────────────┘ │ │ │ 渲染后的 HTML                    ││
│  │ ┌ BLOG · 草稿 ──────┐│ │ │                                  ││
│  │ │ 文章标题          →││ │ └──────────────────────────────────┘│
│  │ └──────────────────┘ │ │                                    │
│  │                       │ │ .footer-links 按钮组:              │
│  │ [+ 新建文章]           │ │ [保存草稿]  [发布]                 │
│  └───────────────────────┘ │                                    │
└──────────────────────────────────────────────────────────────────┘
```

### 移动端（≤ 980px）

```
┌── .site-header ──────────┐
│ [V] Vincent  [博客管理 ▤] │
├───────────────────────────┤
│ .eyebrow "POSTS"          │
│ 标签 .tag-row 横滑         │
│ [全部][AI][前端][工程]     │
│                           │
│ 文章列表 .index-row 全宽   │
│ ┌ PROJECT · 已发布 ────┐  │
│ │ 文章标题            →│  │
│ └─────────────────────┘  │
│ [+ 新建文章]              │
│                           │
│ ── [编辑] [预览] Tab ──── │
│                           │
│ ┌ .black-feature-card ──┐│
│ │ textarea               ││
│ └────────────────────────┘│
│                           │
│ .article-glass 预览区     │
│                           │
│ [保存草稿]  [发布]         │
└───────────────────────────┘
```

移动端行为：
- 文章列表全宽，点击文章进入编辑模式
- 编辑/预览切换为上下堆叠，Tab 按钮切换显示
- `.brand small` 隐藏
- 所有触摸目标 ≥ 44×44px
- 标签栏横向滚动，不换行

---

## CSS 复用清单

编辑器页面 `<link rel="stylesheet" href="../src/styles.css">` 引入主页全部样式。

| 主页元素 | CSS 类 | 编辑器用途 |
|---|---|---|
| 网格背景 + 扫光 | `.grid-field` `.grid-ray` | 全页背景 |
| 固定顶栏 | `.site-header` | 导航栏 |
| 品牌标识 | `.brand` `.brand-mark` | 左上 "V" + Vincent |
| 导航按钮 | `.command-toggle` | 右上菜单按钮 |
| 磨砂下拉 | `.command-panel` | 快捷操作面板 |
| 全大写标签 | `.eyebrow` | "POSTS" "EDITOR" |
| 大标题 | `h2` | 页面标题 |
| 黑色主打卡 | `.black-feature-card` | Markdown 编辑区容器 |
| 卡内标签 | `.card-kicker` | 编辑区上方分类标签 |
| 技术标签组 | `.tag-row` `span` | 文章标签筛选 + 输入 |
| 索引行 | `.index-row` `.row-kind` `.row-main` `.row-arrow` | 文章列表项 |
| 磨砂卡片 | `.note-card` | 备选列表样式 |
| 磨砂阅读容器 | `.article-glass` | Markdown 预览区 |
| 区块壳 | `.section-block` `.section-heading` | 整体布局 |
| 磨砂按钮 | `.footer-links a` | 保存/发布按钮 |

### 仅补的 `<style>` 块

```css
/* 编辑区 textarea — 适配 .black-feature-card 黑底风格 */
.editor-textarea {
  background: transparent;
  color: #f7f7f3;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  line-height: 1.8;
  border: none;
  outline: none;
  resize: none;
  width: 100%;
  min-height: 400px;
}
.editor-textarea:focus {
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.3);
}

/* 文章标题 input — 适配 .black-feature-card */
.editor-title {
  background: transparent;
  color: #f7f7f3;
  font-family: inherit;
  font-size: 24px;
  font-weight: 700;
  border: none;
  outline: none;
  width: 100%;
  margin-bottom: 16px;
}
.editor-title::placeholder { color: rgba(255,255,255,0.3); }

/* Markdown 预览区 prose */
.preview-content {
  color: rgba(0,0,0,0.78);
  line-height: 1.96;
}
.preview-content h1 { font-size: clamp(28px, 4vw, 40px); margin: 1em 0 0.5em; }
.preview-content h2 { font-size: clamp(22px, 3vw, 30px); margin: 1em 0 0.5em; }
.preview-content h3 { font-size: clamp(18px, 2vw, 24px); }
.preview-content p { margin: 0.8em 0; }
.preview-content code {
  font-family: 'JetBrains Mono', monospace;
  background: rgba(0,0,0,0.06);
  padding: 2px 6px;
  border-radius: 3px;
}
.preview-content pre {
  background: #050505;
  color: #f7f7f3;
  padding: 20px;
  overflow-x: auto;
}
.preview-content pre code { background: transparent; color: inherit; padding: 0; }
.preview-content img { max-width: 100%; }
.preview-content blockquote {
  border-left: 2px solid rgba(0,0,0,0.2);
  padding-left: 16px;
  color: rgba(0,0,0,0.5);
  margin-left: 0;
}

/* 文章列表项选中态 */
.index-row[data-selected="true"] {
  background: #050505;
  color: #f7f7f3;
}
.index-row[data-selected="true"] .row-kind,
.index-row[data-selected="true"] .row-main small {
  color: rgba(255,255,255,0.6);
}

/* 标签按钮选中态 */
.tag-row button[data-active="true"],
.tag-row span[data-active="true"] {
  background: #050505;
  color: #f7f7f3;
  border-color: #050505;
}

/* 编辑/预览 Tab（移动端） */
.editor-tabs { display: none; }
@media (max-width: 980px) {
  .editor-tabs { display: flex; gap: 0; margin-bottom: 16px; }
  .editor-tabs button {
    flex: 1;
    padding: 10px;
    border: 1px solid rgba(0,0,0,0.14);
    background: rgba(255,255,255,0.5);
    font: inherit;
    cursor: pointer;
  }
  .editor-tabs button[data-active="true"] {
    background: #050505;
    color: #f7f7f3;
  }
  .editor-panel[data-visible="false"] { display: none; }
}
```

---

## API 设计

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/posts` | 文章列表 `?tag=&status=` |
| GET | `/api/posts/:id` | 单篇文章 |
| POST | `/api/posts` | 新建 |
| PUT | `/api/posts/:id` | 更新 |
| DELETE | `/api/posts/:id` | 删除 |
| GET | `/api/tags` | 所有标签 |

### SQLite

```sql
CREATE TABLE posts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT NOT NULL DEFAULT '',
    content    TEXT NOT NULL DEFAULT '',
    tags       TEXT NOT NULL DEFAULT '',
    status     TEXT NOT NULL DEFAULT 'draft',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

---

## 交互流程

1. 打开 `editor.html` → 加载文章列表
2. 点击标签 → 过滤列表
3. 点击"新建" → 清空编辑器，标题获得焦点
4. 点击列表文章 → 编辑器填充，右侧实时预览
5. Ctrl+S / 点击"保存草稿" → POST/PUT API
6. 点击"发布" → status='published'
7. 移动端 → Tab 切换编辑/预览视图

---

## 启动

```bash
cd blog/
pip install -r requirements.txt
python server.py          # → http://127.0.0.1:8080
```

---

## 后续集成

博客文章数据通过 `/api/posts?status=published` 暴露，主页 `/blog` 路由后续接入——不在本次范围。
