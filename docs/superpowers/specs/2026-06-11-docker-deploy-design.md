# Docker 部署包设计

## 目标

在 `docker-deploy/` 中生成一个可以单独复制到服务器的完整部署包。部署者只需设置博客密钥并运行 Docker Compose。

## 结构

- 单个 FastAPI 容器同时提供主页、博客阅读页、博客编辑器和 API。
- 应用监听容器内 `0.0.0.0:8066`，宿主机默认映射到 `8066`。
- SQLite 数据库存放在 `/data/blog.db`，通过 `./data:/data` 持久化。
- `BLOG_TOKEN` 必须从部署环境传入，不在镜像内写入真实密钥。
- Compose 使用公开文章 API 作为健康检查目标。

## 部署体验

1. 复制整个 `docker-deploy/` 目录到服务器。
2. 将 `.env.example` 复制为 `.env`，修改 `BLOG_TOKEN`。
3. 执行 `docker compose up -d --build`。
4. 访问 `http://服务器地址:8066/`，编辑器地址为 `/editor`。

