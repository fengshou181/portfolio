# 个人作品集网站 - 项目说明文档（给TRAE CN AI看）

> 本文档用于帮助 TRAE CN 中的 AI 助手快速理解这个个人作品集网站的结构、技术栈和修改方式。

---

## 📋 项目概览

| 属性 | 值 |
|------|-----|
| **项目名称** | 丰年作品集 (Portfolio) |
| **类型** | 纯静态个人作品集网站 |
| **技术栈** | HTML + CSS + 原生JavaScript（无框架） |
| **页面数量** | 11个HTML页面 |
| **所有者** | 郑年丰（丰年） |
| **职业** | 数据工程师 / DATA ENGINEER |

---

## 📁 文件结构

```
portfolio/
├── index.html          # 首页（Hero + 概览 + 精选）
├── about.html          # 关于我（个人介绍）
├── skills.html         # 技能/能力展示
├── experience.html     # 工作经历
├── projects.html       # 项目作品
├── articles.html       # 文章/博客
├── moments.html        # 动态/说说
├── friends.html        # 友情链接
├── guestbook.html      # 留言板
├── contact.html        # 联系方式
├── changelog.html      # 更新日志
├── style.css           # 全局样式（单文件，包含所有页面样式）
├── common.js           # 通用脚本（导航、主题切换、加载动画等）
├── images/             # 图片资源目录
│   ├── hero_oguri.jpeg         # 首页Hero背景主图
│   ├── hero-bg-new.jpeg        # 首页Hero背景图
│   ├── about-bg.jpeg           # 关于页背景图
│   ├── oguri_cap_2_opt.jpg     # 头像/头像装饰
│   ├── oguri_tamamo_1.jpg      # 角色图1
│   ├── oguri_tamamo_2.jpg      # 角色图2
│   ├── oguri_tamamo_4k.jpg     # 4K角色图
│   ├── tw_44.jpg               # 作品图
│   ├── tw_44_opt.jpg           # 作品图（优化版）
│   ├── m28.jpg                 # 角色图
│   ├── m88.jpg                 # 角色图
│   └── 128641800_p0.jpg        # 其他图片
└── README.md           # 简单说明
```

---

## 🎨 设计风格

### 主题色

使用 CSS 变量定义，位于 `style.css` 的 `:root` 中：

```css
:root {
  --bg: #f4f1f7;           /* 主背景：淡紫色 */
  --bg-card: #ffffff;      /* 卡片背景：白色 */
  --accent: #7c5ca8;       /* 主强调色：紫色 */
  --accent-soft: #b89ed0;  /* 柔和紫 */
  --accent-pink: #e0a8c8;  /* 粉色点缀 */
  --text: #2a2535;         /* 主文字色：深紫灰 */
  --text-dim: #6b6580;     /* 次级文字 */
}
```

**风格关键词**：淡紫色调、日系动漫风、玻璃拟态导航栏、渐变文字、暗色/亮色多主题切换

### 字体

- 标题：`Space Grotesk`（Google Fonts）
- 正文：`Inter`（Google Fonts）
- 代码：`JetBrains Mono`（Google Fonts）
- 衬线中文：`Songti SC / SimSun`

---

## 🔧 公共组件（每页都有）

### 1. 加载动画 (Loader)

```html
<div class="loader" id="loader">
  <div class="loader-logo">FN</div>
  <div class="loader-bar"></div>
</div>
```

- 显示 "FN" logo 和进度条
- 页面加载完成后自动隐藏
- 由 `common.js` 控制

### 2. 导航栏 (Navbar)

```html
<nav class="navbar" id="navbar">
  <div class="nav-inner">
    <!-- Logo区 -->
    <a href="index.html" class="nav-logo">
      <div class="nav-logo-mark">FN</div>
      <div class="nav-logo-text">
        <span class="name">丰年</span>
        <span class="role">DATA ENGINEER</span>
      </div>
    </a>
    <!-- 导航链接 -->
    <div class="nav-links" id="navLinks">
      <a href="index.html" class="active">首页</a>
      <a href="about.html">关于</a>
      <a href="experience.html">经历</a>
      <a href="projects.html">项目</a>
      <a href="skills.html">能力</a>
      <a href="contact.html">联系</a>
    </div>
    <!-- 右侧：菜单按钮 + 主题切换 + CTA -->
    <div class="nav-right">
      <button class="nav-menu-toggle" id="menuToggle">...</button>
      <button class="theme-toggle" id="themeToggle">...</button>
      <a href="contact.html" class="nav-cta">联系我</a>
    </div>
  </div>
</nav>
```

**特性**：
- 固定顶部，毛玻璃效果
- 滚动时背景变化
- 移动端汉堡菜单
- 多主题切换按钮

### 3. 页脚 (Footer)

每个页面底部都有页脚，包含版权信息和社交链接。

### 4. 主题切换

`common.js` 中实现了多主题切换，点击右上角按钮可循环切换：
- 默认紫色主题 (purple)
- 金色主题 (gold)
- 蓝色主题 (blue)
- 粉色主题 (pink)
- 暗色主题 (dark)

---

## 📄 各页面说明

### 1. index.html - 首页

**特点**：有Hero区域（`body.has-hero`）

