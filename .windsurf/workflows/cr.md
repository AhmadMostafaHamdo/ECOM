---
description: 对 commit 的代码进行 Code Review
auto_execution_mode: 1
---

# Code Review 工作流

此 workflow 会对 commit 的代码变更进行全面的代码审查。

**使用方式**：

- 带参数：`/cr <commit-id>` - 审查指定的 commit
- 不带参数：`/cr` - 审查所有已 commit 但未 push 的 commits

## 步骤

### 1. 确定待审查的 commits 范围

**如果用户提供了 commit id**：

- 使用该 commit id 进行审查

**如果用户没有提供 commit id**：

- 获取已 commit 但未 push 的所有 commits：

```bash
git log @{u}.. --oneline
```

如果没有未推送的 commits，则审查最新一次 commit (HEAD)。

### 2. 获取 commit 的变更文件列表

对于每个待审查的 commit，获取涉及的所有文件：

```bash
# 对于指定的 commit
git show --name-only --pretty=format: <commit-id>

# 对于多个 commits（未 push 的范围）
git diff --name-only @{u}..HEAD
```

### 3. 获取 commit 详细信息

获取 commit 的基本信息（作者、时间、提交信息）：

```bash
# 单个 commit
git log -1 --pretty=format:"Commit: %H%nAuthor: %an <%ae>%nDate: %ad%nMessage: %s%n%b" <commit-id>

# 多个 commits（未 push 的范围）
git log @{u}..HEAD --pretty=format:"Commit: %H%nAuthor: %an <%ae>%nDate: %ad%nMessage: %s%n%b" --reverse
```

### 4. 查看变更的具体内容

获取变更的详细 diff：

```bash
# 单个 commit
git show <commit-id>

# 多个 commits（未 push 的范围）
git diff @{u}..HEAD
```

### 5. 读取 Code Review 规则

读取项目中的代码审查规则文件 `.aidev/codereview-rules.md`，了解审查标准。

### 6. 读取项目上下文信息

读取项目上下文文件 `.aidev/project-context.json`，获取项目的全局上下文信息。

该文件包含以下关键信息：

- **projectName**: 项目名称
- **lastUpdated**: ISO 8601 格式的最后更新时间
- **projectStructure**: 项目目录结构和目录说明
- **techStack**: 主要技术栈（框架、语言、工具等）
- **aliasConfig**: 路径别名配置（如 `@/` 指向 `src/`）
- **specialSolutions**: 特殊技术方案说明（如状态管理、路由方案等）
- **keyDependencies**: 关键依赖及其版本

这些信息将帮助审查时：

- 理解代码的技术栈和架构背景
- 识别是否符合项目的技术规范
- 检查依赖使用是否合理
- 验证路径引用是否正确

### 7. 执行代码审查

根据 `.aidev/codereview-rules.md` 中定义的规则，对变更的代码进行审查，关注以下维度：

- **代码正确性**：认知复杂度、函数职责、空值检查、类型安全、魔法数字、重复代码、命名规范
- **安全性**：XSS 防护、敏感数据保护、错误信息、本地存储安全、依赖安全
- **性能与资源**：循环优化、内存泄漏、重复计算、重渲染优化
- **可维护性**：注释质量、嵌套层级、参数数量、文件长度、组件复杂度
- **错误处理**：空 catch 块、异步错误处理
- **架构与设计**：组件职责、循环依赖

### 8. 生成审查报告

生成结构化的审查报告，包括：

#### 8.1 Commit 概要

- Commit ID（单个或多个）
- 作者和提交时间
- 提交信息

#### 8.2 审查结果总结

- 通过/需要修改的判断
- 发现的问题数量（Critical/Major/Minor/Suggestion）

#### 8.3 详细问题列表

对于每个发现的问题，提供：

- 问题严重等级（Critical/Major/Minor/Suggestion）
- 违反的规则编号和名称
- 问题位置（文件名和行号）
- 问题描述
- 改进建议

#### 8.4 正向反馈（可选）

- 做得好的地方
- 符合最佳实践的代码示例

### 9. 输出结论

根据审查结果给出明确结论：

- ✅ **PASS**：无 Critical 问题，可以合并
- ⚠️ **PASS WITH SUGGESTIONS**：无 Critical 问题，但有改进建议
- ❌ **FAIL**：存在 Critical 问题，需要修复后重新审查