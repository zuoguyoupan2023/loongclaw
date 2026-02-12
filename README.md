# LoongClaw 🐉

_基于 pi-mono 的精简版 OpenClaw 系统_

## 📋 项目概述

LoongClaw 是一个轻量级、学习导向的 AI Agent 系统，从 OpenClaw 提取核心功能，专注于清晰架构和易于理解。

**核心特性**:
- 🎯 精简但功能完整
- 📚 学习导向设计
- 🔧 易于扩展定制
- ⚡ 快速启动运行

**定位**: 学习项目 / 试验场 / OpenClaw 参考实现

---

## 🎯 设计目标

### 精简版 ≠ 功能缺失

**保留核心**:
- ✅ 对话交互（LLM 集成）
- ✅ 工具调用（Tools 系统）
- ✅ 记忆管理（Memory 系统）
- ✅ 会话管理（Session 管理）

**简化功能**:
- ⚪ 单通道支持（WebChat）
- ⚪ 单模型支持（GLM-4）
- ⚪ 基础工具集（10-15 个）

**移除功能**:
- ❌ 复杂多通道集成
- ❌ 技能市场系统
- ❌ 企业级功能

---

## 🏗️ 项目结构

```
loongclaw/
├── core/                    # 核心引擎
│   ├── agent.js            # Agent 主逻辑
│   ├── llm.js              # LLM 适配器
│   ├── tools.js            # 工具管理器
│   ├── memory.js           # 记忆系统
│   └── session.js          # 会话管理
├── tools/                   # 工具集
│   ├── filesystem.js       # 文件操作
│   ├── web.js              # Web 访问
│   └── shell.js            # Shell 执行
├── ui/                      # 用户界面
│   └── webchat/            # WebChat 界面
├── config/                  # 配置文件
│   ├── agent.json          # Agent 配置
│   └── tools.json          # 工具配置
├── docs/                    # 文档
│   ├── ARCHITECTURE.md     # 架构说明
│   ├── API.md              # API 文档
│   └── TUTORIAL.md         # 教程
└── tests/                   # 测试
    ├── unit/               # 单元测试
    └── integration/        # 集成测试
```

---

## 🚀 快速开始

### 安装

```bash
# 克隆项目
git clone https://github.com/FuHuoMe/loongclaw.git
cd loongclaw

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入 API 密钥
```

### 运行

```bash
# 启动开发服务器
npm run dev

# 启动生产服务器
npm start

# 运行测试
npm test
```

### 配置

创建 `.env` 文件：

```env
# LLM API
GLM_API_KEY=your_glm_api_key
GLM_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions

# 服务器配置
PORT=3000
HOST=localhost

# 存储配置
MEMORY_DIR=./memory
SESSION_DIR=./sessions
```

---

## 📊 与 OpenClaw 对比

| 特性 | OpenClaw | LoongClaw |
|------|----------|-----------|
| **架构复杂度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **通道支持** | 多通道（10+） | 单通道（WebChat） |
| **模型支持** | 多模型（20+） | 单模型（GLM-4） |
| **工具数量** | 50+ | 10-15 |
| **扩展系统** | 技能市场 | 手动添加 |
| **学习曲线** | 陡峭 | 平缓 |
| **代码量** | ~10K 行 | ~3K 行 |
| **定位** | 生产级 | 学习/试验 |

---

## 🔧 核心功能

### 1. 对话交互
- ✅ 多轮对话
- ✅ 上下文管理
- ✅ 流式输出
- ✅ Markdown 渲染

### 2. 工具调用
- ✅ 文件操作（读/写/编辑）
- ✅ Web 访问（搜索/抓取）
- ✅ Shell 执行（限制权限）
- ✅ 记忆管理（读/写/搜索）

### 3. 记忆系统
- ✅ 短期记忆（会话内）
- ✅ 长期记忆（文件持久化）
- ✅ 语义搜索（关键词）
- ✅ 记忆索引

### 4. 会话管理
- ✅ 会话创建/删除
- ✅ 会话历史
- ✅ 会话切换
- ✅ 导出/导入

---

## 🛡️ 安全与权限

### 文件系统访问
- 限制访问目录（如 `./workspace/`）
- 禁止访问系统关键路径
- 文件大小限制

### Shell 执行
- 白名单命令
- 超时控制
- 资源限制

### Web 访问
- URL 白名单/黑名单
- 请求频率限制
- 内容大小限制

---

## 📚 文档

- [架构说明](docs/ARCHITECTURE.md) - 系统架构详解
- [API 文档](docs/API.md) - API 参考
- [教程](docs/TUTORIAL.md) - 快速入门
- [贡献指南](CONTRIBUTING.md) - 如何贡献

---

## 🧪 测试

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 生成覆盖率报告
npm run test:coverage
```

---

## 🔄 开发计划

### 阶段 1：核心引擎 ✅
- [x] 搭建项目结构
- [ ] 实现 `agent.js`（主逻辑）
- [ ] 实现 `llm.js`（GLM-4 适配器）
- [ ] 实现 `tools.js`（工具管理）
- [ ] 实现基础工具集

### 阶段 2：记忆与存储
- [ ] 实现 `memory.js`
- [ ] 实现 `session.js`
- [ ] 设计记忆存储格式

### 阶段 3：用户界面
- [ ] 设计 UI 布局
- [ ] 实现 WebSocket 通信
- [ ] 实现消息渲染

### 阶段 4：文档与测试
- [ ] 编写架构文档
- [ ] 编写 API 文档
- [ ] 补充测试用例

---

## 🎯 成功标准

### 技术指标
- ✅ 启动时间 < 3 秒
- ✅ 响应时间 < 2 秒
- ✅ 内存占用 < 200MB
- ✅ 测试覆盖率 > 80%

### 功能指标
- ✅ 支持完整的对话流程
- ✅ 支持至少 10 个工具
- ✅ 记忆系统功能完整
- ✅ 文档覆盖所有功能

---

## 🤝 贡献

欢迎贡献！请查看 [贡献指南](CONTRIBUTING.md)。

---

## 📄 许可证

MIT License

---

## 🔗 相关资源

- [OpenClaw 文档](https://docs.openclaw.ai)
- [OpenClaw 源码](https://github.com/openclaw/openclaw)
- [ClawHub](https://clawhub.com)
- [pi-mono 文档](#) (待添加)

---

**创建时间**: 2026年2月12日
**创建者**: 熊大 🐻💪
**版本**: v0.1.0 (开发中)
