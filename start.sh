#!/bin/bash

echo "🐉 启动 LoongClaw Web 服务器..."
echo ""

cd /root/clawd/loongclaw

echo "📂 工作目录: $(pwd)"
echo "📦 依赖检查..."

if [ ! -d "node_modules" ]; then
    echo "⚠️  依赖未安装，正在安装..."
    npm install
fi

echo ""
echo "✅ 启动服务器..."
echo ""

node index.js
