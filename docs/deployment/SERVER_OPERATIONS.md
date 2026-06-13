# 服务器操作日志

> 服务器：`101.32.68.78`
>
> 域名：`taffyshine.asia`
>
> 时区：`Asia/Shanghai`
>
> 本日志不得记录密码、Token、API Key 或私钥。
>
> 服务器主日志：`/home/ubuntu/CLAUDE-OPERATIONS-LOG.txt`
>
> 本文件为本地同步副本，服务器主日志优先。

## 记录格式

```text
## YYYY-MM-DD HH:mm - 操作标题

- 操作目标：
- 实际操作：
- 验证结果：
- 回滚与遗留：
- 署名：gpt
```

---

## 2026-06-11 12:17 - 新服务器初始化

- 操作目标：在新服务器 (101.32.68.78, 原 154.8.163.88 已不可用) 上搭建基础设施。
- 实际操作：
  - 添加 2GB Swap (`/swapfile`, fstab 持久化)
  - 安装 Docker 29.5.3 + Docker Compose (清华镜像源)
  - 配置 Docker 镜像加速: `docker.m.daocloud.io`, `dockerhub.icu`
  - 安装 Nginx 1.18.0 (apt)
  - 配置 ufw 防火墙: 放行 22, 80, 443
- 验证结果：Docker/Nginx 均 running，Swap 已启用。
- 回滚与遗留：无回滚。旧服务器 154.8.163.88 已不可访问。
- 署名：gpt

## 2026-06-11 12:25 - 上传项目文件

- 操作目标：将四个项目上传至 `/home/ubuntu/projects/`。
- 实际操作：
  - SFTP 上传: 手势版 (11MB), 普通版 (13MB), 个人主页 (40KB)
  - SFTP 上传: RAG 模型 (2.4GB, bge-small-zh-v1.5 + bge-reranker-v2-m3, 从本地 ModelScope 缓存)
  - 解压至 `/home/ubuntu/projects/{gesture,normal,homepage,rag}/`
- 验证结果：所有文件就位，模型无需重新下载。
- 回滚与遗留：初次 RAG 代码 tar.gz 包含 venv (6万文件) 被排除后重传。Windows 路径反斜杠问题后续修复。
- 署名：gpt

## 2026-06-11 12:38 - Docker 部署三个容器化项目

- 操作目标：构建并启动手势版、普通版、个人主页的 Docker 容器。
- 实际操作：
  - 手势版: 修复 `docker-compose.yml` 端口 80:80 → 8080:80 (避免与 Nginx 冲突)
  - 普通版: 新建 `docker-compose.yml` (原项目无), 端口 8081:80
  - 个人主页: 创建 `.env` 文件, 端口 8066:8066
  - 修复 Dockerfile COPY 指令 (css/js/data 目录结构)
- 验证结果：4 个容器全部运行正常。
- 回滚与遗留：Dockerfile COPY 路径导致容器内静态文件 404，后续清除缓存重传修复。
- 署名：gpt

## 2026-06-11 13:11 - RAG QA systemd 部署

- 操作目标：将 RAG Enterprise QA 作为 systemd 服务部署 (Docker 构建多次失败改用宿主机)。
- 实际操作：
  - `sudo pip3 install` 系统级全量依赖 (chromadb, sentence-transformers, torch 等)
  - 创建 `/etc/systemd/system/rag-qa.service`: uvicorn :8082, Restart=always
  - 摄入 54 篇 IBM watsonx 文档 → ChromaDB (857 chunks)
  - 逐次修复缺失依赖: fastapi, sentence-transformers, openai, rank-bm25 等
- 验证结果：`systemctl is-active rag-qa` → active, API health → ok。
- 回滚与遗留：RAG 未 Docker 化。ragas/datasets 未安装 (依赖 torch/CUDA 太大)。
- 署名：gpt

## 2026-06-11 13:15 - Nginx 网关配置

- 操作目标：配置反向代理，80→443 HTTPS，路由分发至四个项目。
- 实际操作：写入 `/etc/nginx/sites-available/taffyshine`
  - `/` → localhost:8066 (个人主页)
  - `/travel/gesture/` → :8080, `/travel/normal/` → :8081, `/travel/rag/` → :8082
  - `/api/chat/*`, `/api/documents/*`, `/api/health` → :8082 (RAG)
  - `/api/published`, `/editor`, `/read/*`, `/src/*` → :8066 (博客)
  - `/api/*`, `/auth/*` → :8080 (手势版后端)
- 验证结果：全链路 12/12 HTTP 200。
- 回滚与遗留：无。
- 署名：gpt

## 2026-06-11 13:31 - SSL 证书

