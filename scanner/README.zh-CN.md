# ISNAD Scanner

ISNAD 信任协议的检测预言机。扫描 AI 资源（技能、提示词、配置）中的恶意模式，并将标记提交到链上预言机。

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

# 输出为 JSON 格式
npm run scan -- scan ./path/to/skill.js --json

# 使用自定义资源哈希
npm run scan -- scan ./path/to/skill.js --hash 0x123...
```

### 扫描多个文件

```bash
# 扫描目录中的所有 JS 文件
npm run scan -- batch "./skills/**/*.js"

# 遇到第一个高风险发现时快速失败
npm run scan -- batch "./skills/**/*.js" --fail-fast
```

### 生成证据

```bash
npm run scan -- evidence ./malicious-skill.js
```

### 向预言机提交标记

```bash
# 试运行（分析但不提交）
npm run scan -- flag ./malicious-skill.js --dry-run

# 提交到测试网
npm run scan -- flag ./malicious-skill.js --network testnet

# 提交到主网
npm run scan -- flag ./malicious-skill.js --network mainnet
```

### 作为服务运行

```bash
# 设置环境变量
export ISNAD_PRIVATE_KEY=0x...
export ISNAD_AUTO_FLAG=false  # 设置为 true 启用自动标记

# 启动服务
npm start
```

## 环境变量

| 变量 | 描述 | 默认值 |
|----------|-------------|---------|
| `ISNAD_PRIVATE_KEY` | 用于提交标记的私钥 | 必需 |
| `ISNAD_REGISTRY_ADDRESS` | 注册表合约地址 | Sepolia 默认值 |
| `ISNAD_ORACLE_ADDRESS` | 预言机合约地址 | Sepolia 默认值 |
| `ISNAD_NETWORK` | `testnet` 或 `mainnet` | `testnet` |
| `ISNAD_AUTO_FLAG` | 自动提交标记 | `false` |
| `ISNAD_MIN_CONFIDENCE` | 自动标记的最低置信度 | `0.7` |

## 检测模式

扫描器可检测：

### 严重 (Critical)
- 动态代码执行（`eval`、`Function`）
- Shell 命令执行（`exec`、`spawn`）
- 子进程导入
- VM 模块使用
- 钥匙串/凭证存储访问
- 系统目录写入

### 高危 (High)
- 数据外泄（webhooks、base64 发送）
- 敏感文件读取（`.env`、`.ssh`、凭证）
- 原始套接字访问
- 基于 DNS 的数据外泄
- 安全绕过尝试
- 加密货币挖矿

### 中危 (Medium)
- 环境变量访问
- 递归目录读取
- 主目录访问
- 混淆模式

### 低危 (Low)
- Unicode 转义序列
- 轻微可疑模式

## API

```typescript
import { analyzeContent, formatResult } from '@isnad/scanner';

const result = analyzeContent(code, resourceHash);
console.log(formatResult(result));

// 结果包括：
// - riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'clean'
// - riskScore: number
// - confidence: 0-1
// - findings: 详细的模式匹配结果
```

## 合约地址

### Base Sepolia（测试网）
- Registry: `0x8340783A495BB4E5f2DF28eD3D3ABcD254aA1C93`
- Oracle: `0x4f1968413640bA2087Db65d4c37912d7CD598982`

### Base Mainnet（主网）
- 即将推出

## 许可证

MIT
