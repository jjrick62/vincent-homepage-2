# 腾讯云服务器部署文档

> **服务器**: 101.32.68.78 | **系统**: Ubuntu 22.04.5 LTS | **域名**: taffyshine.asia
>
> 最后更新: 2026-06-11

---

## 一、服务器资源

| 资源 | 配置 |
|------|------|
| CPU | AMD EPYC 7K62, 2 vCPU |
| 内存 | 2 GB + 2 GB Swap |
| 磁盘 | 40 GB SSD（已用 ~19G / 49%） |
| 系统 | Ubuntu 22.04.5 LTS ×86_64 |
| 内核 | 5.15.0-179-generic |

---

## 二、端口占用

| 端口 | 协议 | 服务 | 公网 | 说明 |
|------|------|------|------|------|
| **22** | TCP | SSH | ✅ 安全组放行 | 远程管理 |
| **80** | TCP | Nginx 网关 | ✅ 安全组放行 | HTTP→HTTPS 重定向 |
| **443** | TCP | Nginx 网关 | ✅ 安全组放行 | HTTPS, Let's Encrypt |
| **8000** | TCP | 手势版后端 | ❌ 容器内 | FastAPI, 仅容器间通信 |
| **8066** | TCP | 个人主页 | ❌ localhost | Docker, 仅 Nginx 转发 |
| **8080** | TCP | 手势版前端 | ❌ localhost | Docker: Nginx Alpine |
| **8081** | TCP | 普通版前端 | ❌ localhost | Docker: Nginx Alpine |
| **8082** | TCP | RAG QA 服务 | ❌ localhost | systemd: uvicorn |

> 8080/8081/8082/8066 只监听 localhost，通过 Nginx 网关 443 端口对外暴露。

---

## 三、已部署项目

### 架构

```
https://taffyshine.asia:443  (Nginx 网关, SSL)
    │
    ├── /                  →  localhost:8066  →  Docker 容器（个人主页）
    ├── /travel/gesture/   →  localhost:8080  →  Docker 容器（手势版）
    ├── /travel/normal/    →  localhost:8081  →  Docker 容器（普通版）
    ├── /travel/rag/       →  localhost:8082  →  systemd 服务（RAG 前端）
    └── /api/*             →  localhost:8082  →  RAG 后端 API
```

---

### 项目 1: 个人主页 (Vincent·翟伟鑫)

| 项 | 详情 |
|------|------|
| 访问路径 | `/` （根路径） |
| 部署方式 | Docker Compose（1 容器） |
| 容器 | `vincent-homepage` — python:3.12-slim, FastAPI, 8066→8066 |
| 代码位置 | `/home/ubuntu/projects/homepage/` |
| 技术栈 | FastAPI + SQLite, 博客编辑器 |
| 环境变量 | `/home/ubuntu/projects/homepage/.env`（包含 `BLOG_TOKEN`，不写入本文档） |
| 重启策略 | Docker: `restart: unless-stopped` |

```bash
cd /home/ubuntu/projects/homepage
sudo docker compose up -d --build
sudo docker compose ps
```

主页项目卡片当前行为：

- “旅行相册 · 手势版”整张卡片跳转到 `/travel/gesture/`
- “旅行相册 · 普通版”整张卡片跳转到 `/travel/normal/`
- 项目源码入口独立保留，不覆盖卡片的本地项目展示入口

---

### 项目 2: 旅行相册-手势版

| 项 | 详情 |
|------|------|
| 访问路径 | `/travel/gesture/` |
| 部署方式 | Docker Compose（2 容器） |
| 前端容器 | `gesture-frontend-1` — nginx:alpine, 8080→80, 镜像 136MB |
| 后端容器 | `gesture-backend-1` — python:3.12-slim, FastAPI 8000, 镜像 311MB |
| 代码位置 | `/home/ubuntu/projects/gesture/` |
| 技术栈 | Three.js + MediaPipe + FastAPI + SQLite |
| 重启策略 | Docker: `restart: unless-stopped` |

```bash
cd /home/ubuntu/projects/gesture
sudo docker compose up -d --build
```

---

### 项目 3: 旅行相册-普通版

