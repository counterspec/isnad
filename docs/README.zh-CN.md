# ISNAD 文档

ISNAD（إسناد）是一个面向 AI 资源的去中心化信任层。本文档覆盖你在使用与贡献协议时需要了解的内容。

## 快速入口

- **[什么是 ISNAD？](./what-is-isnad.md)** — 总览与核心概念
- **[面向审计员](./auditors.md)** — 如何质押并获取收益
- **[质押指南](./staking.md)** — 分步质押说明
- **[陪审团系统](./jury.md)** — 罚没与申诉机制
- **[API 参考](./api.md)** — REST API 文档
- **[智能合约](./contracts.md)** — 链上架构说明

## 快速开始

### 查看信任分数

使用 ISNAD 最简单的方式，就是先查看某个资源的信任分数：

```bash
# 通过 API
curl https://api.isnad.md/api/v1/trust/0x1234...abcd

# 通过网页
访问 https://isnad.md/check
```

### 成为审计员

1. 在 Base 网络获取 $ISNAD 代币
2. 打开 https://isnad.md/stake 并连接钱包
3. 审阅目标资源的代码
4. 质押代币并创建证明（attestation）
5. 锁仓期结束后获得收益

## 信任等级

| 等级 | 最低质押 | 含义 |
|------|----------|------|
| UNVERIFIED | 0 | 尚无证明 |
| COMMUNITY | 100 $ISNAD | 社区已有一定信任 |
| VERIFIED | 1,000 $ISNAD | 多位审计员进行较高额度质押 |
| TRUSTED | 10,000 $ISNAD | 高强度审计，置信度高 |

## 资源

- **官网：** https://isnad.md
- **API：** https://api.isnad.md
- **GitHub：** https://github.com/counterspec/isnad
- **Twitter：** https://x.com/isnad_protocol
