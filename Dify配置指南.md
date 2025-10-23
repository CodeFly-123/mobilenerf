# Dify MCP服务配置指南

## 🎯 问题诊断

**当前服务器IP**: `3.136.170.51`  
**Dify访问地址**: `10.33.15.3:8796`  
**问题**: IP地址不匹配导致连接失败

## 🔧 解决方案

### 方案1：使用正确IP地址（推荐）

在Dify中使用实际的服务器IP地址：

```
http://3.136.170.51:8796/mcp
```

### 方案2：检查网络配置

1. **确认10.33.15.3是否指向当前服务器**：
   ```bash
   ping 10.33.15.3
   ```

2. **如果10.33.15.3是内网地址，检查路由**：
   ```bash
   ip route show
   ```

### 方案3：配置端口转发

如果需要保持10.33.15.3地址，配置端口转发：

```bash
# 使用iptables配置端口转发
sudo iptables -t nat -A PREROUTING -p tcp --dport 8796 -j DNAT --to-destination 3.136.170.51:8796
sudo iptables -t nat -A POSTROUTING -p tcp -d 3.136.170.51 --dport 8796 -j MASQUERADE
```

## 🚀 启动服务

### 1. 停止当前服务
```bash
pkill -f "custom-vision-mcp-server.js"
```

### 2. 重新启动服务
```bash
cd /workspace
node custom-vision-mcp-server.js --http
```

### 3. 验证服务
```bash
# 测试本地连接
curl -X POST http://localhost:8796/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

# 测试外部连接
curl -X POST http://3.136.170.51:8796/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

## 📋 在Dify中配置

### 使用正确IP地址
```
http://3.136.170.51:8796/mcp
```

### 或者使用配置文件
```json
{
  "mcpServers": {
    "vision-mcp-server": {
      "type": "streamable-http",
      "url": "http://3.136.170.51:8796/mcp"
    }
  }
}
```

## 🔍 故障排除

### 1. 检查防火墙
```bash
sudo ufw status
sudo ufw allow 8796
```

### 2. 检查端口监听
```bash
netstat -tlnp | grep 8796
# 或
ss -tlnp | grep 8796
```

### 3. 检查服务日志
```bash
# 如果使用PM2
pm2 logs vision-mcp

# 如果直接运行
# 查看终端输出
```

## ✅ 验证成功

如果配置正确，您应该看到：

1. **服务启动成功**：
   ```
   Custom Vision MCP Server started successfully
   HTTP Server: http://0.0.0.0:8796/mcp
   ```

2. **Dify连接成功**：
   - 在Dify中能成功添加MCP服务
   - 能看到 `analyze_image` 工具
   - 能正常调用图片分析功能

## 🎉 完成

使用正确的IP地址 `http://3.136.170.51:8796/mcp` 在Dify中配置MCP服务即可！