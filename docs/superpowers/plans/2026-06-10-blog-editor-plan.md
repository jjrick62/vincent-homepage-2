# 博客编辑器 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为个人主页 2.0 创建博客编辑器，含 FastAPI+SQLite 后端 + 复用主页 CSS 的编辑器前端

**Architecture:** 单文件 FastAPI 后端（server.py）提供 REST API 操作 SQLite，前端 editor.html 直接复制 index.html 骨架并把 `<main>` 替换为编辑区布局，editor.js 处理全部交互逻辑

**Tech Stack:** Python FastAPI, SQLite, 原生 JS, marked.js CDN, highlight.js CDN

---

## 文件结构（本计划产出）

```
个人主页2.0/
├── blog/
│   ├── editor.html         # 创建 — 复制 index.html 骨架
│   ├── editor.js           # 创建 — 编辑器逻辑
│   ├── server.py           # 创建 — FastAPI 后端
│   └── requirements.txt   # 创建 — Python 依赖
└── .gitignore              # 修改 — 加 blog.db
```

---

### Task 1: 创建 blog 目录和 requirements.txt

**Files:**
- Create: `blog/requirements.txt`
- Modify: `.gitignore`

- [ ] **Step 1: 创建 blog 目录**

```bash
mkdir -p D:/大学作业文件夹/自制软件/个人主页2.0/blog
```

- [ ] **Step 2: 创建 requirements.txt**

写入 `blog/requirements.txt`:

```
fastapi>=0.115.0
uvicorn[standard]>=0.34.0
python-multipart>=0.0.20
```

- [ ] **Step 3: 更新 .gitignore 加 blog.db**

在 `.gitignore` 末尾追加一行 `blog.db`:

```
blog.db
```

- [ ] **Step 4: 安装依赖**

```bash
cd D:/大学作业文件夹/自制软件/个人主页2.0/blog
pip install -r requirements.txt
```

- [ ] **Step 5: 提交**

```bash
git add blog/requirements.txt .gitignore
git commit -m "chore: init blog editor with requirements"
```

---

### Task 2: 创建 server.py（FastAPI + SQLite 后端）

**Files:**
- Create: `blog/server.py`

- [ ] **Step 1: 写 server.py 完整代码**

```python
"""
博客编辑器后端 — FastAPI + SQLite
启动: python server.py
端口: 8080
"""

import sqlite3
import os
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="Blog Editor API")

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "blog.db")


def get_db():
    """获取数据库连接，自动开 row_factory"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
    """初始化数据库表"""
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS posts (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                title      TEXT NOT NULL DEFAULT '',
                content    TEXT NOT NULL DEFAULT '',
                tags       TEXT NOT NULL DEFAULT '',
                status     TEXT NOT NULL DEFAULT 'draft',
                created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
            )
        """)
        conn.commit()


# ---- Pydantic Models ----

class PostCreate(BaseModel):
    title: str = ""
    content: str = ""
    tags: str = ""
    status: str = "draft"


class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[str] = None
    status: Optional[str] = None


# ---- API Routes ----

@app.get("/api/posts")
def list_posts(tag: Optional[str] = None, status: Optional[str] = None):
    """文章列表，支持按标签和状态筛选"""
    with get_db() as conn:
        query = "SELECT id, title, tags, status, created_at, updated_at FROM posts WHERE 1=1"
        params = []
        if tag:
            query += " AND tags LIKE ?"
            params.append(f"%{tag}%")
        if status:
            query += " AND status = ?"
            params.append(status)
        query += " ORDER BY updated_at DESC"
        rows = conn.execute(query, params).fetchall()
        return [dict(r) for r in rows]


@app.get("/api/posts/{post_id}")
def get_post(post_id: int):
    """获取单篇文章全文"""
    with get_db() as conn:
        row = conn.execute("SELECT * FROM posts WHERE id = ?", (post_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="文章不存在")
        return dict(row)


@app.post("/api/posts", status_code=201)
def create_post(post: PostCreate):
    """新建文章"""
    with get_db() as conn:
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cur = conn.execute(
            "INSERT INTO posts (title, content, tags, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            (post.title, post.content, post.tags, post.status, now, now),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM posts WHERE id = ?", (cur.lastrowid,)).fetchone()
        return dict(row)


@app.put("/api/posts/{post_id}")
def update_post(post_id: int, post: PostUpdate):
    """更新文章"""
    with get_db() as conn:
        existing = conn.execute("SELECT * FROM posts WHERE id = ?", (post_id,)).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="文章不存在")

        updates = {}
        if post.title is not None:
            updates["title"] = post.title
        if post.content is not None:
            updates["content"] = post.content
        if post.tags is not None:
            updates["tags"] = post.tags
        if post.status is not None:
            updates["status"] = post.status

        if not updates:
            return dict(existing)

        updates["updated_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        set_clause = ", ".join(f"{k} = ?" for k in updates)
        values = list(updates.values()) + [post_id]
        conn.execute(f"UPDATE posts SET {set_clause} WHERE id = ?", values)
        conn.commit()
        row = conn.execute("SELECT * FROM posts WHERE id = ?", (post_id,)).fetchone()
        return dict(row)


@app.delete("/api/posts/{post_id}")
def delete_post(post_id: int):
    """删除文章"""
    with get_db() as conn:
        existing = conn.execute("SELECT * FROM posts WHERE id = ?", (post_id,)).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="文章不存在")
        conn.execute("DELETE FROM posts WHERE id = ?", (post_id,))
        conn.commit()
    return {"ok": True}


@app.get("/api/tags")
def list_tags():
    """获取所有标签（去重）"""
    with get_db() as conn:
        rows = conn.execute("SELECT tags FROM posts WHERE tags != ''").fetchall()
        tag_set = set()
        for r in rows:
            for t in r["tags"].split(","):
                trimmed = t.strip()
                if trimmed:
                    tag_set.add(trimmed)
        return sorted(tag_set)


# ---- Static & Startup ----

# 挂载 blog 目录下的静态文件
blog_dir = os.path.dirname(__file__)
app.mount("/static", StaticFiles(directory=blog_dir), name="static")


@app.get("/")
def serve_editor():
    """默认路由 → editor.html"""
    return FileResponse(os.path.join(blog_dir, "editor.html"))


@app.on_event("startup")
def startup():
    init_db()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8080)
```

