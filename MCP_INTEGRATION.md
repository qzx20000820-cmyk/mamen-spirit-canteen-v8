# MCP实际使用与真实菜单探索器

## 三层独立事实

1. **早期WorkBuddy**：2026-10-11另一个原型使用官方MCP，query-nearby-stores 1成功、query-meals 2成功、query-meal-detail 8次（7成功1错误）、calculate-price 3成功，合计14调用13业务成功。摘要见docs/mcp-evidence-summary.json。这些历史调用不是Codex本地探索器的调用，也不证明专项奖励资格。
2. **H5原创模拟游戏**：31原创餐品、5模拟套餐、37成就、UI及图片保持。历史返回菜单、编码、价格、图片与套餐结构已剥离，浏览器读取独立游戏JSON，不实时调用MCP，也不获取官方售价或配送。
3. **本轮真实模块**：2026-10-22开发者本地运行“麦门真实菜单探索器”，使用官方Server https://mcp.mcd.cn 、Streamable HTTP与Bearer，协议由MCP官方SDK1.32.1处理。2次query-meals业务均成功，第二次完成全部查询和分析，详见docs/MENU_EXPLORER_STATUS.json。

## 真实调用经过（不隐瞒失败）

首轮初始化HTTP200、initialized202、tools/list200、tools/call200，业务成功；分析因分类里只有商品引用而非完整名称，停止为UNSUPPORTED_ITEM_NAME。原响应及Token未保留，未自动重试。

从既有可信历史记录核对结构后，将分类引用与顶层meals索引在内存关联；新增结构回归测试。第二轮重新隐藏输入凭证，沿同一SDK入口追加一次验收：初始化、发现、query-meals、业务校验和分析均完成。两轮可选GET405只表示不提供服务器通知流，是Streamable HTTP允许的结果，不是业务查询失败。

本轮没有query-meal-detail、订单、支付、个人地址工具调用，没有35套餐查询，没有伪造响应或将离线fixture作为成功证据。此前403等诊断是历史状态，已由本轮新证据补充，不抹去旧记录。

## 实际数据流和业务价值

开发者本机隐藏输入自己的Token和本地门店参数 → SDK initialize/initialized → tools/list核验query-meals正式输入结构 → 一次query-meals → 验证真实业务成功 → 仅在内存连接分类引用和商品索引 → 名称保守类别分析、去重、排除未知套餐组成 → 与H5独立食品标签交叉核对 → 输出游戏内组合探索辅助。

分析覆盖汉堡、炸鸡、薯条、冰淇淋、苹果、玉米、水、可乐、咖啡等固定标签，报告缺失和无法识别的类别，不推断套餐内部结构或营养。用户得到“真实菜单类别是否支持某种组合思路”及“在H5原创菜单里可以用哪些餐品试验”的可操作辅助；输出餐品名仅来自H5原创目录，不转载官方商品清单。它不是下单建议或官方推荐，不鼓励现实过量购买。

**真实查询及分析是项目内可复现的开发者本地功能；H5游戏本身仍是独立模拟数据和纯前端。** 两者通过食品类别语义和组合探索价值关联，不共享Token或返回菜单文件。

## 复现与单一入口

```sh
npm ci
npm run explorer:setup
npm run explore:menu
```

按本机提示提供门店编码与隐藏Token；Token不在聊天、命令参数、公开配置或日志出现。去除首尾空白和重复Bearer，拒绝内部空白/控制字符，不静默修剪错误Token。MCD_MCP_STORE_CODE可由本机环境提供；不要提交值。失败立即停止，不自动重新认证、换协议或无限重连。仅query-meals可执行。详见docs/MENU_EXPLORER.md。

官方SDK负责协议，旧手写连接器与诊断入口已私有归档，不维护多个公开实现。早期WorkBuddy验证的端点、传输及认证设置继续使用，不复制其内部代码。麦当劳推荐的Client包含WorkBuddy；本模块采用相同正式协议，不声称麦当劳特别推荐此自建模块。

## 数据、凭证和参赛边界

完整响应只留内存。原商品ID、价格、照片、门店参数、Token、Cookie和个人信息不写入日志或公开仓库。固定类别聚合分析默认仅本机.artifacts保存；公开JSON只含阶段、HTTP状态、调用计数及脱敏证据指纹。H5构建不包含探索器依赖、原始响应或查询报告。接口访问成功不产生菜单或商标的再分发许可。

本轮已补足“本项目确实执行官方只读查询并完成分析”的真实证据，不再只有历史快照或未运行代码。是否作为包含H5及本地辅助模块的整体项目满足比赛的真实使用、创新性与内容要求，仍由主办方审核，不能保证资格或奖励。未上传GitHub、部署H5或提交报名Issue。

依据：https://github.com/M-China/mcd-mcp-server 、https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.x 、https://github.com/M-China/mcd-developer-innovation-challenge/blob/main/activityGuidelines.md 。
