# ISNAD 文档

ISNAD (إسناد) 是 AI 资源的去中心化信任层。本文档涵盖使用和参与协议所需了解的一切。

## 快速链接

- **[什么是 ISNAD？](./what-is-isnad.md)** — 概览和核心概念
- **[审计员指南](./auditors.md)** — 如何质押和赚取收益
- **[质押指南](./staking.md)** — 分步质押说明
- **[陪审团系统](./jury.md)** — 削减和申诉如何运作
- **[API 参考](./api.md)** — REST API 文档
- **[智能合约](./contracts.md)** — 链上架构

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
4. 质押代币创建背书
5. 锁定期结束时赚取收益

## 信任等级

| 等级 | 最低质押 | 含义 |
|------|----------|------|
| 未验证 | 0 | 无背书 |
| 社区 | 100 $ISNAD | 有一定社区信任 |
| 已验证 | 1,000 $ISNAD | 多个审计员大量质押 |
| 可信 | 10,000 $ISNAD | 大量审计，高度信任 |

## 资源

- **网站:** https://isnad.md
- **API:** https://api.isnad.md
- **GitHub:** https://github.com/counterspec/isnad
- **Twitter:** https://x.com/isnad_protocol
