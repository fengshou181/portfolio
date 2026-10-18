# portfolio

丰年的个人作品集网站，托管于 Cloudflare Pages，push 到 `main` 自动部署。

- 线上地址：https://zfengnian.top （备用：https://fengnian-portfolio.pages.dev）
- 技术栈：HTML + CSS + 原生 JS + Chart.js 4.x，纯静态无构建
- 页面数：12 个 HTML 页面（首页/关于/经历/项目/看板/能力/联系 + 文章/动态/友链/留言/日志）

## 本地预览

```bash
cd website
python -m http.server 8000
# 打开 http://localhost:8000
```

## 部署流程

1. 修改文件后 `git add . && git commit -m "更新" && git push`
2. Cloudflare Pages Git 集成自动构建部署；无需额外的 GitHub Actions 部署工作流
3. CDN 缓存可能导致更新延迟，必要时在 Cloudflare 控制台手动清缓存

## 电商数据看板

`ecommerce-dashboard.html` 的数据来自外置 `dashboard-data.js`（由主项目 `scripts/16_refresh_dashboard_data.py` 查询 Apache Doris 生成）。更新看板数据：在主项目重跑刷新脚本 → 将生成的 `dashboard-data.js` 一并 commit + push。

## 详细文档

网站结构与实现细节见 [TRAE_CN_项目说明.md](TRAE_CN_项目说明.md)。
