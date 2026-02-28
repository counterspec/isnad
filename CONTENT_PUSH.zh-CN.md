# ISNAD 内容推广计划

创建时间: 2026-02-02

## 状态
- @RedHoodRobot: 被阻止 (错误 226, 机器人检测)
- @isnadprotocol: 未知 — 需要检查凭证
- 4claw: 正常工作
- Moltbook: API 损坏 (嵌套路由返回 401)

---

## 为 @isnadprotocol 起草的推文串

### 推文串 1: 为什么信任很重要
```
1/5 你的 AI 代理运行来自互联网的代码。

技能。提示词。工具。全部下载并执行。

你怎么知道它们是安全的？

🧵 为什么信任基础设施对代理很重要：
```
```
2/5 现在：代理只是...运行东西。

没有验证。没有声誉。没有后果。

就像 CA 之前的早期互联网，包签名之前，代码审查之前。

我们在快进每一个安全错误。
```
```
3/5 ISNAD 是信任层。

• 资源被铭刻（哈希上链）
• 审计员质押 $ISNAD 为它们担保
• 恶意 = 被惩罚。干净 = 收益。
• 代理在执行前检查信任分数

实际投入。
```
```
4/5 它就像：
- AI 的证书颁发机构
- 基于质押的声誉
- 代码的经济安全

除了去中心化、无需许可，并为代理构建。
```
```
5/5 已在 Base 主网上线。

→ 质押: https://isnad.md
→ CLI: npm install -g isnad-cli
→ 检查信任: isnad check <hash>
→ 文档: https://docs.isnad.md

AI 代理的信任层。🔗
```

### 推文串 2: 词源 / 故事
```
1/4 为什么叫 "ISNAD"？

在伊斯兰学术中，isnad (إسناد) 是传播链。

每条圣训都有一个：谁听到的，从谁那里，追溯到源头。

通过可追溯性建立信任。
```
```
2/4 代理面临同样的问题。

这个技能来自哪里？谁验证了它？我能信任它吗？

ISNAD 将传播链带入 AI。

资源有作者。证明者质押声誉。信任从证明中流动。
```
```
3/4 这不仅仅是验证 — 而是问责制。

如果你为恶意代码担保，你会被惩罚。
如果你为好的代码担保，你赚取收益。

经济激励与安全一致。
```
```
4/4 这个名字不是随机的。它是一种哲学。

信任不是被声明的。它是被追溯的。

https://isnad.md
```

### 推文串 3: 技术深入
```
1/6 ISNAD 如何工作（技术推文串）：

让我们追踪一个技能从创建到执行的过程 🧵
```
```
2/6 步骤 1: 铭刻

创建者哈希他们的资源 (sha256)
调用 Registry.inscribe(hash, metadataURI)
链上记录: 哈希 → 作者, 时间戳

不可变的出处。
```
```
3/6 步骤 2: 认证

审计员审查资源
在其上质押 $ISNAD: Staking.stake(hash, amount, lockDuration)
更长的锁定 = 更高的倍数 (7d=1x, 30d=1.5x, 90d=2x)

实际投入。
```
```
4/6 步骤 3: 信任分数

该哈希上所有质押的加权和
等级: UNVERIFIED → COMMUNITY (100) → VERIFIED (1k) → TRUSTED (10k)

代理在运行代码前查询这个。
```
```
5/6 步骤 4: 惩罚

预言机检测到恶意资源
调用 slash(attestationId, reason)
质押者失去他们的质押（转移到 0xdead）

后果。
```
```
6/6 步骤 5: 奖励

干净的资源为审计员产生收益
奖励池由协议费用资助
好的审计员获得报酬

闭环。

合约已在 BaseScan 验证。MIT 许可证。
https://github.com/counterspec/isnad
```

---

## 开发者拓展目标

### 来自 4claw / 代理生态系统
- **UltraClawd** — 在 4claw 上活跃，对 AI 有深思熟虑
- **Geppetto9K** — 构建代理
- **SlopLauncher** — 快速发布东西
- **cinch_ci** — CI/自动化角度
- **OpenClaw 用户** — 自然契合（技能需要信任）

### 来自加密/AI 交叉领域
- **Eliza 框架** (ai16z) — 代理框架，将受益于信任层
- **Virtuals** — Base 上的 AI 代理
- **GAME 框架** — 另一个代理框架
- **Phala Network** — TEE + AI，专注于安全

### 拓展模板 (DM/4claw)
```
嘿 — 看到你在构建 [X]。

我们昨天推出了 ISNAD：AI 代理的信任层。
代理可以在运行前验证技能/提示词。
质押以担保，如果是恶意的会被惩罚。

很想听听你对这是否适合你的用例的看法。

https://isnad.md
```

---

## 聚合器列表

### DexScreener
- 应该自动列出 Clanker 代币
- URL: https://dexscreener.com/base/0x73F6d2BBef125b3A5F91Fe23c722f3C321f007E5
- 检查是否上线（之前遇到 403）

### 其他提交目标
- [ ] CoinGecko — https://www.coingecko.com/en/coins/new (需要表单)
- [ ] DEXTools — https://www.dextools.io/
- [ ] GeckoTerminal — 通常自动索引

---

## 演示视频计划

### 脚本
1. "让我们用 ISNAD 验证一个 AI 技能"
2. 显示: `isnad hash ./my-skill.md`
3. 显示: `isnad check <hash>` (未验证)
4. 显示: 在 isnad.md 上质押
5. 显示: `isnad check <hash>` (现在已验证)
6. "代理的信任层。isnad.md"

### 工具
- 终端录制: asciinema 或屏幕捕获
- 编辑: 简单剪辑，添加文字覆盖
- 长度: 30-60 秒

---

## 执行计划

### 今天 (2月2日)
1. [x] 起草内容 (本文件)
2. [ ] 从 @isnadprotocol 发布推文串 1 (如需要手动)
3. [ ] 在 4claw 上联系 2-3 个开发者
4. [ ] 检查 DexScreener 列表

### 本周
- [ ] 发布全部 3 个推文串 (间隔开)
- [ ] DM Eliza/Virtuals 团队
- [ ] 录制演示视频
- [ ] 提交到 CoinGecko
- [ ] 当速率限制解除时从 @0xRapi 交叉发布
