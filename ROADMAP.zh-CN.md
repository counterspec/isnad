# ISNAD 协议路线图

> 用于跟踪协议开发、安全改进和计划升级的动态文档。

---

## 当前部署 (Base 主网)

| 合约 | 地址 | 版本 | 状态 |
|------|------|------|------|
| 代币 | `0x73F6d2BBef125b3A5F91Fe23c722f3C321f007E5` | V1 | ✅ 最终版 |
| 注册表 | `0xb8264f3117b498ddF912EBF641B2301103D80f06` | V1 | ⚠️ 已弃用 |
| 注册表 | `0x7EA99470e22E5149F97FbDeB5807AEF54Deafc01` | V2 | ✅ 活跃 |
| 质押 | `0x916FFb3eB82616220b81b99f70c3B7679B9D62ca` | V1 | ✅ 活跃 |
| 预言机 | `0xf02c3A5FED3c460628b5781E3c304Dd8206E85bd` | V1 | ⚠️ 需要 V2 (见下文) |
| 奖励池 | `0x790b0766e9e2db7c59526b247851D16bB493a95B` | V1 | ✅ 活跃 |
| 时间锁 | `0x3Ef44fb908C86865A9315277f9AFc6b65A87e702` | V1 | ✅ 活跃 |
| 治理者 | `0xB230Ffa9CA40F705756BC12698119f1B45687cd6` | V1 | ✅ 活跃 |

---

## 立即: 注册表 V2 部署

**优先级:** 关键  
**状态:** 代码就绪，等待部署  
**脚本:** `contracts/scripts/deploy-registry-v2.ts`

### 修复: 区块超时 griefing 向量
- **问题:** 分片铭刻没有超时。攻击者可以通过启动区块 0 且永不完成来永远阻止任意内容哈希。
- **解决方案:** 添加 `CHUNK_TIMEOUT` (24小时) 和 `cleanupAbandonedChunk()` 函数
- **迁移:** 
  - 部署 V2
  - 更新索引器以监视 V1 + V2
  - 前端对新铭刻使用 V2
  - V1 数据保留在事件中 (不可变)

### 部署清单
- [x] 将 Registry V2 部署到 Base 主网 — `0x7EA99470e22E5149F97FbDeB5807AEF54Deafc01`
- [x] 在 BaseScan 上验证 — https://basescan.org/address/0x7EA99470e22E5149F97FbDeB5807AEF54Deafc01#code
- [x] 更新 API 配置 (`api/src/chain/networks.ts`)
- [x] 更新网站配置 (`web/src/lib/contracts.ts`)
- [ ] 重建并重新部署 API 到 Railway
- [ ] 宣布迁移

---

## 短期: 预言机 V2

**优先级:** 高  
**状态:** 代码就绪，部署被 VRF 集成阻塞  
**目标:** 在检测系统中有大量 TVL 之前

### 包含的修复

#### 1. 弱 PRNG → 提交-揭示 (代码中已完成)
- **问题:** 陪审团选择使用 `blockhash(block.number - 1)` — 验证者可预测
- **解决方案:** 提交-揭示模式，5 个区块延迟
- **代码:** `ISNADOracle.sol` 已更新 `commitBlock` 字段和 `COMMIT_BLOCKS` 常量

#### 2. transfer() → call() (代码中已完成)  
- **问题:** `transfer()` 仅转发 2300 gas — 合约接收者会失败
- **解决方案:** 替换为 `call()` + 现有重入保护
- **修复位置:** 3 处 (executeSlash, _finalizeVerdict x2)

#### 3. executeSlash 访问权限 (已记录)
- **决定:** 为协议活性故意设置为无需许可
- **添加:** `nonReentrant` 修饰符，NatSpec 文档

### 阻塞于: Chainlink VRF 集成
提交-揭示模式是权宜之计。对于生产级随机性：

```
TODO: Chainlink VRF 集成
- [ ] 添加 VRF 消费者合约
- [ ] 为 LINK 订阅充值
- [ ] 用 VRF 回调替换提交-揭示
- [ ] 先在 Sepolia 上测试
```

### 预言机 V2 部署清单
- [ ] 集成 Chainlink VRF (或 MVP 保持提交-揭示)
- [ ] 部署 Oracle V2
- [ ] 更新质押合约引用 (如需要)
- [ ] 迁移活跃标记 (如有) 或等待干净状态
- [ ] 更新 API/索引器

---

## 中期改进

### 质押优化
**文件:** `ISNADStakingV3.sol`

1. **无界数组迭代**
   - `getTrustScore()` 循环所有认证 — 规模扩大时的 DoS 风险
   - 修复: 维护运行总计或分页
   - 优先级: 中 (当前规模不紧急)

2. **过期认证清理**
   - 解除质押的认证保留在数组中 (amount=0)
   - 修复: 交换并弹出移除
   - 优先级: 低 (gas 优化)

3. **销毁的类型化接口**
   - 使用原始 `call()` 而非类型化接口
   - 修复: `ISNADToken(token).burnFrom(...)`
   - 优先级: 低 (工作但脆弱)

### 去中心化
1. **减少管理员密钥权力**
   - 将更多功能移至时间锁后
   - 考虑为紧急功能使用多签

2. **陪审员池扩展**
   - 当前由管理员管理
   - 未来: 带质押要求的无需许可陪审员注册

---

## 安全审计历史

### 2026-02-02: Trail of Bits 技能分析
**执行者:** Rapi (使用 ToB 审计技能)

| 发现 | 严重性 | 状态 |
|------|--------|------|
| 区块超时 griefing | 关键 | ✅ 已修复 (V2) |
| 弱 PRNG 陪审团选择 | 高 | ✅ 已修复 (V2 代码) |
| transfer() gas 限制 | 高 | ✅ 已修复 (V2 代码) |
| executeSlash 无需许可 | 高 | ✅ 已记录 |
| 无界数组迭代 | 中 | 📋 待办 |
| 过期认证数组 | 低 | 📋 待办 |
| 销毁的原始调用 | 低 | 📋 待办 |

### 优点 (无需更改)
- ✅ 所有状态改变函数都有 ReentrancyGuard
- ✅ 代币转账使用 SafeERC20
- ✅ 细粒度基于角色的访问控制
- ✅ AutoUnpausable 紧急制动 (最长 7 天)
- ✅ 鲸鱼上限防止质押集中
- ✅ 锁定期防止闪电贷攻击
- ✅ 构造函数上的零地址检查
- ✅ Solidity 0.8+ 溢出保护

---

## 未来考虑

### 协议升级
- **代理模式:** 考虑用于未来合约以启用升级
- **钻石模式:** 用于复杂多面升级

### 扩展
- **L2 部署:** 已在 Base 上，考虑其他 L2
- **跨链:** 将信任分数桥接到其他链

### 代币经济学
- **费用分配:** LP 费用目前到部署者钱包
- **质押奖励:** RewardPool 已充值但分配待定
- **治理:** Governor 活跃但需要提案模板

---

## 快速参考

```bash
# 部署 Registry V2
cd contracts && npx hardhat run scripts/deploy-registry-v2.ts --network base

# 运行安全检查
npx hardhat test
slither .

# 验证合约
npx hardhat verify --network base <地址>
```

---

*最后更新: 2026-02-02 由 Rapi*