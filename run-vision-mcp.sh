#!/bin/bash

# 切换到正确的工作目录
cd /workspace

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# 启动MCP服务器
echo "Starting Vision MCP Server..."
node custom-vision-mcp-server.js