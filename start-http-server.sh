#!/bin/bash

# 启动HTTP模式的Vision MCP Server
echo "Starting Vision MCP Server in HTTP mode..."
echo "Server will be available at: http://0.0.0.0:8796/mcp"
echo "================================================"

cd /workspace
node custom-vision-mcp-server.js --http