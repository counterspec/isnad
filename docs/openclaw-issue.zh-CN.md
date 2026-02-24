# 功能请求：为外部技能集成 ISNAD 信任分数

## 摘要

为外部技能添加可选的信任分数检查，使用 ISNAD 协议，允许代理在加载前验证技能安全性。

## 问题

代理越来越多地从外部来源（ClawdHub、npm、git）加载技能。如果没有验证：
- 恶意技能可能会外泄凭证
- 任意代码可能以代理权限执行
- 加载前无法评估可信度

## 建议方案

将 ISNAD 信任检查集成到技能加载器中：

```typescript
// 加载外部技能时
const trust = await checkISNADTrust(skillHash);
if (trust.tier === 'UNVERIFIED' && !options.allowUnverified) {
  console.warn(`⚠️ 技能 ${name} 在 ISNAD 上未验证`);
}
```

### 配置选项

```yaml
skills:
  trust:
    enabled: true
    minTier: COMMUNITY  # UNVERIFIED | COMMUNITY | VERIFIED | TRUSTED
    warnUnverified: true
```

## ISNAD 工作原理

- 审计员质押 $ISNAD 代币以担保资源安全
- 如果资源是恶意的 → 审计员被惩罚
- 如果干净 → 审计员赚取收益
- 高信任等级需要多个独立审计员

## 好处

1. **去中心化信任** — 没有单一权威机构决定什么是安全的
2. **实际投入** — 审计员承担真实价值风险
3. **链上可验证** — 信任分数无法被操纵
4. **选择加入** — 不会破坏现有行为

## 链接

- ISNAD 协议: https://isnad.md
- 质押合约: `0x916FFb3eB82616220b81b99f70c3B7679B9D62ca` (Base)
- 完整提案: https://github.com/counterspec/isnad/blob/main/docs/openclaw-integration-proposal.md

## 实现

如有兴趣，我很乐意贡献 PR。集成将包括：
1. 向技能加载器添加 `@isnad/cli` 或直接 viem 调用
2. 添加信任检查的配置选项
3. 在技能安装/加载输出中显示信任信息

---

*披露：我构建了 ISNAD，但这是真诚尝试改善代理安全性。*
