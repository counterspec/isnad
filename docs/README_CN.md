# Isnad 安全扫描器 - 中文文档

## 简介

Isnad 是一个智能合约和代码安全扫描工具，帮助开发者识别潜在的安全风险。

## 安装

```bash
npm install -g isnad
```

## 快速开始

```bash
# 扫描当前目录
isnad scan

# 使用配置文件
isnad scan --config .isnad.yml
```

## 扫描规则

### 内置规则

1. **恶意 WebSocket 处理器检测**
2. **混淆代码检测**
3. **HTTP 客户端误报减少**

### 自定义规则

```yaml
rules:
  - name: "custom-check"
    pattern: "eval\s*\("
    severity: "high"
```

## CI/CD 集成

支持 GitHub Actions 和 GitLab CI。

## 常见问题

**Q: 如何减少误报？**
A: 使用 `isnad-ignore` 注释排除特定代码。
