# ISNAD Scanner

ISNAD 信任协议的检测预言机（Detection Oracle）。用于扫描 AI 资源（skills、prompts、配置文件）中的恶意模式，并将风险标记提交到链上预言机。

## 安装

```bash
cd scanner
npm install
npm run build
```

## 使用方法

### 扫描单个文件

```bash
# 基础扫描
npm run scan -- scan ./path/to/skill.js

# JSON 输出
npm run scan -- scan ./path/to/skill.js --json

# 指定自定义资源哈希
npm run scan -- scan ./path/to/skill.js --hash 0x123...
```

### 扫描多个文件

```bash
# 扫描目录下所有 JS 文件
npm run scan -- batch "./skills/**/*.js"

# 遇到首个高风险结果即快速失败
npm run scan -- batch "./skills/**/*.js" --fail-fast
```

### 生成证据

```bash
npm run scan -- evidence ./malicious-skill.js
```

### 提交风险标记到预言机

```bash
# Dry run（仅分析不提交）
npm run scan -- flag ./malicious-skill.js --dry-run

# 提交到测试网
npm run scan -- flag ./malicious-skill.js --network testnet

# 提交到主网
npm run scan -- flag ./malicious-skill.js --network mainnet
```

### 以服务模式运行

```bash
# 设置环境变量
export ISNAD_PRIVATE_KEY=0x...
export ISNAD_AUTO_FLAG=false  # 设为 true 则自动提交标记

# 启动服务
npm start
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `ISNAD_PRIVATE_KEY` | 用于提交标记的私钥 | 必填 |
| `ISNAD_REGISTRY_ADDRESS` | Registry 合约地址 | Sepolia 默认值 |
| `ISNAD_ORACLE_ADDRESS` | Oracle 合约地址 | Sepolia 默认值 |
| `ISNAD_NETWORK` | `testnet` 或 `mainnet` | `testnet` |
| `ISNAD_AUTO_FLAG` | 是否自动提交风险标记 | `false` |
| `ISNAD_MIN_CONFIDENCE` | 自动提交的最小置信度阈值 | `0.7` |

## 检测模式

Scanner 可检测以下风险：

### Critical（严重）
- 动态代码执行（`eval`、`Function`）
- Shell 命令执行（`exec`、`spawn`）
- `child_process` 导入
- `vm` 模块使用
- 钥匙串/凭证存储访问
- 系统目录写入

### High（高）
- 数据外传（webhook、base64 发送）
- 敏感文件读取（`.env`、`.ssh`、凭证）
- 原始 socket 访问
- 基于 DNS 的外传
- 安全绕过尝试
- 加密货币挖矿

### Medium（中）
- 环境变量访问
- 递归目录读取
- Home 目录访问
- 混淆代码模式

### Low（低）
- Unicode 转义序列
- 轻度可疑模式

## API

```typescript
import { analyzeContent, formatResult } from '@isnad/scanner';

const result = analyzeContent(code, resourceHash);
console.log(formatResult(result));

// 结果包含：
// - riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'clean'
// - riskScore: number
// - confidence: 0-1
// - findings: 详细模式匹配信息
```

## 合约地址

### Base Sepolia（测试网）
- Registry: `0x8340783A495BB4E5f2DF28eD3D3ABcD254aA1C93`
- Oracle: `0x4f1968413640bA2087Db65d4c37912d7CD598982`

### Base Mainnet（主网）
- 即将发布

## 许可证

MIT
