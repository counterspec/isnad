# OpenClaw ISNAD 集成提案

## 摘要

为通过 OpenClaw 加载的外部技能添加可选的信任分数检查，使用 Base 上的 ISNAD 协议。

## 动机

代理越来越多地从外部来源（ClawdHub、npm、git）加载技能。如果没有验证，恶意技能可能会：
- 外泄凭证
- 执行任意命令
- 操纵代理行为

ISNAD 提供了一个去中心化的信任层，审计员质押代币以担保资源安全。将 ISNAD 集成到 OpenClaw 中可以让代理在加载不受信任的技能之前自动检查信任分数。

## 拟议变更

### 1. 向技能加载器添加 ISNAD 信任检查

```typescript
// skills/loader.ts
import { checkISNADTrust } from './isnad';

async function loadSkill(skillPath: string, options: SkillOptions) {
  // 计算内容哈希
  const content = await fs.readFile(path.join(skillPath, 'SKILL.md'));
  const hash = keccak256(content);
  
  // 检查 ISNAD 信任分数
  const trust = await checkISNADTrust(hash);
  
  if (trust.tier === 'UNVERIFIED' && !options.allowUnverified) {
    throw new SkillTrustError(`Skill ${skillPath} 在 ISNAD 上未验证`);
  }
  
  if (trust.tier === 'COMMUNITY' && options.requireVerified) {
    console.warn(`⚠️ Skill ${skillPath} 的 ISNAD 信任度较低 (${trust.score})`);
  }
  
  // 继续加载...
}
```

### 2. 添加配置选项

```yaml
# openclaw.yaml
skills:
  trust:
    enabled: true
    minTier: COMMUNITY  # UNVERIFIED | COMMUNITY | VERIFIED | TRUSTED
    warnUnverified: true
    blockUnverified: false
```

### 3. 添加 ISNAD 检查工具

```typescript
// skills/isnad.ts
const ISNAD_STAKING = '0x916FFb3eB82616220b81b99f70c3B7679B9D62ca';

export async function checkISNADTrust(contentHash: string): Promise<TrustInfo> {
  const client = createPublicClient({ chain: base, transport: http() });
  
  const [score, tier] = await Promise.all([
    client.readContract({
      address: ISNAD_STAKING,
      abi: STAKING_ABI,
      functionName: 'getTrustScore',
      args: [contentHash],
    }),
    client.readContract({
      address: ISNAD_STAKING,
      abi: STAKING_ABI,
      functionName: 'getTrustTier',
      args: [contentHash],
    }),
  ]);
  
  return {
    hash: contentHash,
    score: formatUnits(score, 18),
    tier: ['UNVERIFIED', 'COMMUNITY', 'VERIFIED', 'TRUSTED'][tier],
  };
}
```

## 用户体验

```
$ openclaw skill install weather-skill

⚠️ 信任检查: weather-skill
   ISNAD 分数: 5,000 ISNAD (COMMUNITY 等级)
   审计员: 2
   
   此技能有一定社区支持但未完全验证。
   使用 --allow-unverified 运行以继续安装。
```

## 向后兼容性

- 信任检查通过配置选择加入
- 默认行为不变
- 已加载的技能不受影响

## 安全考虑

- ISNAD 分数在链上且防篡改
- 审计员有实际投入（可能被惩罚）
- 高等级需要多个独立审计员

## 链接

- ISNAD 协议: https://isnad.md
- 合约: Base 主网
- 质押: `0x916FFb3eB82616220b81b99f70c3B7679B9D62ca`

---

*这是一个讨论提案。如有兴趣，我很乐意实现。*
