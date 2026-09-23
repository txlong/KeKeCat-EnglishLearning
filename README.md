# 可可猫 KeKeCat · 儿童英语乐园

面向 5—10 岁儿童的英语学习演示网站。浅奶油背景、棕色文字、青绿色主按钮、柔和粉紫点缀，大圆角、大按钮和清楚的触控反馈；中英文双语标签与鼓励式反馈。

**在线体验**：https://txlong.github.io/KeKeCat-EnglishLearning/

> 演示内容说明：课程、单词与任务数据均为演示示例。学习进度只保存在访问者本机浏览器（localStorage），不收集任何个人信息，无登录、无付费、无后端服务。

## 功能

- **首页 Home**：可可猫吉祥物、词汇进度条、每日打卡、今日任务、四个主题课程入口
- **每日打卡 Check-in**：一键打卡记录当天学习，展示连续打卡天数与最近 7 天记录，打卡成功有彩纸庆祝
- **今日任务 Tasks**：打卡、学单词、完成练习、答对题目四项任务，随真实学习行为自动点亮
- **继续学习 Resume**：首页按钮自动定位到有进度的课程；练习中途退出后，可从上次答到的题目继续（断点续练）
- **课程 Courses / 详情**：动物、颜色、食物、家人四个主题课程；详情页展示单元单词与「继续学习」入口
- **单词练习 Practice**：单词插图、发音（浏览器语音合成，不可用时显示文本发音提示）、看图选词 / 听音选图两种选择题、正确/错误即时反馈，完成后获得星星评价并更新本机进度

## 技术栈

纯静态站点，无构建步骤、无外部依赖：

```
web/
├── index.html          # 页面结构（语义化 HTML，三视图单页应用，hash 路由）
├── styles.css          # 样式与响应式布局（桌面 / 平板 / 手机）
├── app.js              # 演示课程数据、路由、练习逻辑、localStorage 进度
└── assets/
    └── kekecat-mascot.png  # 可可猫吉祥物插画
```

- 视图切换：`#/home`、`#/courses`、`#/course/:id`、`#/practice`、`#/practice/:courseId`
- 可访问性：可见键盘焦点、`aria-live` 答题反馈、带标签的进度条、`prefers-reduced-motion` 支持
- 发音：优先 `speechSynthesis`（en-US，慢速），不可用时展示音标与中文读音提示

## 本地运行

无需安装依赖，任选一种方式在 `web/` 目录启动静态服务器：

```bash
cd web
python3 -m http.server 8080
# 或 npx serve .
```

打开 http://localhost:8080 即可。

## 部署（GitHub Pages）

推送到 `main` 分支后，GitHub Actions（[`.github/workflows/jekyll-gh-pages.yml`](.github/workflows/jekyll-gh-pages.yml)）自动用 Jekyll 构建 `web/` 目录并发布到 GitHub Pages，也可在 Actions 页面手动触发（workflow_dispatch）。

## 许可

见 [LICENSE](LICENSE)。
