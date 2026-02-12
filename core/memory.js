/**
 * LoongClaw - 记忆系统
 * 
 * 管理短期和长期记忆
 */

import { readFile, writeFile, mkdir, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/**
 * 记忆类型
 */
export const MemoryType = {
  FACT: 'fact',        // 事实信息
  EVENT: 'event',      // 事件记录
  DECISION: 'decision', // 决策记录
  THOUGHT: 'thought'   // 思考记录
};

/**
 * 记忆重要性
 */
export const MemoryImportance = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

/**
 * 记忆项
 */
class MemoryItem {
  /**
   * 创建记忆项
   * @param {Object} data - 记忆数据
   * @param {string} data.content - 记忆内容
   * @param {string} data.type - 记忆类型
   * @param {string} data.importance - 重要性
   * @param {string[]} data.tags - 标签
   */
  constructor(data) {
    this.id = this._generateId();
    this.timestamp = new Date().toISOString();
    this.content = data.content;
    this.type = data.type || MemoryType.FACT;
    this.importance = data.importance || MemoryImportance.MEDIUM;
    this.tags = data.tags || [];
    this.embeddings = null; // 未来可扩展为向量搜索
  }

  /**
   * 生成唯一 ID
   * @private
   */
  _generateId() {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 导出为 JSON
   */
  toJSON() {
    return {
      id: this.id,
      timestamp: this.timestamp,
      type: this.type,
      importance: this.importance,
      tags: this.tags,
      content: this.content
    };
  }

  /**
   * 从 JSON 创建
   */
  static fromJSON(json) {
    const item = new MemoryItem({
      content: json.content,
      type: json.type,
      importance: json.importance,
      tags: json.tags
    });
    item.id = json.id;
    item.timestamp = json.timestamp;
    return item;
  }
}

/**
 * 记忆系统
 */
class MemorySystem {
  /**
   * 创建记忆系统
   * @param {Object} config - 配置
   * @param {string} config.memoryDir - 记忆存储目录
   */
  constructor(config = {}) {
    this.memoryDir = config.memoryDir || './memory';
    this.shortTermMemory = []; // 会话内短期记忆
    this.longTermCache = null; // 长期记忆缓存
    this.maxShortTermSize = config.maxShortTermSize || 100;
  }

  /**
   * 初始化记忆系统
   */
  async init() {
    // 确保目录存在
    if (!existsSync(this.memoryDir)) {
      await mkdir(this.memoryDir, { recursive: true });
    }
    
    // 加载长期记忆缓存
    await this._loadLongTermCache();
  }

  /**
   * 添加记忆
   * @param {Object} data - 记忆数据
   * @returns {Promise<MemoryItem>} 记忆项
   */
  async add(data) {
    const item = new MemoryItem(data);
    
    // 添加到短期记忆
    this.shortTermMemory.unshift(item);
    
    // 限制短期记忆大小
    if (this.shortTermMemory.length > this.maxShortTermSize) {
      const removed = this.shortTermMemory.pop();
      
      // 如果重要性高，保存到长期记忆
      if (removed.importance === MemoryImportance.HIGH) {
        await this._saveToLongTerm(removed);
      }
    }
    
    // 如果重要性高或中等，保存到长期记忆
    if (item.importance !== MemoryImportance.LOW) {
      await this._saveToLongTerm(item);
    }
    
    return item;
  }

  /**
   * 搜索记忆
   * @param {Object} query - 查询条件
   * @param {string} query.keyword - 关键词
   * @param {string} query.type - 类型过滤
   * @param {string[]} query.tags - 标签过滤
   * @param {number} query.limit - 结果数量限制
   * @returns {Promise<MemoryItem[]>} 匹配的记忆
   */
  async search(query = {}) {
    const results = [];
    const keyword = query.keyword?.toLowerCase() || '';
    
    // 搜索短期记忆
    for (const item of this.shortTermMemory) {
      if (this._match(item, keyword, query.type, query.tags)) {
        results.push(item);
      }
    }
    
    // 搜索长期记忆缓存
    if (this.longTermCache) {
      for (const item of this.longTermCache) {
        if (this._match(item, keyword, query.type, query.tags)) {
          results.push(item);
        }
      }
    }
    
    // 按时间排序（最新的在前）
    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // 限制结果数量
    if (query.limit) {
      return results.slice(0, query.limit);
    }
    
    return results;
  }

  /**
   * 获取最近记忆
   * @param {number} limit - 数量限制
   * @returns {MemoryItem[]} 最近记忆
   */
  getRecent(limit = 10) {
    return this.shortTermMemory.slice(0, limit);
  }

  /**
   * 清除短期记忆
   */
  clearShortTerm() {
    this.shortTermMemory = [];
  }

  /**
   * 导出所有记忆
   * @param {string} format - 导出格式 (json|md)
   * @returns {Promise<string>} 导出内容
   */
  async export(format = 'json') {
    const allMemories = [
      ...this.shortTermMemory,
      ...(this.longTermCache || [])
    ];
    
    if (format === 'json') {
      return JSON.stringify(allMemories, null, 2);
    } else if (format === 'md') {
      return this._exportAsMarkdown(allMemories);
    } else {
      throw new Error(`不支持的导出格式: ${format}`);
    }
  }

  /**
   * 匹配记忆
   * @private
   */
  _match(item, keyword, type, tags) {
    // 类型过滤
    if (type && item.type !== type) {
      return false;
    }
    
    // 标签过滤
    if (tags && tags.length > 0) {
      if (!tags.some(tag => item.tags.includes(tag))) {
        return false;
      }
    }
    
    // 关键词搜索
    if (keyword) {
      const content = item.content.toLowerCase();
      const tagsStr = item.tags.join(' ').toLowerCase();
      
      if (!content.includes(keyword) && !tagsStr.includes(keyword)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * 保存到长期记忆
   * @private
   */
  async _saveToLongTerm(item) {
    const date = new Date().toISOString().split('T')[0];
    const filePath = path.join(this.memoryDir, `${date}.md`);
    
    let content = '';
    if (existsSync(filePath)) {
      content = await readFile(filePath, 'utf-8');
    }
    
    // 追加记忆
    const memoryText = `\n## ${item.timestamp}\n` +
      `- **类型**: ${item.type}\n` +
      `- **重要性**: ${item.importance}\n` +
      `- **标签**: ${item.tags.join(', ') || '无'}\n` +
      `\n${item.content}\n`;
    
    await writeFile(filePath, content + memoryText, 'utf-8');
  }

  /**
   * 加载长期记忆缓存
   * @private
   */
  async _loadLongTermCache() {
    const files = await readdir(this.memoryDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    this.longTermCache = [];
    
    for (const file of mdFiles) {
      const filePath = path.join(this.memoryDir, file);
      const content = await readFile(filePath, 'utf-8');
      
      // 简单解析（每篇日记为一个记忆项）
      const item = new MemoryItem({
        content: content,
        type: MemoryType.EVENT,
        importance: MemoryImportance.MEDIUM,
        tags: ['long-term', file.replace('.md', '')]
      });
      
      this.longTermCache.push(item);
    }
  }

  /**
   * 导出为 Markdown
   * @private
   */
  _exportAsMarkdown(memories) {
    let md = '# 记忆导出\n\n';
    
    // 按日期分组
    const grouped = {};
    for (const mem of memories) {
      const date = mem.timestamp.split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(mem);
    }
    
    // 生成内容
    for (const [date, items] of Object.entries(grouped).sort().reverse()) {
      md += `## ${date}\n\n`;
      
      for (const item of items) {
        md += `### ${item.timestamp}\n`;
        md += `- **类型**: ${item.type}\n`;
        md += `- **重要性**: ${item.importance}\n`;
        md += `- **标签**: ${item.tags.join(', ') || '无'}\n\n`;
        md += `${item.content}\n\n`;
      }
    }
    
    return md;
  }
}

/**
 * 创建默认记忆系统
 */
export function createMemorySystem(config) {
  return new MemorySystem(config);
}

export { MemoryItem, MemorySystem };
export default MemorySystem;
