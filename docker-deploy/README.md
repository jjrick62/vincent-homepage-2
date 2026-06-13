# Docker 部署

这个目录可以单独复制到服务器。

## 启动

```bash
cp .env.example .env
```

编辑 `.env`，将 `BLOG_TOKEN` 改成自己的强密码，然后运行：

```bash
docker compose up -d --build
```

访问：

- 主页：`http://服务器地址:8066/`
- 博客编辑器：`http://服务器地址:8066/editor`

## 常用命令

```bash
docker compose ps
docker compose logs -f
docker compose restart
docker compose down
```

博客数据保存在 `data/blog.db`。更新网站时保留 `data/` 目录即可。
