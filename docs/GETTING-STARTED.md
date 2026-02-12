# LoongClaw 快速开始指南

## 🚀 快速启动

### 1. 安装依赖

```bash
cd /root/clawd/loongclaw
npm install
```

### 2. 配置环境变量

```bash
# 复制配置模板
cp .env.example .env

# 编辑 .env 文件
nano .env
```

在 `.env` 中填入：

```env
# GLM API 密钥（必需）
GLM_API_KEY=你的_API_密钥

# 其他配置（可选）
PORT=3000
WS_PORT=3001
MEMORY_DIR=./memory
```

### 3. 启动 LoongClaw

```bash
# 完整启动（Web 服务器 + WebSocket）
npm start

# 开发模式（热重载）
npm run dev
```

### 4. 访问界面

打开浏览器访问：`http://localhost:3000`

---

## 🧪 测试引擎

### CLI 模式（单次对话）

```bash
node index.js "你好熊大，自我介绍一下"
```

### API 模式

```bash
# 发送聊天请求
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"你好熊大"}'

# 获取统计信息
curl http://localhost:3000/api/stats

# 搜索记忆
curl http://localhost:3000/api/memory/search?keyword=森林

# 导出记忆
curl http://localhost:3000/api/memory/export?format=md
```

### WebSocket 模式

```javascript
// 连接 WebSocket
const ws = new WebSocket('ws://localhost:3001');

// 发送消息
ws.send(JSON.stringify({
  type: 'chat',
  data: {
    message: '你好熊大',
    sessionId: 'default'
  }
}));

// 接收流式响应
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
};
```

---

## 📡 API 文档

### REST API

#### 1. 健康检查
```
GET /health
```

#### 2. 获取统计信息
```
GET /api/stats
```

#### 3. 单次对话
```
POST /api/chat
Content-Type: application/json

{
  "message": "你好",
  "sessionId": "default"
}
```

#### 4. 获取会话历史
```
GET /api/history/:sessionId?
```

#### 5. 清除会话历史
```
DELETE /api/history/:sessionId?
```

#### 6. 搜索记忆
```
GET /api/memory/search?keyword=xxx&type=xxx&limit=10
```

#### 7. 导出记忆
```
GET /api/memory/export?format=json|md
```

### WebSocket API

#### 连接
```
ws://localhost:3001
```

#### 消息格式

**发送消息**:
```json
{
  "type": "chat",
  "data": {
    "message": "你好",
    "sessionId": "default"
  }
}
```

**接收流式响应**:
```json
{
  "type": "message_chunk",
  "content": "你好",
  "timestamp": "2026-02-12T..."
}
```

**接收完整消息**:
```json
{
  "type": "message_complete",
  "role": "assistant",
  "content": "完整响应",
  "timestamp": "2026-02-12T..."
}
```

---

## 🛠️ 开发命令

```bash
# 运行测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 生成测试覆盖率
npm run test:coverage
```

---

## 📝 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 | 必需 |
|--------|------|--------|------|
| `GLM_API_KEY` | GLM API 密钥 | - | ✅ |
| `GLM_MODEL` | 模型名称 | `glm-4-plus` | ❌ |
| `PORT` | HTTP 端口 | `3000` | ❌ |
| `WS_PORT` | WebSocket 端口 | `3001` | ❌ |
| `MEMORY_DIR` | 记忆存储目录 | `./memory` | ❌ |

### 系统提示自定义

创建 `config/SOUL.md` 来自定义系统提示：

```markdown
你是 熊大，森林守护者。

**核心原则**:
- 强壮、聪明、勇敢，保护森林
- ...
```

---

## 🐛 故障排除

### 问题 1: GLM API 调用失败

**症状**: `LLM API 错误: 401`

**解决方案**:
- 检查 `.env` 中的 `GLM_API_KEY` 是否正确
- 确认 API Key 有效且未过期
- 检查网络连接

### 问题 2: WebSocket 连接失败

**症状**: 页面显示 "连接断开"

**解决方案**:
- 检查 `WS_PORT` 是否被占用
- 确认防火墙允许端口访问
- 查看浏览器控制台错误信息

### 问题 3: 记忆系统错误

**症状**: `ENOENT: no such file or directory`

**解决方案**:
```bash
# 创建记忆目录
mkdir -p memory sessions workspace
```

---

## 📚 下一步

- 阅读 [ARCHITECTURE.md](../docs/ARCHITECTURE.md) 了解架构
- 阅读 [API.md](../docs/API.md) 了解完整 API
- 阅读 [TUTORIAL.md](../docs/TUTORIAL.md) 查看教程

---

**祝使用愉快！** 🐉

有问题？查看 [DEVELOPMENT.md](../DEVELOPMENT.md) 或提交 Issue。
