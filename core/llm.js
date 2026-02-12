/**
 * LoongClaw - LLM 适配器
 * 
 * 负责 LLM API 调用，支持多种模型
 * 当前支持：GLM-4 (智谱 AI)
 */

import axios from 'axios';

/**
 * LLM 消息格式
 * @typedef {Object} Message
 * @property {string} role - 角色 (system|user|assistant)
 * @property {string} content - 内容
 * @property {Object[]} [tool_calls] - 工具调用
 */

/**
 * LLM 响应格式
 * @typedef {Object} LLMResponse
 * @property {string} content - 响应内容
 * @property {Object[]} [tool_calls] - 工具调用请求
 * @property {Object} usage - token 使用统计
 */

/**
 * LLM 适配器类
 */
class LLMAdapter {
  /**
   * 创建 LLM 适配器
   * @param {Object} config - 配置对象
   * @param {string} config.provider - 提供商 (glm|deepseek|kimi)
   * @param {string} config.apiKey - API 密钥
   * @param {string} config.apiUrl - API 端点
   * @param {string} config.model - 模型名称
   */
  constructor(config) {
    this.provider = config.provider || 'glm';
    this.apiKey = config.apiKey || process.env.GLM_API_KEY;
    this.apiUrl = config.apiUrl || process.env.GLM_API_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    this.model = config.model || process.env.GLM_MODEL || 'glm-4-plus';
    this.timeout = config.timeout || 60000;
    
    // 验证配置
    if (!this.apiKey) {
      throw new Error('LLM 适配器配置不完整：需要 apiKey');
    }
    
    // 创建 HTTP 客户端
    this.client = axios.create({
      baseURL: this.apiUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
  }

  /**
   * 发送聊天请求
   * @param {Message[]} messages - 消息历史
   * @param {Object[]} [tools] - 可用工具列表
   * @param {Object} [options] - 额外选项
   * @returns {Promise<LLMResponse>} LLM 响应
   */
  async chat(messages, tools = null, options = {}) {
    try {
      // 构建请求体
      const requestBody = {
        model: this.model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
        stream: false
      };

      // 如果有工具，添加到请求
      if (tools && tools.length > 0) {
        requestBody.tools = this._formatTools(tools);
      }

      // 发送请求
      const response = await this.client.post('', requestBody);
      
      // 解析响应
      return this._parseResponse(response.data);
      
    } catch (error) {
      // 错误处理
      if (error.response) {
        // API 返回错误
        throw new Error(
          `LLM API 错误: ${error.response.status} - ${JSON.stringify(error.response.data)}`
        );
      } else if (error.request) {
        // 请求超时或无响应
        throw new Error(`LLM API 请求失败: ${error.message}`);
      } else {
        // 其他错误
        throw new Error(`LLM 调用失败: ${error.message}`);
      }
    }
  }

  /**
   * 发送流式聊天请求
   * @param {Message[]} messages - 消息历史
   * @param {Function} onChunk - 接收数据块的回调
   * @param {Object[]} [tools] - 可用工具列表
   * @returns {Promise<LLMResponse>} 完整响应
   */
  async chatStream(messages, onChunk, tools = null) {
    try {
      const requestBody = {
        model: this.model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature: 0.7,
        max_tokens: 2000,
        stream: true
      };

      if (tools && tools.length > 0) {
        requestBody.tools = this._formatTools(tools);
      }

      // 发送流式请求
      const response = await this.client.post('', requestBody, {
        responseType: 'stream'
      });

      // 处理流式响应
      return new Promise((resolve, reject) => {
        let fullContent = '';
        let toolCalls = [];

        response.data.on('data', (chunk) => {
          const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                break;
              }
              
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta;
                
                if (delta?.content) {
                  fullContent += delta.content;
                  onChunk(delta.content);
                }
                
                if (delta?.tool_calls) {
                  toolCalls.push(...delta.tool_calls);
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        });

        response.data.on('end', () => {
          resolve({
            content: fullContent,
            tool_calls: toolCalls,
            usage: {
              prompt_tokens: 0,
              completion_tokens: 0,
              total_tokens: 0
            }
          });
        });

        response.data.on('error', (error) => {
          reject(new Error(`流式请求失败: ${error.message}`));
        });
      });
      
    } catch (error) {
      throw new Error(`流式聊天失败: ${error.message}`);
    }
  }

  /**
   * 格式化工具列表为 API 格式
   * @private
   */
  _formatTools(tools) {
    return tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters || {
          type: 'object',
          properties: {},
          required: []
        }
      }
    }));
  }

  /**
   * 解析 API 响应
   * @private
   */
  _parseResponse(data) {
    const choice = data.choices?.[0];
    
    return {
      content: choice?.message?.content || '',
      tool_calls: choice?.message?.tool_calls || [],
      usage: {
        prompt_tokens: data.usage?.prompt_tokens || 0,
        completion_tokens: data.usage?.completion_tokens || 0,
        total_tokens: data.usage?.total_tokens || 0
      }
    };
  }

  /**
   * 健康检查
   * @returns {Promise<boolean>} 是否健康
   */
  async healthCheck() {
    try {
      const response = await this.chat([
        { role: 'user', content: 'ping' }
      ], null, { maxTokens: 10 });
      
      return !!response.content;
    } catch (error) {
      return false;
    }
  }
}

/**
 * GLM-4 适配器工厂
 */
export function createGLMAdapter(config) {
  return new LLMAdapter({
    provider: 'glm',
    apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    model: 'glm-4-plus',
    ...config
  });
}

/**
 * DeepSeek 适配器工厂
 */
export function createDeepSeekAdapter(config) {
  return new LLMAdapter({
    provider: 'deepseek',
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
    ...config
  });
}

/**
 * Kimi 适配器工厂
 */
export function createKimiAdapter(config) {
  return new LLMAdapter({
    provider: 'kimi',
    apiUrl: 'https://api.moonshot.cn/v1/chat/completions',
    model: 'moonshot-v1-8k',
    ...config
  });
}

export default LLMAdapter;
