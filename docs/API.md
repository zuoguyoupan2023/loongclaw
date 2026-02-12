# LoongClaw API 文档

## 📖 目录

- [REST API](#rest-api)
- [WebSocket API](#websocket-api)
- [JavaScript API](#javascript-api)
- [错误处理](#错误处理)

---

## REST API

### 基础信息

- **Base URL**: `http://localhost:3000`
- **Content-Type**: `application/json`
- **编码**: `UTF-8`

### 健康检查

```http
GET /health
```

**响应**:

```json
{
  "status": "ok",
  "agent": "熊大",
  "timestamp": "2026-02-12T18:00:00.000Z"
}
```

---

### 获取统计信息

```http
GET /api/stats
```

**响应**:

```json
{
  "sessions": 1,
  "tools": 5,
  "shortTermMemories": 10
}
```

---

### 单次对话

```http
POST /api/chat
Content-Type: application/json

{
  "message": "你好熊大",
  "sessionId": "default"
}
```

**请求参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| message | string | ✅ | 用户消息 |
| sessionId | string | ❌ | 会话 ID，默认 `default` |

**响应**:

```json
{
  "message": "你好！我是熊大...",
  "sessionId": "default",
  "timestamp": "2026-02-12T18:00:00.000Z"
}
```

**错误示例**:

```json
{
  "error": "缺少 message 参数"
}
```

---

### 获取会话历史

```http
GET /api/history/:sessionId?
```

**URL 参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| sessionId | string | 会话 ID，可选 |

**响应**:

```json
{
  "sessionId": "default",
  "messages": [
    {
      "role": "user",
      "content": "你好",
      "timestamp": "2026-02-12T18:00:00.000Z"
    },
    {
      "role": "assistant",
      "content": "你好！我是熊大",
      "timestamp": "2026-02-12T18:00:01.000Z"
    }
  ]
}
```

---

### 清除会话历史

```http
DELETE /api/history/:sessionId?
```

**URL 参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| sessionId | string | 会话 ID，可选 |

**响应**:

```json
{
  "success": true,
  "sessionId": "default"
}
```

---

### 搜索记忆

```http
GET /api/memory/search?keyword=xxx&type=xxx&limit=10
```

**查询参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| keyword | string | ❌ | 关键词 |
| type | string | ❌ | 记忆类型 (fact\|event\|decision\|thought) |
| limit | number | ❌ | 结果数量限制，默认 10 |

**响应**:

```json
{
  "results": [
    {
      "id": "mem_123",
      "timestamp": "2026-02-12T17:56:11.796Z",
      "type": "event",
      "importance": "high",
      "tags": ["conversation"],
      "content": "Q: 记住：我最喜欢的颜色是蓝色\nA: ..."
    }
  ]
}
```

---

### 导出记忆

```http
GET /api/memory/export?format=json|md
```

**查询参数**:

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| format | string | ❌ | 导出格式，`json` 或 `md`，默认 `json` |

**响应 (JSON)**:

```json
[
  {
    "id": "mem_123",
    "timestamp": "2026-02-12T17:56:11.796Z",
    "type": "event",
    "content": "..."
  }
]
```

**响应 (Markdown)**:

```markdown
# 记忆导出

## 2026-02-12

### 2026-02-12T17:56:11.796Z
- **类型**: event
...
```

---

## WebSocket API

### 连接

```javascript
const ws = new WebSocket('ws://localhost:3001');
```

### 消息格式

**客户端发送**:

```json
{
  "type": "chat",
  "data": {
    "message": "你好熊大",
    "sessionId": "default"
  }
}
```

**服务端推送 (流式)**:

```json
{
  "type": "message_chunk",
  "content": "你好",
  "timestamp": "2026-02-12T18:00:00.000Z"
}
```

**服务端推送 (完成)**:

```json
{
  "type": "message_complete",
  "role": "assistant",
  "content": "你好！我是熊大，森林守护者。",
  "timestamp": "2026-02-12T18:00:01.000Z"
}
```

---

### 支持的消息类型

#### 1. chat

**方向**: 客户端 → 服务端

```json
{
  "type": "chat",
  "data": {
    "message": "用户消息",
    "sessionId": "default"
  }
}
```

#### 2. message_chunk

**方向**: 服务端 → 客户端 (流式)

```json
{
  "type": "message_chunk",
  "content": "消息片段",
  "timestamp": "2026-02-12T18:00:00.000Z"
}
```

#### 3. message_complete

**方向**: 服务端 → 客户端

```json
{
  "type": "message_complete",
  "role": "assistant",
  "content": "完整消息",
  "timestamp": "2026-02-12T18:00:01.000Z"
}
```

#### 4. get_history

**方向**: 客户端 → 服务端

```json
{
  "type": "get_history",
  "data": {
    "sessionId": "default"
  }
}
```

#### 5. history

**方向**: 服务端 → 客户端

```json
{
  "type": "history",
  "sessionId": "default",
  "messages": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

#### 6. clear_history

**方向**: 客户端 → 服务端

```json
{
  "type": "clear_history",
  "data": {
    "sessionId": "default"
  }
}
```

#### 7. history_cleared

**方向**: 服务端 → 客户端

```json
{
  "type": "history_cleared",
  "sessionId": "default"
}
```

#### 8. connected

**方向**: 服务端 → 客户端

```json
{
  "type": "connected",
  "clientId": "client_123",
  "message": "已连接到 LoongClaw"
}
```

#### 9. error

**方向**: 服务端 → 客户端

```json
{
  "type": "error",
  "error": "错误描述"
}
```

---

### WebSocket 事件

```javascript
const ws = new WebSocket('ws://localhost:3001');

// 连接建立
ws.onopen = () => {
  console.log('✅ 已连接');
};

// 接收消息
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('收到:', data);
};

// 连接关闭
ws.onclose = () => {
  console.log('❌ 连接断开');
};

// 错误
ws.onerror = (error) => {
  console.error('错误:', error);
};
```

---

## JavaScript API

### Agent 类

```javascript
import { createAgent } from './core/agent.js';

// 创建 Agent
const agent = await createAgent({
  llm: {
    apiKey: 'your-api-key',
    model: 'glm-4-flash'
  },
  memory: {
    memoryDir: './memory'
  },
  system: {
    name: '熊大',
    role: '森林守护者'
  }
});

// 处理消息
const response = await agent.process('你好', 'default');
console.log(response);

// 获取历史
const history = agent.getHistory('default');

// 清除历史
agent.clearHistory('default');

// 获取统计
const stats = agent.getStats();
console.log(stats);
// { sessions: 1, tools: 5, shortTermMemories: 10 }
```

---

### Tool 类

```javascript
import { Tool, ToolManager } from './core/tools.js';

// 创建工具
const myTool = new Tool({
  name: 'echo',
  description: '回显输入内容',
  parameters: {
    type: 'object',
    properties: {
      text: { type: 'string' }
    },
    required: ['text']
  },
  handler: async (args) => {
    return { echo: args.text };
  }
});

// 注册工具
agent.tools.register(myTool);

// 调用工具
const result = await agent.tools.call('echo', { text: 'hello' });
```

---

### MemorySystem 类

```javascript
import { createMemorySystem, MemoryType, MemoryImportance } from './core/memory.js';

// 创建记忆系统
const memory = createMemorySystem({
  memoryDir: './memory',
  maxShortTermSize: 100
});

// 初始化
await memory.init();

// 添加记忆
await memory.add({
  content: '用户最喜欢的颜色是蓝色',
  type: MemoryType.FACT,
  importance: MemoryImportance.HIGH,
  tags: ['preference', 'color']
});

// 搜索记忆
const results = await memory.search({
  keyword: '颜色',
  limit: 5
});

// 获取最近记忆
const recent = memory.getRecent(10);

// 导出记忆
const exported = await memory.export('md');
```

---

### LLMAdapter 类

```javascript
import { createGLMAdapter } from './core/llm.js';

// 创建适配器
const llm = createGLMAdapter({
  apiKey: 'your-api-key',
  model: 'glm-4-flash'
});

// 同步聊天
const response = await llm.chat(
  [
    { role: 'system', content: '你是一个助手' },
    { role: 'user', content: '你好' }
  ],
  null,
  { temperature: 0.7 }
);

// 流式聊天
await llm.chatStream(
  messages,
  (chunk) => {
    console.log('收到:', chunk);
  }
);

// 健康检查
const healthy = await llm.healthCheck();
```

---

## 错误处理

### HTTP 错误码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 错误响应格式

```json
{
  "error": "错误描述信息"
}
```

### 常见错误

#### 1. 参数缺失

```json
{
  "error": "缺少 message 参数"
}
```

#### 2. 工具不存在

```json
{
  "error": "工具不存在: unknown_tool"
}
```

#### 3. 路径访问拒绝

```json
{
  "error": "路径访问被拒绝"
}
```

#### 4. LLM API 错误

```json
{
  "error": "LLM API 错误: 429 - {...}"
}
```

---

## 速率限制

当前版本 **未实现** 速率限制。

建议在生产环境中使用反向代理 (如 Nginx) 添加速率限制：

```nginx
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    server {
        location /api/ {
            limit_req zone=api burst=20;
            # ...
        }
    }
}
```

---

## 认证与授权

当前版本 **未实现** 认证机制。

建议在生产环境中添加 API Key 或 JWT 认证：

```javascript
// 中间件示例
function authMiddleware(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: '未授权' });
  }
  
  next();
}
```

---

## 示例代码

### cURL 示例

```bash
# 健康检查
curl http://localhost:3000/health

