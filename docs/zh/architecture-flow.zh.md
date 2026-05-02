
# Inscription 生命周期

Inscription 生命周期描述了从草稿到最终确认的完整流程。以下是详细的阶段说明：

## 1. 草稿 (Draft)
- **描述**：用户或系统创建一个新的 Inscription，但尚未提交到网络。
- **状态**：草稿阶段的 Inscription 仅存在于本地或临时存储中，未公开或提交。
- **参与者**：创建者（用户或应用程序）

## 2. 请求 (Request)
- **描述**：用户提交 Inscription 到 ISNAD 网络，请求验证和记录。
- **状态**：Inscription 被提交到区块链网络，等待验证。
- **参与者**：提交者、验证节点（Auditor）

## 3. 认证 (Attestation)
- **描述**：验证节点（Auditor）对 Inscription 进行认证，确认其真实性和有效性。
- **状态**：Inscription 被验证节点认证，并记录在链上。
- **参与者**：验证节点（Auditor）、抵押者（Staker）

## 4. 一致性 (Consensus)
- **描述**：网络中的验证节点和抵押者达成共识，确认 Inscription 的有效性。
- **状态**：Inscription 被大多数节点认可，进入共识阶段。
- **参与者**：验证节点（Auditor）、抵押者（Staker）、共识算法

## 5. 最终确认 (Finality)
- **描述**：Inscription 被最终确认，不可更改，并被永久记录在链上。
- **状态**：Inscription 完成生命周期，不可撤销，不可篡改。
- **参与者**：共识层、区块链网络

## 总结
Inscription 的生命周期从草稿开始，经过请求、认证、一致性，最终达到最终确认。这一过程确保了 Inscription 的真实性、可验证性和不可篡改性。

