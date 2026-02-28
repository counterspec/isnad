# 审计员指南

成为 ISNAD 审计员，验证 AI 代理技能并赚取质押奖励。

## 什么是审计员？

审计员是 ISNAD 的信任支柱。他们：
- 审查代理技能的安全漏洞
- 质押 ISNAD 代币来支持他们的认证
- 为准确的评估赚取奖励
- 虚假认证面临质押削减风险

## 要求

1. **最低质押：** 100 ISNAD 代币
2. **技术能力：** 能够审查代码中的安全问题
3. **钱包：** Base 兼容钱包（MetaMask、Rainbow 等）

## 入门

### 1. 质押代币

首先，质押 ISNAD 以激活你的审计员状态：

```typescript
// 授权并质押
await isnadToken.approve(stakingAddress, amount);
await stakingContract.stake(amount);
```

### 2. 查找待审查技能

浏览未验证的技能：
- [ISNAD 仪表板](/check) - 查看待处理技能
- [ClawHub](https://clawhub.com) - 代理技能市场
- 技能作者直接提交

### 3. 审查与认证

审查技能代码后：

```typescript
// 正面认证（技能安全）
await stakingContract.attest(skillHash, true);

// 负面认证（技能恶意）
await stakingContract.attest(skillHash, false);
```

### 4. 赚取奖励

- **每次认证：** 质押的 0.1%
- **月度池：** 顶级审计员分享协议费用
- **治理：** ISNAD 投票奖励

## 审查清单

审查技能时，检查：

- [ ] 凭证收集（环境变量、配置文件）
- [ ] 代码外泄（base64、外部获取）
- [ ] 未经授权的网络调用
- [ ] 子进程生成
- [ ] 文件系统访问模式
- [ ] 混淆或压缩代码

**提示：** 使用 `isnad-scan` CLI 进行自动检测：

```bash
pip install isnad-scan
isnad-scan /path/to/skill
```

## 削减机制

虚假认证将导致质押削减：

| 违规 | 惩罚 |
|------|------|
| 首次误报 | 10% 质押 |
| 首次漏报 | 25% 质押 |
| 重复违规 | 50% 质押 |
| 恶意合谋 | 100% 质押 |

争议由 [陪审团](/docs/jury) 解决。
