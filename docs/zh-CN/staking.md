# 质押指南

分步说明如何质押 $ISNAD token 来认证 AI 资源。

## 前置要求

在开始之前，确保你有：

✅ Base 网络上的 $ISNAD token  
✅ 兼容的 Web3 钱包（MetaMask、Coinbase Wallet、WalletConnect）  
✅ 少量 ETH 用于 gas 费（Base L2 上约 $0.01-0.10）  
✅ 已审查过要认证的资源代码  

## 获取 $ISNAD Token

### 方法 1：通过 DEX 购买

```bash
# 在 Base 网络上
1. 访问 Uniswap/Aerodrome
2. 连接钱包到 Base 网络
3. 交换 ETH → $ISNAD
4. 确认交易
```

**合约地址：**
- Base Mainnet: `0x...` (即将公布)
- Base Sepolia (测试网): `0x...`

### 方法 2：通过桥接

如果你在其他链上有 $ISNAD：

```bash
1. 访问 Base 官方桥 (bridge.base.org)
2. 选择源链和 Base
3. 桥接 $ISNAD token
4. 等待确认（通常 5-10 分钟）
```

## 质押流程

### 步骤 1：连接钱包

访问 https://isnad.md/stake

1. 点击 "Connect Wallet"
2. 选择你的钱包
3. 批准连接请求
4. 确认网络切换到 Base

### 步骤 2：选择资源

**浏览资源：**

```bash
# 通过网页
访问 https://isnad.md/resources

# 或通过 API
curl https://api.isnad.md/api/v1/resources?status=unverified

# 或通过 CLI
isnad list --status unverified
```

**筛选条件：**
- 资源类型（Skill、Config、Prompt 等）
- 当前信任等级
- 发布日期
- 作者

### 步骤 3：审查代码

点击资源查看详情：

```javascript
// 资源信息
{
  "hash": "0x7f3a8b2c...",
  "type": "SKILL",
  "name": "weather-skill",
  "version": "1.2.0",
  "author": "0x1234...5678",
  "inscription": "base:0xabcd...",
  "currentStake": 500,
  "auditorCount": 2,
  "tier": "REVIEWED"
}
```

**获取完整代码：**

```bash
# 下载资源内容
isnad fetch 0x7f3a8b2c...

# 或通过 API
curl https://api.isnad.md/api/v1/resource/0x7f3a8b2c.../content
```

**运行自动扫描：**

```bash
# 使用 ISNAD scanner
npm install -g @isnad/scanner
isnad-scan ./downloaded-resource/

# 输出示例
✅ No critical issues found
⚠️  1 medium risk pattern detected
ℹ️  Review: Environment variable access in line 42
```

### 步骤 4：决定质押参数

**质押数量：**
- 最少：100 $ISNAD
- 推荐：500-1,000 $ISNAD（有意义的收益）
- 最多：10,000 $ISNAD（单个资源上限）

**锁定期：**

| 选项 | APY | 适用场景 |
|------|-----|---------|
| 30 天 | 5% | 简单资源，低风险 |
| 90 天 | 8% | 标准审计，平衡收益 |
| 180 天 | 12% | 深度审计，高信心 |

**计算预期收益：**

```javascript
// 示例计算
质押量: 1,000 $ISNAD
锁定期: 90 天
APY: 8%

预期收益 = 1,000 × 0.08 × (90/365) = 19.73 $ISNAD
年化收益率 = 8%
```

### 步骤 5：批准和质押

**在网页界面：**

1. 输入质押数量
2. 选择锁定期
3. 点击 "Approve $ISNAD"（首次需要）
4. 确认批准交易
5. 点击 "Stake"
6. 确认质押交易
7. 等待确认（约 2 秒）

**通过智能合约：**

```javascript
// 使用 ethers.js
const { ethers } = require('ethers');

// 1. 批准 token
const isnadToken = new ethers.Contract(
  ISNAD_TOKEN_ADDRESS,
  ['function approve(address spender, uint256 amount)'],
  signer
);

await isnadToken.approve(
  STAKING_CONTRACT_ADDRESS,
  ethers.parseEther('1000')
);

// 2. 质押
const staking = new ethers.Contract(
  STAKING_CONTRACT_ADDRESS,
  ['function attest(bytes32 hash, uint256 amount, uint256 lockDays)'],
  signer
);

await staking.attest(
  resourceHash,
  ethers.parseEther('1000'),
  90  // 锁定 90 天
);
```

### 步骤 6：确认质押

交易确认后，你会看到：

```
✅ 质押成功！

资源: weather-skill v1.2.0
质押量: 1,000 $ISNAD
锁定期: 90 天
解锁日期: 2026-05-27
预期收益: 19.73 $ISNAD (8% APY)

你的质押已添加到资源的信任分数中。
```

## 管理质押

### 查看你的质押

```bash
# 通过网页
访问 https://isnad.md/dashboard

# 通过 API
curl https://api.isnad.md/api/v1/auditor/0xYourAddress/stakes

# 通过 CLI
isnad stakes --auditor 0xYourAddress
```

