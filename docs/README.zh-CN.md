# ISNAD 文档

[English](README.md) | **中文**

ISNAD（إسناد）是一个面向 AI 资源的去中心化信任层。本文档涵盖了你需要了解的关于使用和贡献该协议的所有内容。

## 快速链接

- **[什么是 ISNAD？](./what-is-isnad.zh-CN.md)** — 概述与核心概念
- **[审计者指南](./auditors.md)** — 如何质押并赚取收益
- **[质押指南](./staking.md)** — 分步质押说明
- **[陪审团系统](./jury.md)** — 罚没与申诉机制
- **[API 参考](./api.md)** — REST API 文档
- **[智能合约](./contracts.md)** — 链上架构

## 快速开始

### 检查信任评分

使用 ISNAD 的最简单方式就是检查资源的信任评分：

```bash
# 通过 API
curl https://api.isnad.md/api/v1/trust/0x1234...abcd

# 通过网页
访问 https://isnad.md/check
```

### 成为审计者

1. 在 Base 网络上获取 $ISNAD 代币
2. 在 https://isnad.md/stake 连接钱包
3. 审查资源的代码
4. 质押代币以创建认证
5. 锁定期结束后赚取收益

## 信任等级

| 等级 | 最低质押量 | 含义 |
|------|-----------|------|
| UNVERIFIED | 0 | 无认证 |
| COMMUNITY | 100 $ISNAD | 有一定社区信任 |
| VERIFIED | 1,000 $ISNAD | 多个审计者进行了大量质押 |
| TRUSTED | 10,000 $ISNAD | 经过大量审计，高可信度 |

## 资源

- **网站：** https://isnad.md
- **API：** https://api.isnad.md
- **GitHub：** https://github.com/counterspec/isnad
- **Twitter：** https://x.com/isnad_protocol
