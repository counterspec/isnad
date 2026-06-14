# 快速开始

本指南帮助中文用户快速浏览 ISNAD 项目并开始使用核心文档和扫描器。

## 1. 克隆仓库

运行 git clone，然后进入 isnad 目录。

## 2. 阅读核心文档

建议先阅读 README.md、docs/README.md、docs/what-is-isnad.md、docs/how-to-attest.md 和 scanner/README.md。

中文文档入口位于 docs/zh-CN/README.md。

## 3. 查看扫描器目录

扫描器代码位于 scanner/。进入该目录后，可以查看 package.json 了解可用命令。

## 4. 安装依赖

在 scanner/ 目录中运行 npm install。若需要严格按照 lockfile 安装，可以运行 npm ci。

## 5. 运行与验证

实际命令以 scanner/package.json 中的 scripts 字段为准。常见流程包括构建、启动和测试。

## 注意事项

本次提交仅新增中文文档，不修改合约、扫描器逻辑或生产代码。
