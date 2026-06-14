# 扫描器 CLI 使用指南

本文档提供 ISNAD 扫描器命令行工具的中文说明。扫描器相关代码位于 scanner/ 目录。

## 目录位置

scanner/ 目录通常包含 README.md、package.json、src/ 和 tsconfig.json。

## 安装依赖

进入 scanner/ 目录后运行 npm install。若项目 lockfile 已固定依赖，可以运行 npm ci。

## 查看可用命令

扫描器的实际命令以 scanner/package.json 中的 scripts 字段为准。

## 构建扫描器

如果项目提供构建脚本，可以运行 npm run build。

## 运行扫描器

如果项目提供启动脚本，可以运行 npm run start 或 npm run dev。具体命令以当前 package.json 为准。

## 开发与调试

常见源码文件包括 src/index.ts、src/cli.ts、src/analyzer.ts、src/patterns.ts、src/service.ts 和 src/oracle.ts。

## 测试与验证

本次中文文档提交不修改扫描器代码。建议维护者在合并前确认文档链接正确，并在项目支持时运行构建或测试命令。
