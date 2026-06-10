"""
博客编辑器后端 — FastAPI + SQLite
启动: python server.py 或 BLOG_TOKEN=xxx python server.py
端口: 8066
鉴权: 环境变量 BLOG_TOKEN，默认 vincent2026
"""

import sqlite3
import os
from datetime import datetime
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="Blog Editor API")

# 加载 .env
env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_path):
    with open(env_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

BLOG_TOKEN = os.getenv("BLOG_TOKEN", "555432")
DB_PATH = os.path.join(os.path.dirname(__file__), "..", "blog.db")

LOGIN_HTML = """<!doctype html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>博客管理 | 登录</title>
<style>
  *{box-sizing:border-box}body{margin:0;background:#f7f7f3;font-family:"Noto Sans SC","PingFang SC",sans-serif;
  display:flex;align-items:center;justify-content:center;min-height:100vh}
  form{width:min(360px,90vw);padding:40px;border:1px solid rgba(0,0,0,0.12);background:rgba(255,255,255,0.5);
  backdrop-filter:blur(12px)}
  h1{font-size:21px;margin:0 0 8px} p{color:rgba(0,0,0,0.52);font-size:14px;margin:0 0 24px}
  input{width:100%;padding:12px;border:1px solid rgba(0,0,0,0.86);background:#fff;font:inherit;font-size:16px;margin-bottom:16px}
  input:focus{outline:none;border-color:#050505}
  button{width:100%;padding:12px;border:1px solid rgba(0,0,0,0.86);background:#050505;color:#f7f7f3;
  font:inherit;font-size:15px;cursor:pointer}
  .error{color:#c00;font-size:13px;margin-bottom:12px}
</style></head>
<body>
<form method="post">
  <h1>博客管理</h1><p>输入访问密钥</p>
  {error}
  <input type="password" name="token" placeholder="密钥..." autofocus>
  <button type="submit">进入编辑器</button>
</form>
</body></html>"""


def check_token(request: Request):
    """从 cookie 或 query 参数中验证 token"""
    token = request.cookies.get("blog_token") or request.query_params.get("token")
    return token == BLOG_TOKEN


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
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


@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    path = request.url.path

    # 静态资源放行
    if path.startswith("/static") or path.startswith("/src"):
        return await call_next(request)

    # GET / → 登录页
    if path == "/" and request.method == "GET":
        return HTMLResponse(LOGIN_HTML.replace("{error}", ""))

    # POST / → 验证密码
    if path == "/" and request.method == "POST":
        form = await request.form()
        if form.get("token", "") == BLOG_TOKEN:
            resp = HTMLResponse('<meta http-equiv="refresh" content="0;url=/editor">')
            resp.set_cookie("blog_token", BLOG_TOKEN, httponly=True, max_age=86400 * 30)
            return resp
        return HTMLResponse(LOGIN_HTML.replace("{error}", '<p class="error">密钥错误</p>'))

    # 其余路由验证 token
    token = request.cookies.get("blog_token") or request.query_params.get("token")
    if token != BLOG_TOKEN:
        if path.startswith("/api"):
            return JSONResponse({"detail": "未授权"}, status_code=401)
        return HTMLResponse(LOGIN_HTML.replace("{error}", ""))

    return await call_next(request)


@app.get("/api/posts")
def list_posts(tag: Optional[str] = None, filter_status: Optional[str] = None):
    with get_db() as conn:
        query = "SELECT id, title, tags, status, created_at, updated_at FROM posts WHERE 1=1"
        params = []
        if tag:
            query += " AND tags LIKE ?"
            params.append(f"%{tag}%")
        if filter_status:
            query += " AND status = ?"
            params.append(filter_status)
        query += " ORDER BY updated_at DESC"
        rows = conn.execute(query, params).fetchall()
        return [dict(r) for r in rows]


@app.get("/api/posts/{post_id}")
def get_post(post_id: int):
    with get_db() as conn:
        row = conn.execute("SELECT * FROM posts WHERE id = ?", (post_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="文章不存在")
        return dict(row)


@app.post("/api/posts", status_code=201)
def create_post(post: PostCreate):
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
    with get_db() as conn:
        existing = conn.execute("SELECT * FROM posts WHERE id = ?", (post_id,)).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="文章不存在")
        conn.execute("DELETE FROM posts WHERE id = ?", (post_id,))
        conn.commit()
    return {"ok": True}


@app.get("/api/tags")
def list_tags():
    with get_db() as conn:
        rows = conn.execute("SELECT tags FROM posts WHERE tags != ''").fetchall()
        tag_set = set()
        for r in rows:
            for t in r["tags"].split(","):
                trimmed = t.strip()
                if trimmed:
                    tag_set.add(trimmed)
        return sorted(tag_set)


blog_dir = os.path.dirname(__file__)
project_dir = os.path.join(blog_dir, "..")
app.mount("/src", StaticFiles(directory=os.path.join(project_dir, "src")), name="src")
app.mount("/static", StaticFiles(directory=blog_dir), name="static")


@app.get("/")
def serve_login():
    """未登录 → 登录页；已登录 → 编辑器（中间件处理）"""
    return HTMLResponse(LOGIN_HTML.replace("{error}", ""))

@app.get("/editor")
def serve_editor():
    """编辑器页面（需鉴权，中间件拦截）"""
    return FileResponse(os.path.join(blog_dir, "editor.html"))


@app.on_event("startup")
def startup():
    init_db()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8066)
