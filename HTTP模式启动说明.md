# Vision MCP Server HTTP模式启动说明

## 问题解决

您之前看到的 `http://10.33.15.3:8796/mcp` 地址确实存在，但需要以HTTP模式启动MCP服务器才能使用。

## 两种启动模式

### 1. stdio模式（默认）
```bash
node custom-vision-mcp-server.js
```
- 用于直接集成到MCP客户端
- 通过标准输入输出通信
- 不监听HTTP端口

### 2. HTTP模式（新增）
```bash
node custom-vision-mcp-server.js --http
```
- 启动HTTP服务器监听8796端口
- 提供REST API接口
- 可通过 `http://10.33.15.3:8796/mcp` 访问

## 启动HTTP服务器

### 方法1：直接启动
```bash
cd /workspace
node custom-vision-mcp-server.js --http
```

### 方法2：使用启动脚本
```bash
./start-http-server.sh
```

### 方法3：使用npm脚本
```bash
npm run start:http
```

## 验证HTTP服务

启动后您会看到：
```
Custom Vision MCP Server started successfully
HTTP Server: http://0.0.0.0:8796/mcp
API Base URL: http://10.33.15.1:8808/v1
Model: Qwen2.5-VL-7B-Instruct
```

## 测试HTTP端点

```bash
# 测试工具列表
curl -X POST http://localhost:8796/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

# 测试图片分析
curl -X POST http://localhost:8796/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"analyze_image","arguments":{"image":"https://example.com/image.jpg","prompt":"请描述这张图片"}}}'
```

## 在Dify中配置

现在您可以在Dify中使用以下地址：
```
http://10.33.15.3:8796/mcp
```

## 重要提醒

1. **配置API密钥**：启动前请编辑 `custom-vision-mcp-server.js` 文件，将 `test-api-key` 替换为您的实际API密钥

2. **网络访问**：确保 `10.33.15.3:8796` 端口可访问

3. **持续运行**：HTTP模式需要保持服务器运行，建议使用进程管理工具如PM2

## 使用PM2管理进程（推荐）

```bash
# 安装PM2
npm install -g pm2

# 启动服务
pm2 start custom-vision-mcp-server.js --name vision-mcp -- --http

# 查看状态
pm2 status

# 查看日志
pm2 logs vision-mcp
```

现在您明白了为什么之前没有使用8796端口 - 需要以HTTP模式启动服务器！