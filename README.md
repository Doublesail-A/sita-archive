# 汐塔档案 · Cetus Archive

<https://cetus.wiki> 的源代码。非官方汐塔资料与创作整理站，基于 Astro 4 构建并由 Vercel 部署。

## 架构

- `src/pages/`：页面与路由
- `src/content/`：Markdown 内容库
- `src/layouts/`：列表页、文章页公共布局
- `src/components/`：导航、页脚与内容组件
- `src/styles/global.css`：全站设计系统与响应式样式
- `src/img/`：由 Astro 处理和优化的图片
- `public/images/`：按原路径直接发布的图片

本站是纯静态站点：内容会在构建时变成 HTML，不需要数据库或后台服务。向 `main` 分支推送后，Vercel 会按现有项目设置自动构建。

## 本地运行

```bash
pnpm install
pnpm dev
```

发布前检查：

```bash
pnpm build
```

## 新增航报

在 `src/content/news/` 新建 Markdown 文件。文件名建议使用 `YYYY-MM-DD-short-title.md`：

```md
---
title: 标题
pubDate: 2026-07-11
description: 首页和列表页显示的一句话摘要。
source: https://官方原始链接
tags: [公告, important]
cover: /images/news/2026-07-11-example.jpg
---

正文内容。
```

- `important` 会把内容标记为重点记录；
- 配图放在 `public/images/news/`，`cover` 使用以 `/images/` 开头的站内路径；
- 日期和活动规则必须以官方原始动态为准；不确定的信息请明确标注为推测。

## 新增世界观词条

在 `src/content/wiki/` 新建 Markdown 文件：

```md
---
title: 词条名
pubDate: 2026-07-11
description: 一句话定义。
tags: [设备, wiki]
---

词条正文。
```

Wiki 索引会自动收录，并支持标题和简介搜索。

## 新增同人作品

在 `src/content/doujin/` 新建 Markdown 文件：

```md
---
title: 作品名
pubDate: 2026-07-11
description: 简介
tags: [doujin, 小说]
cover: /images/doujin/example.jpg
---

作者：署名

正文内容。
```

转载作品前请取得作者许可，并在正文中保留作者、原始发布链接与授权说明。

## 新增影像

在 `src/content/movies/` 新建 Markdown 文件：

```md
---
title: 影像标题
pubDate: 2026-07-11
description: 简介
tags: [movies, official]
cover: /images/movies/example.jpg
link: https://www.bilibili.com/video/BVxxxxxxxxx/
---
```

影像日期应填写官方首发日期，不要填写本站收录日期。

## 推荐维护流程

1. 先保存官方原始链接和发布日期；
2. 将图片压缩到适合网页的尺寸，避免直接上传超大原图；
3. 新建或修改 Markdown；
4. 执行 `pnpm build`；
5. 提交到新分支，通过 Vercel 预览检查桌面端和手机端；
6. 合并到 `main` 发布生产站点。

纠错与投稿：<xwd2020@outlook.com>
