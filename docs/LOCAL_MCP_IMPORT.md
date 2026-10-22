# 开发者本地真实菜单探索流程

本项目当前唯一公开接入入口为 `npm run explore:menu`，安装：`npm run explorer:setup`。完整操作、隐私和失败处理见 MENU_EXPLORER.md。旧手写客户端和单次诊断脚本已归档到私有备份，不再作为公开命令维护。

官方端点和Streamable HTTP/Bearer设置与早期WorkBuddy相同，实际协议使用MCP官方SDK。Token默认隐藏输入；门店编码只在本机提供，不提交配置。只查询query-meals，使用固定类别汇总及H5原创食品标签完成本地探索，不把真实菜单导入H5。

服务端结果只留内存；原始菜单、编码、价格、图片、凭证和个人信息不写盘。脱敏阶段证据及固定类别分析仅在.artifacts/menu-explorer/runs/，不进入构建或源码包。公开状态仅以MENU_EXPLORER_STATUS.json记录，不包含原始数据。

本地分析不是官方营养/售价/供应建议。未来若需要导入官方字段到游戏，必须单独取得使用依据和授权，不在当前模块范围。
