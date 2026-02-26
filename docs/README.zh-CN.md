# ISNAD 文档

ISNAD（إسناد）是面向 AI 资源的去中心化信任层。本文档覆盖使用协议与参与贡献所需的核心信息。

## 快速入口

- **[什么是 ISNAD？](./what-is-isnad.md)** — 核心概念与整体介绍
- **[给审计者](./auditors.md)** — 如何质押并获得收益
- **[质押指南](./staking.md)** — 分步骤质押流程
- **[陪审团机制](./jury.md)** — 惩罚（slashing）与申诉机制
- **[API 参考](./api.md)** — REST API 文档
- **[智能合约](./contracts.md)** — 链上架构说明

## 快速开始

### 查询信任评分

最简单的使用方式是先查询资源的信任分：

```bash
# 通过 API
curl https://api.isnad.md/api/v1/trust/0x1234...abcd

# 通过网页
访问 https://isnad.md/check
```

### 成为审计者

1. 在 Base 网络准备 `$ISNAD` 代币
2. 在 https://isnad.md/stake 连接钱包
3. 审核目标资源的代码
4. 质押代币并创建证明（attestation）
5. 锁定期结束后获得收益

## 信任等级

| 等级 | 最低质押 | 含义 |
|------|---------|------|
| UNVERIFIED | 0 | 暂无证明 |
| COMMUNITY | 100 $ISNAD | 已获得部分社区信任 |
| VERIFIED | 1,000 $ISNAD | 多位审计者参与且质押量较高 |
| TRUSTED | 10,000 $ISNAD | 经过大量审计，高置信度 |

## 资源链接

- **官网：** https://isnad.md
- **API：** https://api.isnad.md
- **GitHub：** https://github.com/counterspec/isnad
- **X / Twitter：** https://x.com/isnad_protocol
