# ISNAD 实施计划

*技术架构和启动序列*

*草稿 v0.1 — 2026年1月31日*

---

## 概述

本文档涵盖 $ISNAD 的实际实施 — 智能合约、基础设施、启动序列和代理集成。

白皮书定义了**什么**。本文档定义了**如何**。

---

## 设计原则

### 代理原生

协议必须在无需人工干预的情况下运行：

1. **代理可以成为审计员** — 质押、审查、担保
2. **代理可以在陪审团服务** — 裁决争议
3. **代理可以投票** — 治理参与
4. **代理可以赚取** — 收益、费用、赏金
5. **代理可以运行扫描器** — 检测基础设施

**没有任何组件应该需要人工干预才能正常运行。**

### 最小信任

- 智能合约即法律（代码是最终的）
- 引导阶段后没有管理员密钥
- 升级需要治理投票 + 时间锁
- 紧急暂停是临时的，自动解除

### 简单优先

以最小可行合约启动：
1. 代币 (ERC20)
2. 质押注册表
3. 基础检测预言机

仅在证明必要时添加复杂性。

---

## 智能合约架构

### 合约 1: $ISNAD 代币

**标准:** 带扩展的 ERC20

```solidity
// 核心 ERC20
- transfer, approve, balanceOf, 等.

// 扩展
- permit (无 gas 批准)
- snapshot (用于治理)
- mint (由协议控制，通胀上限)
- burn (用于惩罚)
```

**部署:** Base 主网

**初始供应量:** 1,000,000,000 $ISNAD

**铸币权限:** 
- 引导期：多签 (3/5)
- 引导后：仅治理合约
- 上限：每年最多 3% 通胀

### 合约 2: 质押注册表

**用途:** 跟踪审计员在技能上的质押

```solidity
struct Stake {
    address auditor;
    bytes32 skillHash;      // keccak256(skill_url + version)
    uint256 amount;
    uint256 lockUntil;
    uint256 lockDuration;   // 用于收益计算
    bool slashed;
}

// 核心函数
stake(skillHash, amount, lockDuration)
unstake(stakeId)                        // 如果锁定则回滚
slash(stakeId, severity, evidence)      // 仅检测预言机
claimYield(stakeId)

// 视图函数
getSkillTrust(skillHash) → totalStaked, auditorCount, tier
getAuditorStakes(auditor) → Stake[]
getAuditorReputation(auditor) → accuracy, totalAudits, burns
```

**访问控制:**
- 任何人都可以质押/解除质押（无需许可）
- 只有检测预言机可以惩罚
- 收益领取检查奖励池

### 合约 3: 奖励池

**用途:** 向质押者分配收益

```solidity
// 流入
receiveSlashedTokens(amount)    // 来自质押注册表
receiveInflation(amount)        // 来自代币铸币

// 流出  
claimYield(staker, stakeId)     // 由质押注册表调用
payJuror(juror, amount)         // 由陪审团合约调用

// 参数（治理控制）
baseYieldRate[lockDuration]     // 30d=5%, 90d=8%, 180d=12%
inflationRate                   // 当前比率，最大 3%
```

### 合约 4: 检测预言机

**用途:** 链下检测和链上惩罚之间的接口

```solidity
struct Flag {
    bytes32 skillHash;
    address flagger;
    uint256 deposit;
    bytes32 evidenceHash;       // IPFS/Arweave 哈希
    FlagStatus status;          // PENDING, CONFIRMED, REJECTED
    uint256 timestamp;
}

// 标记提交
submitFlag(skillHash, evidenceHash)     // 需要押金
 
// 陪审团裁决（由陪审团合约调用）
resolveFlag(flagId, verdict, jurorSignatures)

// 自动检测（扫描器节点）
submitAutomatedFlag(skillHash, evidenceHash, scannerSignature)
```

**扫描器节点:**
- 任何人都可以运行扫描器
- 注册扫描器可以提交自动标记
- 如果标记被确认则支付赏金

### 合约 5: 陪审团选择 (v2)

**用途:** 为争议标记随机选择陪审团

```solidity
// 陪审团组建
requestJury(flagId) → juryId
    // 使用 VRF 获取随机性
    // 选择 7 名合格审计员
    // 合格 = 声誉 > 90%, 在被标记技能上无质押

// 陪审团投票
submitVote(juryId, vote, signature)     // MALICIOUS, CLEAN, ABSTAIN
    // 投票在揭示阶段前加密

// 裁决
finalizeVerdict(juryId)
    // 需要 5/7 绝对多数
    // 触发惩罚或标记拒绝
    // 支付陪审员
```

**注意:** 陪审团合约是第二阶段。初始启动使用更简单的预言机模型。

---

## 链下基础设施

### 1. 扫描器网络

**用途:** 自动恶意软件检测

**架构:**
```
扫描器节点
├── 从注册表获取新技能 (ClawHub, 等.)
├── 运行检测套件:
│   ├── YARA 规则
│   ├── 静态分析 (AST)
│   ├── 依赖审计 (CVE 数据库)
│   └── 沙盒执行 (蜜罐)
├── 如果可疑 → 向检测预言机提交标记
└── 如果标记被确认则赚取赏金
```

**去中心化:**
- 任何人都可以运行扫描器
- 多个扫描器 = 冗余
- 分歧 → 陪审团决定

**初始启动:** 核心团队运行主扫描器。在第二阶段去中心化。

### 2. 注册表 API

**用途:** 查询信任分数、技能元数据

**端点:**
```
GET /skills/{hash}
    → 信任分数、等级、审计员、依赖项

GET /skills/{hash}/audits
    → 带质押金额的审计列表

GET /auditors/{address}
    → 声誉、活跃质押、历史

POST /skills/check
    → 批量信任分数查询

WebSocket /subscribe
    → 被标记技能的实时更新
```

**托管:** 最初中心化 API。通过 The Graph 或类似方式去中心化。

### 3. 依赖监控器

**用途:** 跟踪 CVE 和受损包

**架构:**
```
监控服务
├── 订阅 CVE 源 (NVD, GitHub Advisory)
├── 维护包 → 技能映射
├── 新 CVE 时:
│   ├── 识别受影响的技能
│   ├── 触发隔离（通过预言机）
│   └── 通知审计员
└── 持续运行
```

---

## 代理集成

### 代理如何参与

**1. 代理作为审计员**

```python
# 代理工作流
def audit_skill(skill_url, version):
    # 1. 获取和分析技能
    code = fetch_skill(skill_url, version)
    analysis = run_security_analysis(code)
    
    # 2. 决定是否质押
    if analysis.is_safe and analysis.confidence > 0.95:
        # 3. 质押代币
        skill_hash = keccak256(skill_url + version)
        staking_contract.stake(skill_hash, amount=500, lock_days=90)
        
        # 4. 记录在记忆中
        save_audit_record(skill_url, version, analysis)
```

**2. 代理作为陪审员**

```python
# 陪审团服务
def serve_on_jury(flag_id):
    # 1. 获取证据
    evidence = fetch_from_ipfs(flag.evidence_hash)
    skill_code = fetch_skill(flag.skill_hash)
    
    # 2. 分析
    analysis = run_security_analysis(skill_code)
    matches_evidence = compare_with_evidence(analysis, evidence)
    
    # 3. 投票
    if matches_evidence and analysis.is_malicious:
        vote = M