- [ ] **Step 2: 验证后端能启动**

```bash
cd D:/大学作业文件夹/自制软件/个人主页2.0/blog
python server.py
# 预期输出: Uvicorn running on http://127.0.0.1:8080
```

- [ ] **Step 3: 快速验证 API**

```bash
# 另开终端
curl http://127.0.0.1:8080/api/posts          # → []
curl -X POST http://127.0.0.1:8080/api/posts -H "Content-Type: application/json" -d '{"title":"测试","content":"# Hello","tags":"AI,前端","status":"draft"}'
# → {"id":1,"title":"测试",...}
curl http://127.0.0.1:8080/api/posts          # → [{...}]
curl http://127.0.0.1:8080/api/tags           # → ["AI","前端"]
curl http://127.0.0.1:8080/                   # → 200 (editor.html)
```

- [ ] **Step 4: 提交**

```bash
git add blog/server.py
git commit -m "feat: blog editor FastAPI backend with CRUD + tags API"
```

---

### Task 3: 创建 editor.html（复制 index.html 骨架）

**Files:**
- Create: `blog/editor.html`

- [ ] **Step 1: 从 index.html 复制骨架到 editor.html**

`editor.html`  = `index.html` 的完整内容，然后做以下替换：

1. `<title>` 改为 `博客管理 | Vincent`
2. `<meta name="description">` 改为 `"博客编辑器 — 撰写和管理技术文章"`
3. `.brand` 里面 `<strong>` 保持 Vincent，`<small>` 改为 `博客管理`
4. `.command-toggle` 的 `<span>` 文字从 "Index" 改为 "菜单"
5. 整个 `<main>...</main>` 替换为下面的编辑区 HTML
6. 底部的 `<script type="module" src="/src/main.js">` 替换为 `<script type="module" src="./editor.js">`

**替换 `<main>` 的内容（桌面端双栏 + 移动端堆叠）：**

