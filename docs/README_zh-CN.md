# ISNAD 文档

ISNAD (إسناد) 是 AI 资源的去中心化信任层。本文档涵盖使用和贡献协议所需的所有信息。

## 快速链接

- **[什么是 ISNAD？](./what-is-isnad_zh-CN.md)** —— 概述和核心概念
- **[审计员指南](./auditors_zh-CN.md)** —— 如何质押并赚取收益
- **[质押指南](./staking_zh-CN.md)** —— 分步质押说明
- **[陪审团系统](./jury_zh-CN.md)** —— 惩罚和申诉流程
- **API 参考](./api_zh-CN.md)** —— REST API 文档
- **[智能合约](./contracts_zh-CN.md)** —— 链上架构

## 快速开始

### 检查信任分数

使用 ISNAD 检查资源信任分数最简单的方式：

```bash
# 通过 API
curl https://api.isnad.md/api/v1/trust/0x1234...abcd

# 通过网页
访问 https://isnad.md/check
```

### 成为审计员

1. 在 Base 网络获取 $ISNAD 代币
2. 在 https://isnad.md/stake 连接钱包
3. 审查资源代码
4. 质押代币创建 attestation 证明
5. 锁仓期结束后赚取收益

## 信任等级

| 等级 | 最低质押 | 含义 |
|------|---------------|---------|
| 未验证 | 0 | 无证明 |
| 社区认证 | 100 $ISNAD | 获得部分社区信任 |
| 已验证 | 1,000 $ISNAD | 多位审计员大额质押 |
| 受信任 | 10,000 $ISNAD | 深度审计，置信度高 |

## 资源

- **官网：** https://isnad.md
- **API：** https://api.isnad.md
- **GitHub：** https://github.com/counterspec/isnad
- **Twitter：** https://x.com/isnad_protocol
