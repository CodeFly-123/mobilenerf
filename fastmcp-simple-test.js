#!/usr/bin/env node

import { FastMCP } from 'fastmcp/dist/FastMCP.js';

// 创建FastMCP服务器
const mcp = new FastMCP({
    name: "Simple Test Server",
    tools: [
        {
            name: "test_tool",
            description: "测试工具",
            parameters: {
                type: "object",
                properties: {
                    message: {
                        type: "string",
                        description: "测试消息"
                    }
                },
                required: ["message"]
            },
            handler: async (args) => {
                return {
                    success: true,
                    message: `收到消息: ${args.message}`,
                    timestamp: new Date().toISOString()
                };
            }
        }
    ],
    prompts: [],
    resources: [],
    resourcesTemplates: [],
    logger: console
});

// 启动服务器
async function startServer() {
    try {
        console.log("🚀 FastMCP Simple Test Server 启动中...");
        
        // 检查是否启用HTTP模式
        if (process.argv.includes('--http')) {
            console.log(`🌐 HTTP Server: http://0.0.0.0:8796`);
            await mcp.start({
                transportType: "httpStream",
                httpStream: {
                    port: 8796,
                    host: "0.0.0.0"
                }
            });
        } else {
            console.log("📡 使用stdio模式");
            await mcp.start({
                transportType: "stdio"
            });
        }
        
        console.log("✅ FastMCP Simple Test Server 启动成功!");
        
    } catch (error) {
        console.error("❌ 服务器启动失败:", error.message);
        console.error("错误详情:", error);
        process.exit(1);
    }
}

// 启动服务器
startServer();