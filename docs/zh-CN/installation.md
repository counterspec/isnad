# 安装指南

## 前提条件

- [Node.js](https://nodejs.org/) 18+ 
- npm 或 yarn
- MetaMask 或其他兼容钱包（用于链上交互）
- Base 网络上的 ETH（用于 gas 费用）

## CLI 安装

```bash
# 使用 npm 安装
npm install -g @isnad/cli

# 使用 yarn 安装
yarn global add @isnad/cli
```

## 验证安装

```bash
isnad --version
isnad --help
```

## 环境配置

设置你的私钥用于链上交易：

```bash
# Linux/macOS
export ISNAD_PRIVATE_KEY=0x...

# Windows PowerShell
$env:ISNAD_PRIVATE_KEY = "0x..."
```

⚠️ **安全提示：** 切勿将私钥提交到代码仓库。使用环境变量或密钥管理工具。

## 获取 $ISNAD 代币

1. 在 Base 网络上配置你的钱包
2. 前往 [Uniswap](https://app.uniswap.org/swap?chain=base&outputCurrency=0x73F6d2BBef125b3A5F91Fe23c722f3C321f007E5) 购买 $ISNAD
3. 确保 you have enough ETH for gas（每笔交易约 $0.01）

## 合约地址（Base 主网）

| 合约 | 地址 |
|------|------|
| Token | `0x73F6d2BBef125b3A5F91Fe23c722f3C321f007E5` |
| Registry | `0xb8264f3117b498ddF912EBF641B2301103D80f06` |
| Staking | `0x916FFb3eB82616220b81b99f70c3B7679B9D62ca` |
| Oracle | `0xf02c3A5FED3c460628b5781E3c304Dd8206E85bd` |
| RewardPool | `0x790b0766e9e2db7c59526b247851D16bB493a95B` |

## 网络配置

### MetaMask 添加 Base 网络

1. 打开 MetaMask → 设置 → 网络 → 添加网络
2. 填入以下信息：
   - **网络名称：** Base
   - **RPC URL：** `https://mainnet.base.org`
   - **链 ID：** `8453`
   - **货币符号：** ETH
   - **区块浏览器：** `https://basescan.org`

### 测试网（Base Sepolia）

用于开发和测试：
- **RPC URL：** `https://sepolia.base.org`
- **链 ID：** `84532`
- **浏览器：** `https://sepolia.basescan.org`

## 下一步

- [使用指南](./usage.md) — 学习如何使用 ISNAD
- [API 参考](./api.md) — 集成到你的应用
