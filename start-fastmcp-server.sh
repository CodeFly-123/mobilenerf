#!/bin/bash

# FastMCP Vision Server 启动脚本
echo "🚀 启动 FastMCP Vision Server..."
echo "================================================"

# 检查API密钥
if grep -q "test-api-key" fastmcp-vision-server.js; then
    echo "⚠️  警告: 请先设置正确的API密钥"
    echo "编辑 fastmcp-vision-server.js 文件，将 'test-api-key' 替换为您的实际API密钥"
    echo ""
fi

# 启动服务器
echo "📡 启动模式: HTTP"
echo "🌐 服务地址: http://0.0.0.0:8796"
echo "🤖 模型: Qwen2.5-VL-7B-Instruct"
echo "================================================"

cd /workspace
node fastmcp-vision-server.js --http