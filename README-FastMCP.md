# FastMCP Vision Server

基于FastMCP框架的视觉MCP服务器，支持Qwen2.5-VL-7B-Instruct模型。

## 🚀 特性

- ✅ 基于FastMCP框架，更简洁高效
- ✅ 支持HTTP和stdio两种模式
- ✅ 完整的MCP协议实现
- ✅ 图片分析工具
- ✅ 健康检查和服务器信息工具
- ✅ 自动错误处理和重试机制
- ✅ 支持多种图片格式和输入方式

## 📦 安装

```bash
cd /workspace
npm install fastmcp
```

## 🔧 配置

### 1. 设置API密钥

编辑 `fastmcp-vision-server.js` 文件：

```javascript
const CUSTOM_API_KEY = "your-actual-api-key-here";  // 替换为您的实际API密钥
const CUSTOM_BASE_URL = "http://10.33.15.1:8808/v1";
const CUSTOM_MODEL = "Qwen2.5-VL-7B-Instruct";
```

### 2. 启动服务器

#### HTTP模式（用于Dify）
```bash
# 方式1: 直接启动
node fastmcp-vision-server.js --http

# 方式2: 使用脚本
./start-fastmcp-server.sh

# 方式3: 使用npm脚本
npm run start:fastmcp:http
```

#### stdio模式（用于Cursor）
```bash
# 方式1: 直接启动
node fastmcp-vision-server.js

# 方式2: 使用npm脚本
npm run start:fastmcp
```

## 🛠️ 可用工具

### 1. analyze_image
分析图片内容并提供详细描述

**参数:**
- `image` (string, 必需): 图片URL或本地文件路径
- `prompt` (string, 可选): 对图片的问题或分析要求

**示例:**
```json
{
  "name": "analyze_image",
  "arguments": {
    "image": "https://example.com/image.jpg",
    "prompt": "请描述这张图片的主要内容"
  }
}
```

### 2. health_check
检查MCP服务健康状态

**参数:** 无

**返回:**
```json
{
  "status": "healthy",
  "api_connected": true,
  "model": "Qwen2.5-VL-7B-Instruct",
  "base_url": "http://10.33.15.1:8808/v1",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 3. server_info
获取MCP服务器信息

**参数:** 无

**返回:**
```json
{
  "name": "Custom Vision MCP Server",
  "version": "2.0.0",
  "framework": "FastMCP",
  "model": "Qwen2.5-VL-7B-Instruct",
  "base_url": "http://10.33.15.1:8808/v1",
  "tools": ["analyze_image", "health_check", "server_info"],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔗 客户端配置

### Dify配置

使用 `dify-fastmcp-config.json`:

```json
{
  "mcpServers": {
    "fastmcp-vision-server": {
      "type": "streamable-http",
      "url": "http://3.136.170.51:8796/mcp",
      "headers": {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    }
  }
}
```

### Cursor配置

使用 `cursor-fastmcp-config.json`:

```json
{
  "mcpServers": {
    "fastmcp-vision-server": {
      "command": "node",
      "args": ["/workspace/fastmcp-vision-server.js"],
      "env": {
        "CUSTOM_API_KEY": "your-actual-api-key-here",
        "CUSTOM_BASE_URL": "http://10.33.15.1:8808/v1",
        "CUSTOM_MODEL": "Qwen2.5-VL-7B-Instruct"
      }
    }
  }
}
```

## 🧪 测试

### 运行测试脚本
```bash
node test-fastmcp-server.js
```

### 手动测试
```bash
# 测试工具列表
curl -X POST http://localhost:8796/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

# 测试健康检查
curl -X POST http://localhost:8796/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"health_check","arguments":{}}}'
```

## 🔧 故障排除

### 1. API密钥错误
```
错误：请在代码中设置正确的CUSTOM_API_KEY
```
**解决:** 编辑 `fastmcp-vision-server.js` 设置正确的API密钥

### 2. 网络连接问题
```
外部连接超时
```
**解决:** 
- 检查防火墙设置: `sudo ufw allow 8796`
- 检查云服务器安全组配置
- 使用正确的IP地址

### 3. 模型API连接失败
```
API连接失败
```
**解决:**
- 检查 `CUSTOM_BASE_URL` 是否正确
- 检查模型服务器是否运行
- 检查API密钥是否有效

## 📊 性能优化

### 1. 并发处理
FastMCP自动处理并发请求，无需额外配置

### 2. 错误重试
内置错误处理和重试机制

### 3. 资源管理
自动管理连接池和资源清理

## 🔄 与原始版本对比

| 特性 | 原始版本 | FastMCP版本 |
|------|----------|-------------|
| 框架 | 手动实现 | FastMCP框架 |
| 代码量 | ~300行 | ~150行 |
| 协议支持 | 部分 | 完整 |
| 错误处理 | 基础 | 完善 |
| 并发支持 | 手动 | 自动 |
| 维护性 | 中等 | 高 |

## 📝 更新日志

### v2.0.0 (FastMCP版本)
- 使用FastMCP框架重写
- 添加健康检查和服务器信息工具
- 完善错误处理机制
- 支持自动并发处理
- 简化配置和部署

### v1.0.0 (原始版本)
- 基础MCP服务器实现
- 图片分析功能
- HTTP和stdio模式支持