| 项 | 详情 |
|------|------|
| 访问路径 | `/travel/normal/` |
| 部署方式 | Docker Compose（1 容器） |
| 前端容器 | `normal-frontend-1` — nginx:alpine, 8081→80, 镜像 153MB |
| 代码位置 | `/home/ubuntu/projects/normal/` |
| 技术栈 | 纯前端 HTML/CSS/JS + Three.js |
| 重启策略 | Docker: `restart: unless-stopped` |

```bash
cd /home/ubuntu/projects/normal
sudo docker compose up -d --build
```

---

### 项目 4: RAG Enterprise QA

| 项 | 详情 |
|------|------|
| 访问路径 | `/travel/rag/` |
| API 路径 | `/api/health`, `/api/chat/send`, `/api/documents/*` |
| 部署方式 | **systemd 服务** (`rag-qa.service`), 非 Docker |
| 进程 | `/usr/local/bin/uvicorn main:app --host 0.0.0.0 --port 8082` |
| 代码位置 | `/home/ubuntu/projects/rag/` |
| 工作目录 | `/home/ubuntu/projects/rag/backend/` |
| 技术栈 | FastAPI + ChromaDB + BGE Embedding + BM25 + MiMo LLM |
| 模型 | bge-small-zh-v1.5 (184MB) + bge-reranker-v2-m3 (2.2GB) |
| 知识库 | 54 篇 IBM watsonx 技术文档, 857 chunks |
| 重启策略 | systemd: `Restart=always`, 开机自启 |
| 前端版本标记 | `css/mobile-fix.css?v=20260611-2` |

```bash
sudo systemctl status rag-qa
sudo systemctl restart rag-qa
sudo journalctl -u rag-qa -f
```

2026-06-11 已完成移动端适配：

- 缩小移动端顶部导航、品牌区和状态栏
- 调整 QA 输入区域高度，避免遮挡消息内容
- 六阶段 RAG 流程在窄屏保持单行紧凑展示
- SYS 页面、更多菜单及文档鉴权弹窗在 390px 宽度下无横向溢出

---

## 四、服务管理速查

### systemd 服务（全部开机自启）

```bash
sudo systemctl status nginx      # Nginx 网关 — enabled
sudo systemctl status docker     # Docker 引擎 — enabled
sudo systemctl status rag-qa     # RAG QA   — enabled
```

### Docker 容器

```bash
sudo docker ps                    # 运行中的容器
sudo docker stats                 # 实时资源占用
```

### Nginx 网关

配置文件: `/etc/nginx/sites-available/taffyshine`

```nginx
HTTP (80) → 301 重定向到 HTTPS
HTTPS (443) → 反向代理:
  /                  → localhost:8066 (个人主页)
  /travel/gesture/   → localhost:8080 (手势版)
  /travel/normal/    → localhost:8081 (普通版)
  /travel/rag/       → localhost:8082 (RAG)
  /api/*             → localhost:8082 (RAG API, SSE关闭缓冲)
```

重载: `sudo nginx -t && sudo systemctl reload nginx`

### SSL 证书

| 项 | 值 |
|------|------|
| 签发 | acme.sh + Let's Encrypt (DNS 验证) |
| 路径 | `/etc/nginx/ssl/taffyshine.asia/` |
| 有效期 | 90 天, 自动续期 cron: `0 3 * * *` |
| 管理 | `sudo /root/.acme.sh/acme.sh --list` |

---

## 五、连接信息与凭据管理

> 密码、管理员口令和 API Key 不写入 README。
> 本机部署凭据统一存放在 `D:\大学作业文件夹\.env`，服务器项目密钥存放在各项目自己的 `.env` 中。

| 项 | 值 |
|------|------|
| **IP 地址** | `101.32.68.78` |
| **SSH 用户** | `ubuntu` |
| **域名** | `taffyshine.asia` |
| **本机凭据文件** | `D:\大学作业文件夹\.env` |
| **服务器密钥文件** | 各项目目录下的 `.env` |
| **腾讯云安全组** | 已放行 22, 80, 443 |

```bash
ssh ubuntu@101.32.68.78
```

---

## 六、部署变更记录

