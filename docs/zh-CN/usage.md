# 使用指南

ISNAD 是一个去中心化的信任层，用于验证 AI 资源（技能、配置、提示词等）的安全性。

## 快速开始

### 1. 计算资源哈希

```bash
# 对技能文件计算哈希
isnad hash -f ./my-skill/SKILL.md
# 输出: 0x7f3a8b2c...
```

### 2. 查询信任评分

```bash
# 通过 CLI
isnad check 0x7f3a8b2c...

# 通过 API
curl https://api.isnad.md/v1/score/0x7f3a8b2c...
```

### 3. 查看协议状态

```bash
# CLI
isnad stats

# API
curl https://api.isnad.md/v1/stats
```

## 核心概念

### 信任评分（Trust Score）

资源的总加权质押量。质押越高 = 经济背书越强 = 信任度越高。

### 信任等级（Trust Tier）

基于信任评分的分类：

| 等级 | 最低质押 | 含义 |
|------|----------|------|
| UNVERIFIED | 0 | 无认证 |
| COMMUNITY | 100 $ISNAD | 社区初步信任 |
| VERIFIED | 1,000 $ISNAD | 多位审计者，质押可观 |
| TRUSTED | 10,000 $ISNAD | 充分审计，高置信度 |

### 认证（Attestation）

审计者质押代币时创建的记录，包含：
- 质押金额
- 锁定期
- 资源哈希
- 审计者地址

### 惩罚（Slashing）

如果资源被发现是恶意的：
1. 任何人可以举报（需 100 $ISNAD 押金）
2. 随机选出 5 位审计者组成陪审团
3. 陪审团投票（需 67% 绝对多数）
4. 判定有罪：该资源上所有质押被销毁
5. 举报者收回押金 + 获得奖励

## 审计者操作

### 质押代币

```bash
# 质押 100 ISNAD，锁定 90 天
isnad stake 0x7f3a8b2c... 100 --lock 90
```

### 锁定期与乘数

| 锁定时长 | 乘数 | 适用场景 |
|----------|------|----------|
| 7 天 | 1.0x | 测试、短期 |
| 30 天 | 1.0x | 标准认证 |
| 60 天 | 1.25x | 更高收益，更有信心 |
| 90 天 | 1.5x | 长期，最大收益 |

### 质押限制

| 限制项 | 值 |
|--------|-----|
| 最低质押 | 10 $ISNAD |
| 单次最高质押 | 10,000 $ISNAD |
| 单个审计者总额度 | 100,000 $ISNAD |
| 集中度上限 | 单个审计者不超过资源总质押的 33% |

## 资源审查最佳实践

在质押前，务必彻底审查资源：

### 🚩 危险信号
- 未授权的网络请求
- 凭据访问或数据泄露
- 混淆或压缩的代码
- 异常的文件系统访问
- 提权命令执行
- 可疑的依赖项

### ✅ 验证清单
- 元数据与实际行为一致
- 声明的权限准确
- 版本历史清晰
- 作者信誉良好

## 编程集成

### JavaScript/TypeScript

```typescript
import { ISNADClient } from '@isnad/sdk';

const client = new ISNADClient({ network: 'mainnet' });

// 查询信任评分
const score = await client.getScore('0x7f3a8b2c...');
console.log(score.trustTier); // "VERIFIED"

// 查询协议统计
const stats = await client.getStats();
console.log(stats.totalResources); // 156
```

### Python

```python
from isnad import Client

client = Client(network="mainnet")
score = client.get_score("0x7f3a8b2c...")
print(score.trust_tier)  # "VERIFIED"
```

### 直接 API 调用

```bash
# 查询信任评分
curl "https://api.isnad.md/v1/score/0x7f3a8b2c..."

# 查询资源详情
curl "https://api.isnad.md/v1/resource/0x7f3a8b2c..."

# 查询审计者信息
curl "https://api.isnad.md/v1/auditor/0xABC123..."

# 查看排行榜
curl "https://api.isnad.md/v1/leaderboard?type=resources&limit=10"
```

## 协议架构

```
┌─────────────────────────────────────────────────────────────┐
│                      ISNAD 协议                              │
├──────────────┬──────────────┬──────────────┬───────────────┤
│  ISNADToken  │ ISNADRegistry│ ISNADStaking │  ISNADOracle  │
│  (ERC20 +    │  (铭刻       │  (质押 +     │  (举报 +      │
│   投票)      │   + 元数据)  │   认证)      │   陪审团)     │
├──────────────┴──────────────┴──────────────┴───────────────┤
│  ISNADRewardPool        │        ISNADGovernor             │
│  (收益分配)             │        (DAO + 时间锁)            │
└─────────────────────────┴──────────────────────────────────┘
```

## 常见问题

### 交易失败？
- 确认有足够的 ETH 支付 gas
- 确认代币授权额度足够
- 尝试提高 gas limit

### 质押未显示？
- 等待交易确认
- 刷新页面
- 检查认证列表

### 无法解除质押？
- 确认锁定期已结束
- 检查资源是否被惩罚
- 确认连接了正确的钱包

## 下一步

- [API 参考](./api.md) — 完整 API 文档
- [白皮书](../../WHITEPAPER.md) — 协议详细规范
