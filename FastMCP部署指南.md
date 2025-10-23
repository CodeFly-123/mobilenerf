# FastMCP Vision Server 部署指南

## 🎯 概述

基于FastMCP框架的视觉MCP服务器，相比原始版本有以下优势：

- ✅ **代码更简洁**: 从300行减少到150行
- ✅ **协议更完整**: 支持完整的MCP协议标准
- ✅ **错误处理更完善**: 自动重试和错误恢复
- ✅ **并发处理更高效**: 自动管理请求队列
- ✅ **维护性更好**: 基于成熟框架，易于扩展

## 🚀 快速开始

### 1. 设置API密钥

```bash
# 编辑配置文件
nano fastmcp-vision-server.js

# 找到这一行并替换
const CUSTOM_API_KEY = "your-actual-api-key-here";
```

### 2. 启动服务器

#### HTTP模式（推荐用于Dify）
```bash
# 方式1: 直接启动
node fastmcp-vision-server.js --http

# 方式2: 使用启动脚本
./start-fastmcp-server.sh

# 方式3: 后台运行
nohup node fastmcp-vision-server.js --http > fastmcp.log 2>&1 &
```

#### stdio模式（推荐用于Cursor）
```bash
# 直接启动
node fastmcp-vision-server.js
```

### 3. 测试服务器

```bash
# 运行测试脚本
node test-fastmcp-server.js

# 手动测试
curl -X POST http://localhost:8796/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

## 🔧 客户端配置

### Dify配置

1. 在Dify中添加MCP服务
2. 使用以下配置：

```json
{
  "mcpServers": {
    "fastmcp-vision-server": {
      "type": "streamable-http",
      "url": "http://3.136.170.51:8796/mcp"
    }
  }
}
```

**注意**: 请将 `3.136.170.51` 替换为您的实际服务器IP地址

### Cursor配置

1. 在Cursor的MCP设置中添加服务
2. 使用以下配置：

```json
{
  "mcpServers": {
    "fastmcp-vision-server": {
      "command": "node",
      "args": ["/workspace/fastmcp-vision-server.js"]
    }
  }
}
```

## 🛠️ 可用工具

### 1. analyze_image - 图片分析
```json
{
  "name": "analyze_image",
  "arguments": {
    "image": "https://example.com/image.jpg",
    "prompt": "请描述这张图片的主要内容"
  }
}
```

**支持的图片格式:**
- 网络URL: `https://example.com/image.jpg`
- 本地文件: `/path/to/image.jpg`
- Base64: `data:image/jpeg;base64,/9j/4AAQ...`

### 2. health_check - 健康检查
```json
{
  "name": "health_check",
  "arguments": {}
}
```

### 3. server_info - 服务器信息
```json
{
  "name": "server_info",
  "arguments": {}
}
```

## 🔍 故障排除

### 问题1: API密钥错误
```
错误：请在代码中设置正确的CUSTOM_API_KEY
```

**解决方案:**
1. 编辑 `fastmcp-vision-server.js`
2. 将 `your-actual-api-key-here` 替换为实际API密钥
3. 重启服务器

### 问题2: 网络连接失败
```
外部连接超时
```

**解决方案:**
```bash
# 1. 开放防火墙端口
sudo ufw allow 8796

# 2. 检查端口是否监听
netstat -tlnp | grep 8796

# 3. 测试本地连接
curl http://localhost:8796/mcp
```

### 问题3: 模型API连接失败
```
API连接失败
```

**解决方案:**
1. 检查 `CUSTOM_BASE_URL` 是否正确
2. 检查模型服务器是否运行
3. 检查API密钥是否有效

## 📊 性能监控

### 查看服务器状态
```bash
# 查看进程
ps aux | grep fastmcp-vision-server

# 查看日志
tail -f fastmcp.log

# 查看端口使用
netstat -tlnp | grep 8796
```

### 性能测试
```bash
# 运行完整测试
node test-fastmcp-server.js

# 压力测试
for i in {1..10}; do
  curl -X POST http://localhost:8796/mcp \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":'$i',"method":"tools/call","params":{"name":"health_check","arguments":{}}}' &
done
wait
```

## 🔄 与原始版本对比

| 特性 | 原始版本 | FastMCP版本 | 改进 |
|------|----------|-------------|------|
| 代码行数 | ~300行 | ~150行 | 减少50% |
| 协议支持 | 部分 | 完整 | 100%兼容 |
| 错误处理 | 基础 | 完善 | 自动重试 |
| 并发支持 | 手动 | 自动 | 无需配置 |
| 维护性 | 中等 | 高 | 易于扩展 |
| 性能 | 中等 | 高 | 自动优化 |

## 🎯 最佳实践

### 1. 生产环境部署
```bash
# 使用PM2管理进程
npm install -g pm2
pm2 start fastmcp-vision-server.js --name vision-mcp -- --http
pm2 save
pm2 startup
```

### 2. 安全配置
- 使用强API密钥
- 配置防火墙规则
- 定期更新依赖
- 监控访问日志

### 3. 监控和日志
```bash
# 查看PM2状态
pm2 status

# 查看日志
pm2 logs vision-mcp

# 重启服务
pm2 restart vision-mcp
```

## 📝 更新和维护

### 更新FastMCP
```bash
npm update fastmcp
```

### 更新配置
1. 编辑 `fastmcp-vision-server.js`
2. 重启服务
3. 测试功能

### 备份配置
```bash
# 备份配置文件
cp fastmcp-vision-server.js fastmcp-vision-server.js.backup
cp package.json package.json.backup
```

## 🎉 总结

FastMCP版本相比原始版本有显著改进：

1. **更简洁**: 代码量减少50%
2. **更稳定**: 完善的错误处理机制
3. **更高效**: 自动并发处理
4. **更易维护**: 基于成熟框架
5. **更兼容**: 完整的MCP协议支持

推荐在生产环境中使用FastMCP版本，它提供了更好的性能和可维护性。