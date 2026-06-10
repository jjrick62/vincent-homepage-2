/**
 * 博客编辑器 — 交互逻辑
 */

const state = {
  posts: [],
  currentId: null,
  allTags: [],
  activeTag: '',
};

const $ = (sel) => document.querySelector(sel);

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

// ── API ──
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

// ── 数据加载 ──
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

// ── 文章列表 ──
function renderPostList() {
  if (state.posts.length === 0) {
    postList.innerHTML =
      '<div style="padding:20px;color:rgba(0,0,0,0.42);text-align:center">暂无文章</div>';
    return;
  }
  postList.innerHTML = state.posts
    .map((p) => {
      const kind = p.status === 'published' ? 'PUBLISHED' : 'DRAFT';
      const selected = p.id === state.currentId ? ' data-selected="true"' : '';
      const title = p.title || '无标题';
      const date = (p.updated_at || '').slice(0, 10);
      return `
        <a class="index-row" href="#" data-id="${p.id}"${selected}>
          <span class="row-kind">${kind}</span>
          <span class="row-main">
            <strong>${esc(title)}</strong>
            <small>${date}</small>
          </span>
          <span class="row-arrow">→</span>
        </a>`;
    })
    .join('');
}

// ── 标签筛选 ──
function renderTagFilter() {
  const html = ['<span data-active="true" data-tag="">全部</span>'];
  state.allTags.forEach((tag) => {
    const active = state.activeTag === tag ? ' data-active="true"' : '';
    html.push(`<span${active} data-tag="${esc(tag)}">${esc(tag)}</span>`);
  });
  tagFilter.innerHTML = html.join('');
}

tagFilter.addEventListener('click', (e) => {
  const span = e.target.closest('span[data-tag]');
  if (!span) return;
  state.activeTag = span.dataset.tag;
  renderTagFilter();
  loadPosts();
});

// ── 文章选择 & 新建 ──
async function selectPost(id) {
  state.currentId = id;
  const post = await api(`/api/posts/${id}`);
  editorTitle.value = post.title;
  editorTextarea.value = post.content;
  editorTags.value = post.tags;
  editorKicker.textContent =
    post.status === 'published' ? '编辑已发布文章' : '编辑草稿';
  renderPostList();
  renderPreview();
}

function newPost() {
  state.currentId = null;
  editorTitle.value = '';
  editorTextarea.value = '';
  editorTags.value = '';
  editorKicker.textContent = '新建文章';
  renderPostList();
  previewContent.innerHTML =
    '<p style="color:rgba(0,0,0,0.42)">预览将在这里实时显示...</p>';
  editorTitle.focus();
}

postList.addEventListener('click', (e) => {
  e.preventDefault();
  const row = e.target.closest('.index-row');
  if (!row) return;
  const id = parseInt(row.dataset.id);
  if (id) selectPost(id);
});

btnNew.addEventListener('click', (e) => {
  e.preventDefault();
  newPost();
});

// ── 保存 / 发布 / 删除 ──
async function savePost(status) {
  const payload = {
    title: editorTitle.value,
    content: editorTextarea.value,
    tags: editorTags.value,
    status,
  };
  if (state.currentId) {
    await api(`/api/posts/${state.currentId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  } else {
    const created = await api('/api/posts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    state.currentId = created.id;
  }
  await loadPosts();
  await loadTags();
  editorKicker.textContent =
    status === 'published' ? '已发布' : '草稿已保存';
}

btnSave.addEventListener('click', (e) => {
  e.preventDefault();
  savePost('draft');
});

btnPublish.addEventListener('click', (e) => {
  e.preventDefault();
  savePost('published');
});

btnDelete.addEventListener('click', async (e) => {
  e.preventDefault();
  if (!state.currentId) return;
  if (!confirm('确定删除这篇文章？')) return;
  await api(`/api/posts/${state.currentId}`, { method: 'DELETE' });
  newPost();
  await loadPosts();
  await loadTags();
});

// ── Markdown 预览 ──
function renderPreview() {
  const raw = editorTextarea.value.trim();
  if (!raw) {
    previewContent.innerHTML =
      '<p style="color:rgba(0,0,0,0.42)">预览将在这里实时显示...</p>';
    return;
  }
  previewContent.innerHTML = marked.parse(raw);
}

editorTextarea.addEventListener('input', renderPreview);
editorTitle.addEventListener('input', renderPreview);

// ── 快捷键 ──
document.addEventListener('keydown', (e) => {
  // Ctrl+S 保存
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
    editorTextarea.value =
      editorTextarea.value.slice(0, start) +
      '  ' +
      editorTextarea.value.slice(end);
    editorTextarea.selectionStart = editorTextarea.selectionEnd = start + 2;
  }
});

// ── 移动端 Tab ──
function initMobileTabs() {
  const tabs = document.querySelectorAll('#editor-tabs button');
  tabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabs.forEach((b) => (b.dataset.active = 'false'));
      btn.dataset.active = 'true';
      const tab = btn.dataset.tab;
      $('#panel-edit').dataset.visible = tab === 'edit' ? 'true' : 'false';
      $('#panel-preview').dataset.visible =
        tab === 'preview' ? 'true' : 'false';
    });
  });
}

// ── 工具 ──
function esc(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ── 启动 ──
async function init() {
  initMobileTabs();
  await loadTags();
  await loadPosts();
  newPost();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
