# ISNAD 文档

ISNAD (إسناد) 是 AI 资源的去中心化信任层。本文档涵盖了使用和参与该协议所需了解的所有内容。

## 快速链接

- **[什么是 ISNAD？](./what-is-isnad.zh-CN.md)** — 概述和核心概念
- **[审计员指南](./auditors.zh-CN.md)** — 如何质押并赚取收益
- **[质押指南](./staking.zh-CN.md)** — 分步质押说明
- **[陪审团系统](./jury.zh-CN.md)** — 惩罚和申诉机制
- **[API 参考](./api.zh-CN.md)** — REST API 文档
- **[智能合约](./contracts.zh-CN.md)** — 链上架构

## 入门指南

### 检查信任分数

使用 ISNAD 最简单的方式是检查资源的信任分数：

```bash
# 通过 API
curl https://api.isnad.md/api/v1/trust/0x1234...abcd

# 通过网页
访问 https://isnad.md/check
```

### 成为审计员

1. 在 Base 网络上获取 $ISNAD 代币
2. 在 https://isnad.md/stake 连接钱包
3. 审查资源的代码
4. 质押代币以创建认证
5. 锁定期结束后赚取收益

## 信任等级

| 等级 | 最低质押 | 含义 |
|------|----------|------|
| UNVERIFIED | 0 | 无认证 |
| COMMUNITY | 100 $ISNAD | 有一定社区信任 |
| VERIFIED | 1,000 $ISNAD | 多个审计员进行大量质押 |
| TRUSTED | 10,000 $ISNAD | 经过严格审计，高度可信 |

## 资源

- **网站:** https://isnad.md
- **API:** https://api.isnad.md
- **GitHub:** https://github.com/counterspec/isnad
- **Twitter:** https://x.com/isnad_protocol
