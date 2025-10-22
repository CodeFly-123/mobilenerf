# Vision MCP Server 配置完成总结

## 配置概述

已成功配置自定义的Vision MCP Server，支持使用您部署的Qwen2.5-VL-7B-Instruct模型，并可通过streamable-http方式连接到Dify的MCP服务工具。

## 关键配置信息

### 1. 模型服务器配置
- **API地址**: `http://10.33.15.1:8808/v1`
- **模型名称**: `Qwen2.5-VL-7B-Instruct`
- **API密钥**: 需要替换为您的实际密钥

### 2. MCP服务配置
- **目标地址**: `http://10.33.15.4:8782/mcp`
- **连接方式**: streamable-http

## 快速启动

### 1. 配置API密钥
编辑 `custom-vision-mcp-server.js` 文件，将API密钥替换为您的实际密钥：
```javascript
const CUSTOM_API_KEY = "your-actual-api-key";  // 替换为您的实际API密钥
```

### 2. 启动MCP服务器
```bash
cd /workspace
node custom-vision-mcp-server.js
```

## Dify MCP服务工具配置

在Dify中配置MCP服务工具时，使用以下配置：

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

## 支持的功能

- **analyze_image**: 分析图片内容并提供详细描述
- **支持格式**: 本地文件(JPG/PNG/GIF/WebP)、在线URL、Base64编码
- **自定义提示**: 可以指定对图片的具体分析要求

## 文件结构

```
/workspace/
├── custom-vision-mcp-server.js    # 主服务器文件
├── package.json                   # 依赖配置
├── start-vision-mcp-server.sh     # 启动脚本
├── dify-mcp-config.json          # Dify配置(stdio方式)
├── streamable-http-config.json   # streamable-http配置
├── test-vision-mcp.js            # 测试脚本
└── README-Vision-MCP.md          # 详细说明文档
```

## 下一步操作

1. **替换API密钥**: 编辑`custom-vision-mcp-server.js`文件，将`your-api-key-here`替换为您的实际API密钥
2. **测试连接**: 运行`node test-vision-mcp.js`测试配置
3. **在Dify中配置**: 使用提供的JSON配置在Dify中设置MCP服务工具
4. **验证功能**: 在Dify中测试图片分析功能

## 注意事项

- 确保您的Qwen2.5-VL-7B-Instruct模型服务器支持OpenAI兼容的API接口
- 网络连接需要稳定，特别是到模型服务器和MCP服务的连接
- 建议在生产环境中使用HTTPS连接

配置已完成，您现在可以在Dify中使用自定义的Vision MCP Server进行图片分析！