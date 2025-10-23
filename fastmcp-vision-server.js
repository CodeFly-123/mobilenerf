#!/usr/bin/env node

import { FastMCP } from 'fastmcp/dist/FastMCP.js';
import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置参数
const CUSTOM_API_KEY = "your-actual-api-key-here";  // 请替换为您的实际API密钥
const CUSTOM_BASE_URL = "http://10.33.15.1:8808/v1";
const CUSTOM_MODEL = "Qwen2.5-VL-7B-Instruct";
const HTTP_PORT = 8796;
const HTTP_HOST = "0.0.0.0";

// 验证API密钥
if (!CUSTOM_API_KEY || CUSTOM_API_KEY === "your-actual-api-key-here") {
    console.error("错误：请在代码中设置正确的CUSTOM_API_KEY");
    console.error("请编辑 fastmcp-vision-server.js 文件，将 'your-actual-api-key-here' 替换为您的实际API密钥");
    process.exit(1);
}

// 创建OpenAI客户端
const openai = new OpenAI({
    apiKey: CUSTOM_API_KEY,
    baseURL: CUSTOM_BASE_URL,
});

// 创建FastMCP服务器
const mcp = new FastMCP({
    name: "Custom Vision MCP Server",
    tools: [],
    prompts: [],
    resources: [],
    resourcesTemplates: [],
    logger: console
});

// 图片分析工具
mcp.addTool({
    name: "analyze_image",
    description: "分析图片内容并提供详细描述",
    parameters: {
    type: "object",
    properties: {
        image: {
            type: "string",
            description: "图片URL或本地文件路径"
        },
        prompt: {
            type: "string",
            description: "对图片的问题或分析要求",
            default: "请描述这张图片的内容"
        }
    },
    required: ["image"]
},
async (args) => {
    try {
        console.log(`[FastMCP] 开始分析图片: ${args.image}`);
        console.log(`[FastMCP] 分析提示: ${args.prompt}`);
        
        // 处理图片数据
        let imageData;
        if (args.image.startsWith('http')) {
            // 网络图片URL
            imageData = args.image;
        } else if (args.image.startsWith('data:')) {
            // Base64编码的图片
            imageData = args.image;
        } else {
            // 本地文件路径
            const imagePath = path.resolve(args.image);
            if (!fs.existsSync(imagePath)) {
                throw new Error(`图片文件不存在: ${imagePath}`);
            }
            
            // 读取图片文件并转换为base64
            const imageBuffer = fs.readFileSync(imagePath);
            const base64Image = imageBuffer.toString('base64');
            const mimeType = getMimeType(imagePath);
            imageData = `data:${mimeType};base64,${base64Image}`;
        }
        
        // 调用OpenAI API进行图片分析
        const response = await openai.chat.completions.create({
            model: CUSTOM_MODEL,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: args.prompt || "请详细描述这张图片的内容，包括主要对象、场景、颜色、构图等元素。"
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageData
                            }
                        }
                    ]
                }
            ],
            max_tokens: 2000,
            temperature: 0.7
        });
        
        const analysis = response.choices[0].message.content;
        console.log(`[FastMCP] 图片分析完成，结果长度: ${analysis.length} 字符`);
        
        return {
            success: true,
            analysis: analysis,
            model: CUSTOM_MODEL,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error(`[FastMCP] 图片分析失败:`, error.message);
        return {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
});

// 获取文件MIME类型
function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.bmp': 'image/bmp'
    };
    return mimeTypes[ext] || 'image/jpeg';
}

// 健康检查工具
mcp.tool("health_check", "检查MCP服务健康状态", {
    type: "object",
    properties: {},
    required: []
}, async () => {
    try {
        // 测试API连接
        const testResponse = await openai.chat.completions.create({
            model: CUSTOM_MODEL,
            messages: [{ role: "user", content: "Hello" }],
            max_tokens: 10
        });
        
        return {
            status: "healthy",
            api_connected: true,
            model: CUSTOM_MODEL,
            base_url: CUSTOM_BASE_URL,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            status: "unhealthy",
            api_connected: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
});

// 服务器信息工具
mcp.tool("server_info", "获取MCP服务器信息", {
    type: "object",
    properties: {},
    required: []
}, async () => {
    return {
        name: "Custom Vision MCP Server",
        version: "2.0.0",
        framework: "FastMCP",
        model: CUSTOM_MODEL,
        base_url: CUSTOM_BASE_URL,
        tools: ["analyze_image", "health_check", "server_info"],
        timestamp: new Date().toISOString()
    };
});

// 启动服务器
async function startServer() {
    try {
        console.log("🚀 FastMCP Vision Server 启动中...");
        console.log(`📡 API Base URL: ${CUSTOM_BASE_URL}`);
        console.log(`🤖 Model: ${CUSTOM_MODEL}`);
        console.log(`🔑 API Key: ${CUSTOM_API_KEY.substring(0, 8)}...`);
        
        // 检查是否启用HTTP模式
        if (process.argv.includes('--http')) {
            console.log(`🌐 HTTP Server: http://${HTTP_HOST}:${HTTP_PORT}`);
            await mcp.serveHTTP(HTTP_PORT, HTTP_HOST);
        } else {
            console.log("📡 使用stdio模式");
            await mcp.serve();
        }
        
        console.log("✅ FastMCP Vision Server 启动成功!");
        
    } catch (error) {
        console.error("❌ 服务器启动失败:", error.message);
        process.exit(1);
    }
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的Promise拒绝:', reason);
    process.exit(1);
});

// 启动服务器
startServer();