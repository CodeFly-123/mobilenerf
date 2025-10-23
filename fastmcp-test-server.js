#!/usr/bin/env node

import { FastMCP } from 'fastmcp/dist/FastMCP.js';

// 创建FastMCP服务器
const mcp = new FastMCP("Test FastMCP Server");

// 测试工具
mcp.tool("test_tool", "测试工具", {
    type: "object",
    properties: {
        message: {
            type: "string",
            description: "测试消息"
        }
    },
    required: ["message"]
}, async (args) => {
    return {
        success: true,
        message: `收到消息: ${args.message}`,
        timestamp: new Date().toISOString()
    };
});

// 健康检查工具
mcp.tool("health_check", "健康检查", {
    type: "object",
    properties: {},
    required: []
}, async () => {
    return {
        status: "healthy",
        timestamp: new Date().toISOString()
    };
});

// 启动服务器
async function startServer() {
    try {
        console.log("🚀 FastMCP Test Server 启动中...");
        
        // 检查是否启用HTTP模式
        if (process.argv.includes('--http')) {
            console.log(`🌐 HTTP Server: http://0.0.0.0:8796`);
            await mcp.serveHTTP(8796, "0.0.0.0");
        } else {
            console.log("📡 使用stdio模式");
            await mcp.serve();
        }
        
        console.log("✅ FastMCP Test Server 启动成功!");
        
    } catch (error) {
        console.error("❌ 服务器启动失败:", error.message);
        process.exit(1);
    }
}

// 启动服务器
startServer();