```html
<main>
  <section class="section-block">
    <p class="eyebrow">BLOG EDITOR</p>
    <h2>博客管理</h2>
  </section>

  <!-- 标签筛选 -->
  <div class="section-block" style="padding-top:0;padding-bottom:0">
    <div class="tag-row" id="tag-filter">
      <span data-active="true" data-tag="">全部</span>
    </div>
  </div>

  <div class="section-block" style="display:flex;gap:32px;align-items:flex-start;padding-top:20px" id="editor-layout">

    <!-- 左侧：文章列表 + 新建按钮 -->
    <div style="width:280px;flex-shrink:0" id="post-list-panel">
      <div class="index-list" id="post-list">
        <div style="padding:20px;color:rgba(0,0,0,0.42);text-align:center">加载中...</div>
      </div>
      <div style="margin-top:14px">
        <button class="command-toggle" type="button" id="btn-new" style="width:100%;justify-content:center">
          + 新建文章
        </button>
      </div>
    </div>

    <!-- 右侧：编辑区 + 预览区 -->
    <div style="flex:1;min-width:0" id="editor-panel">

      <!-- 移动端 Tab 切换 -->
      <div class="editor-tabs" id="editor-tabs">
        <button data-tab="edit" data-active="true">编辑</button>
        <button data-tab="preview">预览</button>
      </div>

      <!-- 编辑区 -->
      <div class="editor-panel" data-visible="true" id="panel-edit">
        <article class="black-feature-card" style="min-height:auto">
          <div class="card-kicker" id="editor-kicker">新建文章</div>
          <input
            type="text"
            class="editor-title"
            id="editor-title"
            placeholder="文章标题..."
          />
          <textarea
            class="editor-textarea"
            id="editor-textarea"
            placeholder="Markdown 正文..."
          ></textarea>
          <div class="tag-row" style="margin-top:16px">
            <input
              type="text"
              id="editor-tags"
              placeholder="标签，逗号分隔"
              style="background:transparent;border:1px solid rgba(255,255,255,0.18);color:#f7f7f3;padding:5px 8px;font:inherit;font-size:12px;width:100%"
            />
          </div>
        </article>
      </div>

      <!-- 预览区 -->
      <div class="editor-panel" data-visible="true" id="panel-preview">
        <article class="article-glass">
          <p class="eyebrow">PREVIEW</p>
          <div class="preview-content" id="preview-content">
            <p style="color:rgba(0,0,0,0.42)">预览将在这里实时显示...</p>
          </div>
        </article>
      </div>

      <!-- 操作按钮 -->
      <div class="footer-links" style="margin-top:20px">
        <a href="#" id="btn-save-draft">保存草稿</a>
        <a href="#" id="btn-publish" style="background:#050505;color:#f7f7f3;border-color:#050505">发布</a>
        <a href="#" id="btn-delete" style="color:rgba(0,0,0,0.4);border-color:rgba(0,0,0,0.1)">删除</a>
      </div>
    </div>
  </div>
</main>
```

- [ ] **Step 2: 在 editor.html 的 `</head>` 前加入编辑器专用 `<style>` 块**

复制设计文档中「仅补的 `<style>` 块」全部 CSS 规则，插入到 `editor.html` 的 `<link rel="stylesheet" href="../src/styles.css">` 之后、`</head>` 之前。

完整 style 块参考设计文档 `2026-06-10-blog-editor-design.md` 中「仅补的 `<style>` 块」章节。

- [ ] **Step 3: 加入 marked.js + highlight.js CDN**

在 `</head>` 前加：

```html
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/styles/github-dark.min.css">
<script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/highlight.min.js"></script>
```

- [ ] **Step 4: 验证 editor.html 能加载**

```bash
# 确保后端在跑
cd D:/大学作业文件夹/自制软件/个人主页2.0/blog
python server.py &
# 浏览器打开 http://127.0.0.1:8080
# 预期：看到完整编辑器布局，网格背景 + 磨砂导航 + 左侧列表 + 右侧编辑区
```

- [ ] **Step 5: 提交**

```bash
git add blog/editor.html
git commit -m "feat: blog editor HTML — reuses index.html shell + grid bg"
```

---

### Task 4: 创建 editor.js（编辑器交互逻辑）

**Files:**
- Create: `blog/editor.js`

- [ ] **Step 1: 写 editor.js 完整代码**

