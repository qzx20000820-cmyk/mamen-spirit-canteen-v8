# 麦门精神食堂｜V8独立模拟菜单版

面向手机浏览器的点餐主题隐藏成就游戏：搜索食品、选择自定义套餐、调整购物车、模拟结算，探索37个成就与C/B/A/S/SR/SSR六档收藏，生成精神消费鉴定报告。版本8.1.0-rc.1，2026-10-22。独立创作，非麦当劳官方产品，无真实扣款、配送、登录或个人信息上传。

## 安装与运行

Node20+：
```sh
npm ci
npm run build
npm run preview
```
打开 http://127.0.0.1:8030/ 。HOST=0.0.0.0时可同Wi-Fi访问本机端口。静态dist可独立托管，不依赖Mac接口或Token；不要发布整个工作目录。

## 使用示例与数据

搜索薯条并加购，再自由组合、增减、清空或选择套餐换配；前往收藏查看发现进度，完成游戏结算并生成报告。未解锁名称和条件在界面隐藏。

31个餐品、9分类和5个套餐由游戏独立制作；ID、模拟金额、份数、差价和选项不来自MCP快照，不对应官方在售菜单。11张原创生成食品摄影保留，无适合照片的餐品按文字展示；套餐照片只示意主食。无原始官方照片、Logo、原商品编码或原套餐数据。

localStorage键保持mamen.codex.v1。37成就ID、等级和主要规则不变；旧收藏和时间戳继续保留。旧目录升级时，原存档先在本机保留一份pre-independent副本，本轮购物车及与旧商品绑定的本轮进度重置，历史收藏、地址、订单和累计档案不删除。不同域名和浏览器之间不会自动迁移。报告提供PNG和长按保存回退；未作真机保证。

## 验证
```sh
npx playwright install chromium webkit
npm test
npm run test:public
npm run audit
npm run release
```
浏览器测试可用MAMEN_TEST_URL、MAMEN_CHROME_PATH、MAMEN_PLAYWRIGHT_MODULE和MAMEN_TEST_OUTPUT指定环境。见 docs/TEST_REPORT.md 。自动化移动视口不等于真实iPhone/安卓/微信验收。

## MCP与参赛限制

早期WorkBuddy原型真实查询曾支持数据准备；当前公开版已移除全部返回菜单数据，玩家端没有运行时MCP调用。整改时V8新增成功调用为0；随后新增的开发者本地真实菜单探索器单独执行官方查询和分析，最新真实结果见docs/MENU_EXPLORER_STATUS.json。H5端仍不实时调用MCP，独立模拟数据不冒充官方结果。参赛资格及审核结果仍由主办方核验；报名Issue已创建，不代表审核通过。见 MCP_INTEGRATION.md、workbuddy.md 和 docs/CONTEST_READINESS.md。

## 许可与发布

独立代码、游戏数据和原创文字采用MIT；AI摄影另见 licenses/FOOD-PHOTOGRAPHY.md 与生成记录，不宣称排他版权或真人实拍。系统字体不打包文件，开发依赖许可及NOTICE已保留。商标和第三方权利不纳入项目许可；非官方说明不等于品牌授权。详见 ASSET_SOURCES.md、docs/PUBLICATION_PREFLIGHT.md 与 docs/remediation-diff.csv。

源码已公开至 https://github.com/qzx20000820-cmyk/mamen-spirit-canteen-v8 。作者确认参赛报名Issue #1060已创建；不代表主办方已审核通过。H5正在准备Netlify静态部署，尚无已核验的公网试玩地址；确定后补充真实链接。

## 开发者本地真实菜单探索器

```sh
npm run explorer:setup
npm run explore:menu
```

官方SDK负责Streamable HTTP协议；本机隐藏输入Token和本地门店参数，一次query-meals后输出固定食品类别覆盖和H5原创组合探索辅助。失败立即停止。原始响应、官方商品/价格/图片和认证信息不保存或公开；H5不导入真实菜单。详见[运行与数据边界](docs/MENU_EXPLORER.md)及[本次真实状态](docs/MENU_EXPLORER_STATUS.json)。协议与分析离线测试：`npm run test:mcp`，须先安装探索器依赖。