**主要区块**：
- Loader 加载动画
- Navbar 导航栏
- Hero 首屏（背景图 + Canvas粒子动画 + 个人介绍 + 头像）
- 精选内容区（能力/项目/经历摘要卡片）
- Footer 页脚

**修改要点**：
- Hero标题：`.hero-title` 下的 `.line`
- 自我介绍：`.hero-subtitle`
- 头像图：`.hero-right img` 或 `.hero-avatar`
- 背景图：`.hero-bg-img`（CSS中设置）

### 2. about.html - 关于我

**主要内容**：个人介绍、基本信息、兴趣爱好

**常见修改**：
- 个人简介文本
- 头像图片
- 个人信息卡片

### 3. skills.html - 技能/能力

**主要内容**：技能栈展示，可能用进度条或卡片形式

**常见修改**：
- 添加/删除技能项
- 修改技能熟练度
- 技能分类（前端/后端/数据等）

### 4. experience.html - 工作经历

**主要内容**：时间线形式的工作经历

**常见修改**：
- 添加新的工作经历
- 更新在职时间
- 修改职责描述

### 5. projects.html - 项目作品

**主要内容**：项目卡片网格，展示个人项目

**常见修改**：
- 添加新项目卡片
- 更新项目描述
- 替换项目截图

### 6. articles.html - 文章

**主要内容**：博客文章列表

### 7. moments.html - 动态

**主要内容**：类似朋友圈/说说的短动态

### 8. friends.html - 友链

**主要内容**：友情链接列表

### 9. guestbook.html - 留言板

**主要内容**：访客留言（静态展示，无后端）

### 10. contact.html - 联系方式

**主要内容**：邮箱、微信、GitHub等联系方式

### 11. changelog.html - 更新日志

**主要内容**：网站版本更新记录

---

## 🛠 常见修改指南

### 修改个人信息（姓名、职位）

1. **导航栏Logo**：找到 `.nav-logo-text .name` 和 `.role`
2. **页面标题**：修改 `<title>` 标签
3. **首页Hero**：修改 `.hero-title` 和 `.hero-cn-name`

### 修改主题色

编辑 `style.css` 中 `:root` 的 CSS 变量：
```css
--accent: #7c5ca8;  /* 改这个颜色即可 */
```

### 添加新的导航链接

在每个页面的 `.nav-links` 中添加：
```html
<a href="newpage.html">新页面</a>
```

### 添加新页面

1. 复制一个现有页面（如 `about.html`）作为模板
2. 修改 `<title>` 和页面内容
3. 在所有页面的导航栏中添加链接
4. 在 `style.css` 中添加新页面需要的样式（如果有）

### 替换图片

- 将新图片放入 `images/` 目录
- 修改HTML中对应的 `src` 属性
- 或修改CSS中的 `background-image`

### 更新工作经历

编辑 `experience.html`，复制一条现有的经历项，修改内容即可。

### 更新项目

编辑 `projects.html`，复制一张项目卡片，修改标题、描述、图片和链接。

---

## ⚡ 功能特性

| 功能 | 实现方式 | 位置 |
|------|----------|------|
| 加载动画 | CSS + JS | common.js |
| 导航栏滚动效果 | CSS + JS | common.js |
| 移动端菜单 | CSS + JS | common.js |
| 主题切换 | JS修改CSS变量 | common.js |
| Canvas粒子效果 | Canvas API | index.html内联脚本 |
| 响应式布局 | CSS Media Query | style.css |
| 平滑滚动 | CSS | style.css |

---

## 🚀 本地预览方式

### 方法1：直接打开
双击 `index.html` 用浏览器打开（简单但可能有跨域限制）

### 方法2：Python HTTP服务器（推荐）
```bash
cd portfolio
python -m http.server 8000
```
然后访问 `http://localhost:8000`

### 方法3：VS Code Live Server
安装 Live Server 插件，右键 index.html → Open with Live Server

---

## 📝 注意事项

1. **纯静态站点**：没有后端，所有内容都是硬编码在HTML中的
2. **单CSS文件**：所有页面共用一个 `style.css`，修改时注意影响范围
3. **单JS文件**：所有页面共用一个 `common.js`
4. **Google Fonts**：依赖外部字体，离线环境字体会降级
5. **无构建工具**：不需要 npm/webpack 等，直接改HTML/CSS/JS即可
6. **日系动漫风格**：大量使用动漫角色图，图片版权需注意

---

## 🔍 快速定位表

| 想改什么 | 改哪个文件 | 搜什么关键词 |
|----------|-----------|-------------|
| 导航栏链接 | 所有HTML | `nav-links` |
| 首页大标题 | index.html | `hero-title` |
| 主题颜色 | style.css | `--accent` |
| 技能列表 | skills.html | 搜"技能"或"skill" |
| 工作经历 | experience.html | 搜公司名或"经历" |
| 项目展示 | projects.html | 搜项目名或"项目" |
| 联系方式 | contact.html | 搜"联系"或邮箱 |
| 加载动画Logo | 所有HTML | `loader-logo` |
| 页脚版权 | 所有HTML | `footer` |

---

*本文档由 TRAE Work 自动生成，用于辅助AI理解项目结构*
