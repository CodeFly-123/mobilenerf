# 自定义Vision MCP Server配置指南

## 概述

本项目配置了一个自定义的Vision MCP Server，用于连接您部署的Qwen2.5-VL-7B-Instruct模型，支持streamable-http方式连接到Dify的MCP服务工具。

## 配置说明

### 1. 模型服务器配置（已内置）
- **模型地址**: `http://10.33.15.1:8808/v1`
- **模型名称**: `Qwen2.5-VL-7B-Instruct`
- **API密钥**: 需要在代码中设置（见下方说明）

### 2. MCP服务配置
- **目标地址**: `http://10.33.15.4:8782/mcp`
- **连接方式**: streamable-http

## 文件说明

### 核心文件
- `custom-vision-mcp-server.js` - 自定义的MCP服务器主文件
- `package.json` - 项目依赖配置
- `start-vision-mcp-server.sh` - 启动脚本

### 配置文件
- `dify-mcp-config.json` - Dify MCP服务工具配置（stdio方式）
- `streamable-http-config.json` - streamable-http方式配置
- `test-vision-mcp.js` - 测试脚本

## 使用方法

### 1. 配置API密钥

在启动前，需要编辑 `custom-vision-mcp-server.js` 文件，将API密钥替换为您的实际密钥：

```javascript
// 在文件顶部找到这行并替换
const CUSTOM_API_KEY = "your-actual-api-key";  // 替换为您的实际API密钥
```

### 2. 启动MCP服务器

#### 方式一：使用启动脚本
```bash
./start-vision-mcp-server.sh
```

#### 方式二：直接启动
```bash
node /workspace/custom-vision-mcp-server.js
```

### 3. 在Dify中配置MCP服务工具

#### 使用streamable-http方式
```json
{
  "mcpServers": {
    "vision-mcp-server": {
      "type": "streamable-http",
      "url": "http://10.33.15.4:8782/mcp"
    }
  }
}
```

#### 使用stdio方式
```json
{
  "mcpServers": {
    "vision-mcp-server": {
      "type": "stdio",
      "command": "node",
      "args": ["/workspace/custom-vision-mcp-server.js"]
    }
  }
}
```

## 功能特性

### 支持的工具
- `analyze_image` - 分析图片内容并提供详细描述

### 参数说明
- `image` (必需): 图片URL或本地文件路径
- `prompt` (可选): 对图片的问题或分析要求，默认为"请描述这张图片的内容"

### 支持的图片格式
- 本地文件: JPG, PNG, GIF, WebP
- 在线URL: HTTP/HTTPS链接
- Base64编码: data URL格式

## 测试

运行测试脚本验证配置：

```bash
node /workspace/test-vision-mcp.js
```

## 故障排除

### 常见问题

1. **API密钥错误**
   - 确保设置了正确的`CUSTOM_API_KEY`环境变量
   - 验证API密钥是否有效

2. **模型服务器连接失败**
   - 检查`CUSTOM_BASE_URL`是否正确
   - 验证模型服务器是否可访问

3. **MCP连接问题**
   - 确认目标MCP服务地址`http://10.33.15.4:8782/mcp`可访问
   - 检查网络连接和防火墙设置

### 日志查看

服务器运行时会在stderr输出日志信息，包括：
- 启动状态
- API调用结果
- 错误信息

## 自定义配置

如需修改配置，可以编辑以下文件：
- 修改模型地址: 编辑`custom-vision-mcp-server.js`中的`CUSTOM_BASE_URL`
- 修改模型名称: 编辑`custom-vision-mcp-server.js`中的`CUSTOM_MODEL`
- 添加新的工具: 在`custom-vision-mcp-server.js`中添加新的工具处理逻辑

## 注意事项

1. 确保您的Qwen2.5-VL-7B-Instruct模型服务器支持OpenAI兼容的API接口
2. 网络连接需要稳定，特别是到模型服务器和MCP服务的连接
3. 建议在生产环境中使用HTTPS连接
4. 定期检查API密钥的有效性