- 操作目标：配置 HTTPS (Let's Encrypt)。
- 实际操作：acme.sh + DNS 验证 (TXT `_acme-challenge`)；证书安装至 `/etc/nginx/ssl/`；cron 自动续期。
- 验证结果：443 监听正常，HTTPS 返回 200，有效期至 2026-09-08。
- 回滚与遗留：无。
- 署名：gpt

## 2026-06-11 13:26 - 修复静态资源 404

- 操作目标：修复 RAG、手势版、普通版前端 CSS/JS 全部 404。
- 实际操作：
  - 根因：Windows SFTP/tar 上传时 `\` 被写入 Linux 文件名 (如 `css\style.css` 是单个文件而非目录内)
  - 逐项目移动文件至正确目录结构；修复 Dockerfile COPY 指令；清除 Docker 缓存重建
- 验证结果：所有 CSS/JS 返回 200。
- 回滚与遗留：后续应使用 SFTP 逐文件上传，避免 Windows 路径问题。
- 署名：gpt

## 2026-06-11 13:40 - 个人主页项目卡片链接

- 操作目标：主页三个黑卡片添加部署好的项目跳转链接。
- 实际操作：每个卡片底部加"访问项目"+"查看源码"按钮，移动端 CSS 同步更新。
- 验证结果：跳转正常，全链路 200。
- 回滚与遗留：无。
- 署名：gpt

## 2026-06-11 14:05 - 服务器冗余清理

- 操作目标：清理部署临时文件和缓存。
- 实际操作：删除 tar.gz 残留 (394MB)、反斜杠文件名残骸 (200+)、`__pycache__/`、`.pyc`、pip 缓存。
- 验证结果：磁盘 49% (释放约 4GB)。
- 回滚与遗留：无。
- 署名：gpt

## 2026-06-11 14:08 - 建立服务器操作日志

- 操作目标：在服务器和本地建立操作日志。
- 实际操作：服务器创建 `/home/ubuntu/CLAUDE-OPERATIONS-LOG.txt`；本地创建本文件。约定每次操作同步更新两份日志，署名 gpt。
- 验证结果：两份日志已创建并同步。
- 回滚与遗留：后续每次服务器操作均需更新两份日志。
- 署名：gpt

## 2026-06-11 22:15 - 更新 RAG 移动端布局

- 操作目标：改善 RAG Enterprise QA 在手机屏幕上的显示与交互。
- 实际操作：更新 `mobile-fix.css`；调整顶部导航、QA 输入区、六阶段流程、SYS 页面、更多菜单和文档鉴权弹窗；版本标记更新为 `mobile-fix.css?v=20260611-2`。
- 验证结果：390×844 视口无横向溢出；RAG 入口 HTTP 200。
- 回滚与遗留：RAG 当前仍由 systemd 运行，尚未 Docker 化。
- 署名：gpt

## 2026-06-11 22:20 - 更新个人主页项目卡片跳转

- 操作目标：让两个旅行相册卡片直接跳转到服务器本地项目。
- 实际操作：更新主页前端，增加整卡链接 + 独立源码入口；重建 `vincent-homepage` 容器。
- 验证结果：线上全链路 200。
- 回滚与遗留：未提交 Git。
- 署名：gpt

## 2026-06-11 22:52 - 同步服务器端操作日志

- 操作目标：将服务器 `/home/ubuntu/CLAUDE-OPERATIONS-LOG.txt` 设为正式主日志，并与本地同步。
- 实际操作：首次普通 SFTP 追加因权限不足被拒绝；使用 sudo 追加后发现 Windows 管道编码异常；备份服务器日志并用 UTF-8 文件修复本次新增段落；更新本地 README 与日志副本中的主日志路径。
- 验证结果：原有 `Claude` 历史记录完整；服务器主日志中的三条新增记录中文显示正常且均署名 `gpt`；本地文档已明确服务器日志优先。
- 回滚与遗留：服务器备份为 `/home/ubuntu/CLAUDE-OPERATIONS-LOG.txt.bak-20260611-2252`；未提交 Git。
- 署名：gpt

---

## 当前服务状态

| 服务 | 管理 | 端口 | 状态 |
|------|------|------|------|
| Nginx | systemd | 80,443 | enabled/active |
| Docker | systemd | - | enabled/active |
| RAG QA | systemd | 8082 | enabled/active |
| 个人主页 | Docker | 8066 | healthy |
| 手势版 | Docker | 8080,8000 | running |
| 普通版 | Docker | 8081 | running |

公开入口: https://taffyshine.asia/ 及其 `/travel/gesture/`, `/travel/normal/`, `/travel/rag/`

---

## 2026-06-13 12:57-13:00 - 移除主页 RAG 项目的 Graph RAG 表述

- 操作目标：移除个人主页 RAG 项目卡片中的 `Graph RAG` 标签/能力表述。
- 实际操作：确认主页服务器目录和容器状态；上传更新后的 `app/index.html`；备份原文件；执行 `docker compose up -d --build` 重建并启动 `vincent-homepage`。
- 验证结果：本地 14 项测试全部通过，Vite 构建成功；线上容器状态为 `healthy`；主页返回 HTTP 200；页面不再包含 `Graph RAG`，RAG 项目入口保持正常。
- 回滚与遗留：服务器备份为 `/home/ubuntu/projects/homepage/app/index.html.bak-20260613-graph-label`；无遗留问题；未提交 Git。
- 署名：gpt

## 2026-06-13 13:25 - 轮换个人主页博客管理员口令

- 操作目标：撤销 Git 历史中曾出现的旧博客管理员口令，改用随机生成并仅存于环境变量的凭据。
- 实际操作：使用加密安全随机数生成新 `BLOG_TOKEN`；更新本机私有 `.env` 与服务器 `/home/ubuntu/projects/homepage/.env`；强制重建 `vincent-homepage` 容器以加载新环境变量。首次随机数 API 与旧版 PowerShell 不兼容，立即弃用该结果并完成第二次安全轮换。
- 验证结果：`vincent-homepage` 状态为 `healthy`；HTTPS 编辑器登录返回 HTTP 200、设置 `blog_token` Cookie，且不再显示登录表单；未在日志或命令输出中暴露新口令。
- 回滚与遗留：轮换前服务器环境文件备份为 `/home/ubuntu/projects/homepage/.env.bak-20260613-token-rotation`；旧口令已失效；GitHub 既有公开历史仍需后续历史清理。
- 署名：gpt
