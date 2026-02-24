# 快速入门

在 2 分钟内检查你的第一个资源的信任分数。

## 1. 通过网页界面

检查信任的最快方式是通过网页应用：

1. 前往 [信任检查器](/check)
2. 粘贴技能 URL、包名或内容哈希
3. 查看信任分数、等级和审计员链条

## 2. 通过 API

以编程方式查询信任分数：

```bash
# 获取资源的信任信息
curl https://api.isnad.md/api/v1/trust/0x1234...abcd

# 响应
{
  "trustScore": "2500000000000000000000",
  "trustTier": "VERIFIED",
  "attestations": [...]
}
```

## 3. 通过智能合约

直接从链上读取信任分数：

```typescript
import { ISNADStaking } from "@isnad/contracts";

const staking = ISNADStaking.attach(STAKING_ADDRESS);
const score = await staking.getTrustScore(resourceHash);
const tier = await staking.getTrustTier(resourceHash);
```

## 计算内容哈希

ISNAD 使用 SHA-256 进行内容哈希。要在本地计算哈希：

```bash
# 使用 OpenSSL
cat skill.md | sha256sum

# 使用 Node.js
const crypto = require("crypto");
const hash = crypto.createHash("sha256")
  .update(content)
  .digest("hex");
```

---

**下一步：** 准备质押并赚取收益？查看 [审计员指南](/docs/auditors)。
