# V8 公开候选版部署步骤

当前版本 8.1.0-rc.1。未公开部署、未创建 GitHub 仓库、未提交参赛 Issue；首次公开操作需作者确认。

## 构建与两个交付项

Node.js 20+ 执行 `npm run build`，输出 dist/。执行 `npm run release`，创建 releases/v8-public-8.1.0-rc.1/：

- github-source.zip / github-source/：白名单源码、必需参赛文件、来源记录及本地提交草稿。
- h5-static.zip / h5-static/：仅可运行静态资源与安全响应头，无 Token、开发工具或私有记录。
- release-manifest.json：文件哈希与审计结果，记录 uploaded:false。

只上传经审计的候选目录，不上传项目根目录或旧候选包。

## Netlify（待确认并登录）

优先选择账号当前提供的免费方案；不购买域名、服务器、额度或付费服务。先确认免费额度及超额设置，不擅自启用付费。

方式一：手动部署，登录后把 h5-static/ 文件夹上传；这是已构建产物，不再运行构建。按平台要求解压 ZIP 后选择目录，确保 index.html 位于目录根部。

方式二：作者确认 GitHub 上传后关联仓库，构建命令 npm run build，发布目录 dist，Node22（netlify.toml）。不配置 MCP Token，不增加后端代理。

[Netlify 官方部署文档](https://docs.netlify.com/deploy/create-deploys/)。

## 公开后的检查与更新

取得真实 HTTPS 链接后，重新测试首页、刷新、全部资源、搜索与分类、已收录套餐、未知套餐提示、购物车、两种游戏结算、成就队列与刷新收藏、报告生成和长按保存。CSP connect-src 仅同源，不依赖本地 Mac 或官方 MCP。

电脑移动视口不代表真实 iPhone/安卓/微信。请用真机验证，尤其报告图片长按或系统分享。不同域名下 localStorage 独立，localhost 存档不会自动迁移，不删除旧存档。

更新时重新构建、测试、审计并运行 release；手动部署替换新静态目录，或在已授权关联的 Git 分支推送后由平台构建。不能直接上传未审核的私有开发目录。
