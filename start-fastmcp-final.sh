#!/bin/bash

# FastMCP Vision Server 最终版本启动脚本
echo "🚀 启动 FastMCP Vision Server (最终版本)..."
echo "================================================"

# 检查API密钥
if grep -q "your-actual-api-key-here" fastmcp-vision-server-final.js; then
    echo "⚠️  警告: 请先设置正确的API密钥"
    echo "编辑 fastmcp-vision-server-final.js 文件，将 'your-actual-api-key-here' 替换为您的实际API密钥"
    echo ""
fi

# 启动服务器
echo "📡 启动模式: HTTP"
echo "🌐 服务地址: http://0.0.0.0:8796"
echo "🤖 模型: Qwen2.5-VL-7B-Instruct"
echo "🔧 框架: FastMCP"
echo "================================================"

cd /workspace
node fastmcp-vision-server-final.js --http