```javascript
/**
 * 博客编辑器 — 交互逻辑
 * API base: 同域 /api/*
 */

const state = {
  posts: [],
  currentId: null,
  allTags: [],
  activeTag: '',
};

// ---- DOM 引用 ----
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const postList = $('#post-list');
const tagFilter = $('#tag-filter');
const editorTitle = $('#editor-title');
const editorTextarea = $('#editor-textarea');
const editorTags = $('#editor-tags');
const editorKicker = $('#editor-kicker');
const previewContent = $('#preview-content');
const btnNew = $('#btn-new');
const btnSave = $('#btn-save-draft');
const btnPublish = $('#btn-publish');
const btnDelete = $('#btn-delete');

// ---- API 封装 ----
async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// ---- 加载数据 ----
async function loadPosts() {
  const params = new URLSearchParams();
  if (state.activeTag) params.set('tag', state.activeTag);
  state.posts = await api(`/api/posts?${params}`);
  renderPostList();
}

async function loadTags() {
  state.allTags = await api('/api/tags');
  renderTagFilter();
}

// ---- 渲染文章列表 ----
function renderPostList() {
  if (state.posts.length === 0) {
    postList.innerHTML = '<div style="padding:20px;color:rgba(0,0,0,0.42);text-align:center">暂无文章</div>';
    return;
  }
  postList.innerHTML = state.posts.map((p) => {
    const kind = p.status === 'published' ? 'PUBLISHED' : 'DRAFT';
    const selected = p.id === state.currentId ? ' data-selected="true"' : '';
    return `
      <a class="index-row" href="#" data-id="${p.id}"${selected}>
        <span class="row-kind">${kind}</span>
        <span class="row-main">
          <strong>${escapeHtml(p.title || '无标题')}</strong>
          <small>${p.updated_at?.slice(0, 10) || ''}</small>
        </span>
        <span class="row-arrow">→</span>
      </a>
    `;
  }).join('');
}

// ---- 渲染标签筛选 ----
function renderTagFilter() {
  const allSpan = tagFilter.querySelector('[data-tag=""]');
  tagFilter.innerHTML = '';
  const allBtn = document.createElement('span');
  allBtn.dataset.tag = '';
  allBtn.dataset.active = state.activeTag === '' ? 'true' : 'false';
  allBtn.textContent = '全部';
  allBtn.style.cursor = 'pointer';
  tagFilter.appendChild(allBtn);

  state.allTags.forEach((tag) => {
    const span = document.createElement('span');
    span.dataset.tag = tag;
    span.dataset.active = state.activeTag === tag ? 'true' : 'false';
    span.textContent = tag;
    span.style.cursor = 'pointer';
    tagFilter.appendChild(span);
  });
}

// ---- 选中文章 ----
async function selectPost(id) {
  state.currentId = id;
  const post = await api(`/api/posts/${id}`);
  editorTitle.value = post.title;
  editorTextarea.value = post.content;
  editorTags.value = post.tags;
  editorKicker.textContent = post.status === 'published' ? '编辑已发布文章' : '编辑草稿';
  renderPostList();
  renderPreview();
}

// ---- 新建文章 ----
function newPost() {
  state.currentId = null;
  editorTitle.value = '';
  editorTextarea.value = '';
  editorTags.value = '';
  editorKicker.textContent = '新建文章';
  renderPostList();
  previewContent.innerHTML = '<p style="color:rgba(0,0,0,0.42)">预览将在这里实时显示...</p>';
  editorTitle.focus();
}

// ---- 保存/发布 ----
async function savePost(status) {
  const payload = {
    title: editorTitle.value,
    content: editorTextarea.value,
    tags: editorTags.value,
    status,
  };
  if (state.currentId) {
    await api(`/api/posts/${state.currentId}`, { method: 'PUT', body: JSON.stringify(payload) });
  } else {
    const created = await api('/api/posts', { method: 'POST', body: JSON.stringify(payload) });
    state.currentId = created.id;
  }
  await loadPosts();
  await loadTags();
  editorKicker.textContent = status === 'published' ? '已发布' : '草稿已保存';
}

// ---- 删除文章 ----
async function deletePost() {
  if (!state.currentId) return;
  if (!confirm('确定删除这篇文章？')) return;
  await api(`/api/posts/${state.currentId}`, { method: 'DELETE' });
  newPost();
  await loadPosts();
  await loadTags();
}

// ---- Markdown 预览 ----
function renderPreview() {
  if (!editorTextarea.value.trim()) {
    previewContent.innerHTML = '<p style="color:rgba(0,0,0,0.42)">预览将在这里实时显示...</p>';
    return;
  }
  const html = marked.parse(editorTextarea.value);
  previewContent.innerHTML = html;
  // highlight.js
  previewContent.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightElement(block);
  });
}

// ---- 工具 ----
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ---- 移动端 Tab 切换 ----
function initMobileTabs() {
  const tabs = $$('#editor-tabs button');
  tabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabs.forEach((b) => (b.dataset.active = 'false'));
      btn.dataset.active = 'true';
      const tab = btn.dataset.tab;
      $('#panel-edit').dataset.visible = tab === 'edit' ? 'true' : 'false';
      $('#panel-preview').dataset.visible = tab === 'preview' ? 'true' : 'false';
    });
  });
}

// ---- 事件绑定 ----
function bindEvents() {
  // 标签筛选
  tagFilter.addEventListener('click', (e) => {
    const span = e.target.closest('span[data-tag]');
    if (!span) return;
    state.activeTag = span.dataset.tag;
    renderTagFilter();
    loadPosts();
  });

  // 文章列表点击
  postList.addEventListener('click', (e) => {
    e.preventDefault();
    const row = e.target.closest('.index-row');
    if (!row) return;
    const id = parseInt(row.dataset.id);
    if (id) selectPost(id);
  });

  // 新建
  btnNew.addEventListener('click', (e) => { e.preventDefault(); newPost(); });

  // 保存草稿
  btnSave.addEventListener('click', (e) => { e.preventDefault(); savePost('draft'); });

  // 发布
  btnPublish.addEventListener('click', (e) => { e.preventDefault(); savePost('published'); });

  // 删除
  btnDelete.addEventListener('click', (e) => { e.preventDefault(); deletePost(); });

  // 实时预览
  editorTextarea.addEventListener('input', renderPreview);
  editorTitle.addEventListener('input', renderPreview);

  // Ctrl+S 快捷保存
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      savePost('draft');
    }
  });

  // Tab 缩进
  editorTextarea.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = editorTextarea.selectionStart;
      const end = editorTextarea.selectionEnd;
      editorTextarea.value = editorTextarea.value.slice(0, start) + '  ' + editorTextarea.value.slice(end);
      editorTextarea.selectionStart = editorTextarea.selectionEnd = start + 2;
    }
  });

  // 移动端
  initMobileTabs();
}

// ---- 启动 ----
async function init() {
  bindEvents();
  await loadTags();
  await loadPosts();
  newPost();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

- [ ] **Step 2: 验证编辑器功能**

```bash
# 确保 server.py 在跑
# 浏览器打开 http://127.0.0.1:8080
# 操作验证:
# 1. 点击"新建文章" → 输入标题和 Markdown 正文
# 2. 右侧预览区实时渲染
# 3. 输入标签 "AI,前端"
# 4. 点击"保存草稿" → 左侧列表出现草稿条目
# 5. 点击"发布" → 条目变为 PUBLISHED
# 6. 标签筛选栏出现 "AI" "前端"
# 7. 点击标签筛选列表
# 8. Ctrl+S 快速保存
# 9. 移动端宽高下查看布局
```

- [ ] **Step 3: 提交**

```bash
git add blog/editor.js
git commit -m "feat: blog editor JS — post CRUD, live preview, tag filter, mobile tabs"
```

---

### Task 5: 全链路联调 + 移动端验证

- [ ] **Step 1: 启动完整服务**

```bash
cd D:/大学作业文件夹/自制软件/个人主页2.0/blog
python server.py
# http://127.0.0.1:8080
```

- [ ] **Step 2: 端到端流程测试**

```bash
# 1. 新建文章 → 保存草稿 → 列表出现
# 2. 编辑文章 → 发布 → 状态变为 PUBLISHED
# 3. 新建第二篇文章 → 不同标签
# 4. 标签筛选工作正常
# 5. 删除文章 → 列表移除
# 6. 刷新页面 → 数据持久化
# 7. Ctrl+S 快捷保存
```

- [ ] **Step 3: 移动端验证**

```bash
# 使用浏览器 DevTools 切换到移动视图 (375px / 768px)
# 验证:
# 1. 文章列表全宽
# 2. 标签横滑
# 3. 编辑/预览 Tab 切换
# 4. 触摸目标 ≥ 44px
# 5. 导航栏品牌小字隐藏
```

- [ ] **Step 4: 最终提交**

```bash
git add -A
git commit -m "feat: blog editor complete — FastAPI backend + vanilla JS frontend"
```

---

## 完成检查清单

- [ ] `python server.py` 启动无报错
- [ ] `http://127.0.0.1:8080` 显示编辑器
- [ ] 网格背景 + 扫光动画正常
- [ ] 新建/编辑/保存/发布/删除文章全部可用
- [ ] Markdown 实时预览（含代码高亮）
- [ ] 标签筛选功能正常
- [ ] Ctrl+S 快捷保存
- [ ] 移动端布局正确
- [ ] blog.db 自动生成，数据持久化
- [ ] 主页 `index.html` 未改动
