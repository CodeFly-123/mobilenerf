#!/bin/bash

# 启动自定义vision-mcp-server
echo "Starting Custom Vision MCP Server..."
echo "API Base URL: http://10.33.15.1:8808/v1"
echo "Model: Qwen2.5-VL-7B-Instruct"
echo "注意：请确保已在代码中设置正确的API密钥"

node /workspace/custom-vision-mcp-server.js