# 单次对话
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"你好熊大"}'

# 获取历史
curl http://localhost:3000/api/history/default

# 搜索记忆
curl "http://localhost:3000/api/memory/search?keyword=森林&limit=5"

# 导出记忆
curl http://localhost:3000/api/memory/export?format=md
```

### JavaScript 示例

```javascript
// REST API
async function chat(message) {
  const response = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  
  const data = await response.json();
  return data.message;
}

// WebSocket
function chatWebSocket(message, onMessage) {
  const ws = new WebSocket('ws://localhost:3001');
  
  ws.onopen = () => {
    ws.send(JSON.stringify({
      type: 'chat',
      data: { message }
    }));
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'message_complete') {
      onMessage(data.content);
    }
  };
}
```

### Python 示例

```python
import requests

# REST API
def chat(message: str) -> str:
    response = requests.post(
        'http://localhost:3000/api/chat',
        json={'message': message}
    )
    return response.json()['message']

# WebSocket
import websocket
import json

def on_message(ws, message):
    data = json.loads(message)
    if data['type'] == 'message_complete':
        print(data['content'])

ws = websocket.WebSocketApp('ws://localhost:3001')
ws.on_open = lambda ws: ws.send(json.dumps({
    'type': 'chat',
    'data': {'message': '你好'}
}))
ws.on_message = on_message
ws.run_forever()
```

---

## 版本历史

- **v0.1.0** (2026-02-12): 初始版本

---

**文档版本**: v1.0
**最后更新**: 2026年2月12日
**维护者**: 熊大 🐉💪
