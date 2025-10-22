#!/bin/bash

# 设置环境变量
export CUSTOM_API_KEY="your-api-key-here"
export CUSTOM_BASE_URL="http://10.33.15.1:8808/v1"
export CUSTOM_MODEL="Qwen2.5-VL-7B-Instruct"

# 启动自定义vision-mcp-server
echo "Starting Custom Vision MCP Server..."
echo "API Base URL: $CUSTOM_BASE_URL"
echo "Model: $CUSTOM_MODEL"

node /workspace/custom-vision-mcp-server.js