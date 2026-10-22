# 素材与数据来源｜8.1.0-rc.1

- data/menu.json、data/meals.json、data/catalog-design.json及目录契约：本轮独立设计的31餐品、9分类和5套游戏配置；MIT范围，无官方内部ID、原价格和原套餐结构，不是历史快照换名或加密。
- assets/photography/：11张内置image_gen原创生成食品摄影，原图提示词、无参考输入记录、哈希及转换记录见 docs/photo-generation-records.json；本轮文件字节未变，未生成新图。适用 licenses/FOOD-PHOTOGRAPHY.md。[OpenAI输出条款](https://openai.com/policies/terms-of-use/)为用户与平台间权利依据，不保证独占版权或全部第三方权利。
- 内嵌图标和favicon：项目自编SVG，代码许可MIT；不使用官方包装/Logo，不引入图库食品图。
- 字体：系统字体栈，不分发字体。
- Playwright/playwright-core：锁定1.62.1开发依赖，Apache-2.0及NOTICE见licenses/PLAYWRIGHT-*；不把node_modules或浏览器二进制放入源码/H5。fsevents可选开发依赖MIT见licenses/FSEVENTS-MIT.txt。
- CONTEST_DECLARATION.md：官方要求原样使用的声明模板，哈希已比对，不作为原创素材或资格通过证明。
- mcp-config.example.json：官方文档允许的非商业连接示例，仅环境变量占位；不因此取得返回数据或商标许可。

历史原图、真实菜单快照、原内部编码及其映射、原价格、原套餐结构、旧契约、私有证据与备份全部排除公开包。历史调用脱敏时间、结果及工具名不含菜单返回数据。保留麦门及金拱门等游戏语境并不代表已获商标授权，具体争议及赛事接受度见 MENU_USAGE_RISKS 与参赛检查。

开发者本地探索器依赖官方MCP SDK1.32.1与Zod，完整锁定版本、上游来源和声明许可证见tools/menu-explorer/THIRD_PARTY.json，SDK许可证同目录SDK-LICENSE.txt。依赖只供本地查询，不进入H5；不分发node_modules或真实菜单响应。
