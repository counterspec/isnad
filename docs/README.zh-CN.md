# ISNAD 文档

ISNAD (إسناد) 是一个面向 AI 资源的去中心化信任层。本文档涵盖了关于使用和贡献于该协议所需了解的所有内容。

## 快速链接

- **[什么是 ISNAD？](./what-is-isnad.md)** — 概览与核心概念
- **[审计者指南](./auditors.md)** — 如何质押并赚取收益
- **[质押指南](./staking.md)** — 分步质押说明
- **[陪审团系统](./jury.md)** — 惩罚（Slashing）与申诉机制
- **[API 参考](./api.md)** — REST API 文档
- **[智能合约](./contracts.md)** — 链上架构

## 快速入门

### 检查信任评分

使用 ISNAD 最简单的方法是检查资源的信任评分：

```bash
# 通过 API
curl https://api.isnad.md/api/v1/trust/0x1234...abcd

# 通过网页
访问 https://isnad.md/check
```

### 成为审计者

1. 在 Base 网络获取 $ISNAD 代币
2. 在 https://isnad.md/stake 连接钱包
3. 审查资源的源代码
4. 质押代币以创建证明（Attestation）
5. 在锁定抽后期结束时赚取收益

## 信任层级

| 层级 | 最低质押 | 含义 |
|------|---------------|---------|
| UNVERIFIED (未验证) | 0 | 无证明 |
| COMMUNITY (社区) | 100 $ISNAD | 有一定的社区信任 |
| VERIFIED (已验证) | 1,000 $ISNAD | 多个审计者提供重大质押 |
| TRUSTED (可信) | 10,000 $ISNAD | 经过深入审计，高置信度 |

## 资源

- **网站:** https://isnad.md
- **API:** https://api.isnad.md
- **GitHub:** https://github.com/counterspec/isnad
- **Twitter:** https://x.com/isnad_protocol
