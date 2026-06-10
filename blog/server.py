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


@app.get("/api/posts")
def list_posts(tag: Optional[str] = None, status: Optional[str] = None):
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
app.mount("/static", StaticFiles(directory=blog_dir), name="static")


@app.get("/")
def serve_editor():
    return FileResponse(os.path.join(blog_dir, "editor.html"))


@app.on_event("startup")
def startup():
    init_db()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8066)
