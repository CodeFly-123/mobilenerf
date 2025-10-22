# Dify MCP服务导入指南

## 服务地址
```
http://10.33.15.3:8796/mcp
```

## 在Dify中导入步骤

### 方法1：直接使用URL导入
1. 打开Dify管理界面
2. 进入 **设置** → **模型供应商** 或 **集成** 部分
3. 找到 **MCP服务** 或 **外部工具** 选项
4. 点击 **添加MCP服务**
5. 在URL字段中输入：`http://10.33.15.3:8796/mcp`
6. 点击 **连接** 或 **测试连接**
7. 如果连接成功，点击 **保存**

### 方法2：使用配置文件导入
1. 复制以下JSON配置：
```json
{
  "mcpServers": {
    "vision-mcp-server": {
      "type": "streamable-http",
      "url": "http://10.33.15.3:8796/mcp"
    }
  }
}
```

2. 在Dify的MCP配置界面中导入此配置

## 测试连接

在导入前，您可以先测试连接是否正常：

```bash
# 运行连接测试
node /workspace/test-mcp-connection.js
```

## 功能说明

导入成功后，您将获得以下功能：

### 工具名称：analyze_image
- **描述**：分析图片内容并提供详细描述
- **参数**：
  - `image` (必需)：图片URL或本地文件路径
  - `prompt` (可选)：对图片的问题或分析要求

### 支持的图片格式
- 本地文件：JPG, PNG, GIF, WebP
- 在线URL：HTTP/HTTPS链接
- Base64编码：data URL格式

## 使用示例

在Dify中调用图片分析功能：

```json
{
  "name": "analyze_image",
  "arguments": {
    "image": "https://example.com/image.jpg",
    "prompt": "请详细描述这张图片的内容"
  }
}
```

## 故障排除

如果导入失败，请检查：

1. **网络连接**：确保Dify服务器可以访问 `10.33.15.3:8796`
2. **服务状态**：确保MCP服务正在运行
3. **防火墙**：检查端口8796是否开放
4. **API密钥**：确保已正确配置API密钥

## 注意事项

- 确保您的Qwen2.5-VL-7B-Instruct模型服务器在 `http://10.33.15.1:8808/v1` 可访问
- 建议在生产环境中使用HTTPS连接
- 定期检查服务状态和API密钥有效性