### 服务器改过的文件

| 文件 | 改动 |
|------|------|
| `rag/backend/requirements.txt` | +`rank-bm25`, `modelscope`, `openai`, `python-dotenv` |
| `normal/docker-compose.yml` | 新建（原项目无 compose 文件，只映射 8081:80） |
| `homepage/.env` | 新建并配置 `BLOG_TOKEN`（具体值不写入文档） |
| `gesture/docker-compose.yml` | 端口 80:80 → 8080:80 |
| `rag/frontend/index.html` | +hero-note 服务器配置说明 |
| `rag/frontend/css/style.css` | +`.hero-note` 样式 |
| `rag/frontend/index.html` | 移动端修复样式版本更新为 `mobile-fix.css?v=20260611-2` |
| `rag/frontend/css/mobile-fix.css` | 增加 760px / 400px 紧凑移动端布局 |
| `homepage/index.html` | 两个旅行相册卡片改为整卡跳转服务器本地项目 |
| `homepage/src/styles.css` | 增加卡片覆盖链接、焦点态和移动端交互样式 |

### 服务器新增文件

| 文件 | 说明 |
|------|------|
| `/etc/nginx/sites-available/taffyshine` | Nginx HTTPS 网关 |
| `/etc/systemd/system/rag-qa.service` | RAG systemd 服务 |
| `/swapfile` | 2GB 交换文件 |
| `/etc/nginx/ssl/taffyshine.asia/` | SSL 证书 |

---

## 七、已知问题 & 待办

- [x] DNS: 已生效 (taffyshine.asia → 101.32.68.78)
- [x] SSL: 已配置 Let's Encrypt (HTTPS 可访问)
- [x] 个人主页: Docker 容器部署并通过 Nginx 对外提供服务
- [x] 两个旅行相册: 主页卡片直接跳转服务器本地展示
- [x] RAG 移动端: QA、SYS、更多菜单和鉴权弹窗完成适配
- [ ] RAG 评估: `ragas` + `datasets` 未安装（依赖 torch/CUDA 太大）
- [ ] RAG Docker 化: 当前跑在宿主机, 可迁回 Docker

---

## 八、线上验证

```bash
curl -I https://taffyshine.asia/
curl -I https://taffyshine.asia/travel/gesture/
curl -I https://taffyshine.asia/travel/normal/
curl -I https://taffyshine.asia/travel/rag/
curl https://taffyshine.asia/api/health
```

当前公开入口：

- 个人主页：https://taffyshine.asia/
- 手势旅行相册：https://taffyshine.asia/travel/gesture/
- 普通旅行相册：https://taffyshine.asia/travel/normal/
- RAG Enterprise QA：https://taffyshine.asia/travel/rag/

---

## 九、服务器操作日志约定

服务器上的任何操作都必须同步记录到服务器主日志：

```text
/home/ubuntu/CLAUDE-OPERATIONS-LOG.txt
```

本地 [`SERVER_OPERATIONS.md`](./SERVER_OPERATIONS.md) 作为便于查阅的同步副本。
需要记录的操作包括但不限于：

- 上传、覆盖、删除或移动服务器文件
- 构建、启动、停止或重启 Docker 容器
- 启停或修改 systemd 服务
- 修改并重载 Nginx
- 修改环境变量、端口、证书、定时任务或权限
- 数据迁移、备份、恢复及线上故障处理
- 仅执行检查命令但可能影响后续判断的运维排查

每条记录必须包含：

1. 操作时间（Asia/Shanghai）
2. 操作目标
3. 实际执行内容
4. 验证方式与结果
5. 是否存在回滚或遗留事项
6. 署名：`gpt`

约定规则：

- 先记录计划，再执行高风险或可能中断服务的操作。
- 操作完成后立即补全验证结果，不允许只记录“已完成”。
- 不在日志中写入密码、Token、API Key 或私钥。
- 即使操作失败，也必须记录失败原因与服务器当前状态。
- 由本助手执行的服务器操作统一署名 `gpt`。
- 不修改其他助手已经写入的历史记录与署名，仅追加自己的记录。
- 服务器日志是主记录，本地日志在完成远程操作后同步更新。