**输出示例：**

```json
{
  "stakes": [
    {
      "resource": "0x7f3a8b2c...",
      "name": "weather-skill",
      "amount": 1000,
      "lockDays": 90,
      "startDate": "2026-02-26",
      "unlockDate": "2026-05-27",
      "status": "active",
      "expectedYield": 19.73
    }
  ],
  "totalStaked": 1000,
  "activeStakes": 1,
  "totalEarned": 0
}
```

### 扩展质押到新版本

当资源更新时：

```javascript
// 审查新版本后，扩展质押
await staking.extendAttestation(
  oldInscriptionHash,  // 你当前质押的版本
  newInscriptionHash   // 新版本
);
```

**注意：**
- 必须先审查新版本代码
- 锁定期从扩展时重新开始
- 可以选择不扩展（保持在旧版本）

### 领取收益

锁定期结束后：

```bash
# 通过网页
1. 访问 https://isnad.md/dashboard
2. 找到已解锁的质押
3. 点击 "Claim Rewards"
4. 确认交易

# 通过合约
await staking.claimRewards(stakeId);
```

**收益计算：**

```
基础收益 = 质押量 × APY × (锁定天数 / 365)
早期奖励 = 基础收益 × 20%（如果是前 5 名审计者）
声誉加成 = 基础收益 × (准确率 - 90%) × 10

总收益 = 基础收益 + 早期奖励 + 声誉加成
```

### 解除质押

锁定期结束后取回本金：

```javascript
await staking.unstake(stakeId);
```

**时间线：**
- 锁定期内：无法解除
- 锁定期结束：可以领取收益 + 解除质押
- 无冷却期：立即到账

## 高级策略

### 分散质押

不要把所有 token 押在一个资源上：

```javascript
// 示例：5,000 $ISNAD 分散到 5 个资源
const strategy = [
  { resource: 'skill-A', amount: 1000, lock: 90 },
  { resource: 'skill-B', amount: 1000, lock: 90 },
  { resource: 'config-C', amount: 1000, lock: 30 },
  { resource: 'prompt-D', amount: 1000, lock: 180 },
  { resource: 'skill-E', amount: 1000, lock: 90 }
];

// 降低单点风险，平衡收益
```

### 阶梯式锁定

创建不同解锁时间的质押：

```javascript
// 每月都有质押解锁
const ladder = [
  { amount: 1000, lock: 30 },   // 3月解锁
  { amount: 1000, lock: 60 },   // 4月解锁
  { amount: 1000, lock: 90 },   // 5月解锁
  { amount: 1000, lock: 120 },  // 6月解锁
];

// 提供流动性，同时保持收益
```

### 专注领域

选择你有专业知识的资源类型：

```javascript
// JavaScript 专家
const focus = {
  types: ['SKILL'],
  languages: ['javascript', 'typescript'],
  frameworks: ['node.js', 'react']
};

// 提高审计准确率，降低风险
```

## 风险管理

### 识别危险信号

❌ **避免质押如果：**
- 代码混淆严重
- 作者匿名且无历史记录
- 依赖项未经审计
- 有动态代码执行
- 访问敏感系统资源
- 社区讨论中有安全担忧

✅ **安全信号：**
- 代码清晰易读
- 作者有良好声誉
- 依赖项都已认证
- 通过自动扫描
- 其他审计者已质押
- 开源且有社区审查

### 使用自动化工具

```bash
# ISNAD scanner（官方）
isnad-scan ./resource/

# 依赖审计
npm audit
yarn audit

# 静态分析
eslint --plugin security
semgrep --config auto

# 沙箱测试
docker run --rm -it --network none \
  node:18 node /path/to/resource.js
```

### 监控和警报

设置通知：

```javascript
// 通过 webhook
await isnad.subscribe({
  auditor: yourAddress,
  events: [
    'resource_flagged',      // 你质押的资源被举报
    'new_version',           // 资源发布新版本
    'jury_selected',         // 你被选为陪审员
    'stake_unlocked'         // 质押解锁
  ],
  webhook: 'https://your-server.com/webhook'
});
```

## 常见问题

**Q: 可以取消质押吗？**  
A: 不可以。锁定期是强制的，这是协议安全性的基础。

**Q: 如果资源被删除怎么办？**  
A: 资源铭刻在链上，无法删除。即使作者账户消失，代码仍然可访问。

**Q: 可以转让质押吗？**  
A: 不可以。质押绑定到你的地址，不可转让。

**Q: 如果我的钱包被盗怎么办？**  
A: 质押在锁定期内无法移动，但解锁后攻击者可以领取。使用硬件钱包保护大额质押。

**Q: 可以部分解除质押吗？**  
A: 不可以。必须全额解除。如果需要灵活性，创建多个小额质押。

**Q: Gas 费用是多少？**  
A: Base L2 上约 $0.01-0.10 每笔交易。批量操作可以节省 gas。

## 下一步

- [审计者指南](./auditors.md) — 深入了解审计流程
- [陪审团系统](./jury.md) — 了解争议解决
- [API 文档](./api.md) — 自动化质押操作
