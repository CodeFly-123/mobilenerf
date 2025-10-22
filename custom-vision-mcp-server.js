#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from 'zod';
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 直接配置API参数（无需环境变量）
const CUSTOM_API_KEY = "your-api-key-here";  // 请替换为您的实际API密钥
const CUSTOM_BASE_URL = "http://10.33.15.1:8808/v1";
const CUSTOM_MODEL = "Qwen2.5-VL-7B-Instruct";

// 检查API密钥是否已配置
if (!CUSTOM_API_KEY || CUSTOM_API_KEY === "your-api-key-here") {
    process.stderr.write("错误：请在代码中设置正确的CUSTOM_API_KEY\n");
    process.stderr.write("请编辑 custom-vision-mcp-server.js 文件，将 'your-api-key-here' 替换为您的实际API密钥\n");
    process.exit(1);
}

// 确保类型安全
const apiKey = CUSTOM_API_KEY;
const baseURL = CUSTOM_BASE_URL;
const model = CUSTOM_MODEL;

/**
 * 文件服务类，处理图片输入
 */
class FileService {
    /**
     * 处理图片输入，支持本地文件和URL
     */
    static async processImageInput(imageInput) {
        try {
            // 如果是URL，直接返回
            if (imageInput.startsWith('http://') || imageInput.startsWith('https://')) {
                return imageInput;
            }
            
            // 如果是data URL，直接返回
            if (imageInput.startsWith('data:')) {
                return imageInput;
            }
            
            // 如果是本地文件路径
            if (fs.existsSync(imageInput)) {
                const imageBuffer = fs.readFileSync(imageInput);
                const imageBase64 = imageBuffer.toString('base64');
                const ext = path.extname(imageInput).toLowerCase();
                let mimeType = 'image/jpeg';
                
                switch (ext) {
                    case '.png':
                        mimeType = 'image/png';
                        break;
                    case '.gif':
                        mimeType = 'image/gif';
                        break;
                    case '.webp':
                        mimeType = 'image/webp';
                        break;
                    case '.jpeg':
                    case '.jpg':
                    default:
                        mimeType = 'image/jpeg';
                        break;
                }
                
                return `data:${mimeType};base64,${imageBase64}`;
            }
            
            throw new Error(`图片文件不存在: ${imageInput}`);
        } catch (error) {
            throw new Error(`处理图片输入失败: ${error.message}`);
        }
    }
}

/**
 * 聊天服务类，处理与自定义API的通信
 */
class ChatService {
    client;
    model;
    
    constructor(apiKey, baseURL, model) {
        this.client = new OpenAI({
            baseURL: baseURL,
            apiKey: apiKey,
        });
        this.model = model;
    }
    
    /**
     * 视觉分析API
     */
    async visionCompletions(imageUrl, prompt, options = {}) {
        try {
            // 处理图片URL，如果是base64格式，需要特殊处理
            let imageContent;
            if (imageUrl.startsWith('data:')) {
                // 处理base64编码的图片
                imageContent = {
                    type: 'image_url',
                    image_url: {
                        url: imageUrl,
                        detail: 'auto'
                    },
                };
            } else {
                // 处理普通URL
                imageContent = {
                    type: 'image_url',
                    image_url: {
                        url: imageUrl,
                        detail: 'auto'
                    },
                };
            }
            
            // 构建消息
            const messages = [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: prompt || "请描述这张图片的内容",
                        },
                        imageContent,
                    ],
                },
            ];
            
            // 调用自定义API
            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: messages,
                stream: false,
                temperature: options.temperature ?? 0.7,
                top_p: options.topP ?? 1.0,
                ...(options.maxTokens && { max_tokens: options.maxTokens })
            });
            
            const result = response.choices[0]?.message?.content;
            if (!result) {
                throw new Error('Invalid API response: missing content');
            }
            
            return result;
        } catch (error) {
            process.stderr.write(`Request custom API for vision analysis failed: ${error.message}\n`);
            throw error instanceof Error ? error : new Error(`API call failed: ${error}`);
        }
    }
}

// 定义参数验证模式
const AnalyzeImageParamsSchema = z.object({
    image: z.string().describe("图片URL或本地文件路径"),
    prompt: z.string().optional().default("请描述这张图片的内容").describe("对图片的问题或分析要求"),
});

/**
 * 图片分析服务类
 */
class ImageAnalysisService {
    chatService;
    
    constructor(apiKey, baseURL, model) {
        this.chatService = new ChatService(apiKey, baseURL, model);
    }
    
    /**
     * 分析图片
     */
    async analyzeImage(params) {
        // 验证参数
        const validatedParams = AnalyzeImageParamsSchema.parse(params);
        
        // 处理图片输入
        const imageUrl = await FileService.processImageInput(validatedParams.image);
        
        // 调用聊天服务进行分析
        return await this.chatService.visionCompletions(imageUrl, validatedParams.prompt);
    }
}

/**
 * 注册图片分析工具到MCP服务器
 */
function registerImageAnalysisTool(server, apiKey, baseURL, model) {
    const imageAnalysisService = new ImageAnalysisService(apiKey, baseURL, model);
    
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
            tools: [
                {
                    name: "analyze_image",
                    description: "分析图片内容并提供详细描述",
                    inputSchema: {
                        type: "object",
                        properties: {
                            image: {
                                type: "string",
                                description: "图片URL或本地文件路径",
                            },
                            prompt: {
                                type: "string",
                                description: "对图片的问题或分析要求",
                                default: "请描述这张图片的内容",
                            },
                        },
                        required: ["image"],
                    },
                },
            ],
        };
    });
    
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        
        if (name === "analyze_image") {
            try {
                const result = await imageAnalysisService.analyzeImage(args);
                return {
                    content: [
                        {
                            type: "text",
                            text: result,
                        },
                    ],
                };
            } catch (error) {
                process.stderr.write(`分析图片时出错: ${error.message}\n`);
                return {
                    content: [
                        {
                            type: "text",
                            text: `分析图片时出错: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        } else {
            return {
                content: [
                    {
                        type: "text",
                        text: `未知工具: ${name}`,
                    },
                ],
                isError: true,
            };
        }
    });
}

/**
 * MCP服务器应用程序类
 */
class McpServerApplication {
    server;
    
    constructor() {
        this.server = new Server({
            name: "custom-vision-mcp-server",
            version: "1.0.0",
            capabilities: {
                tools: {}
            }
        });
        this.setupErrorHandling();
    }
    
    /**
     * 注册所有工具
     */
    async registerTools() {
        try {
            // 注册图片分析工具
            registerImageAnalysisTool(this.server, apiKey, baseURL, model);
        } catch (error) {
            process.stderr.write(`Failed to register tools: ${error.message}\n`);
            throw error;
        }
    }
    
    /**
     * 设置错误处理
     */
    setupErrorHandling() {
        process.on('uncaughtException', (error) => {
            process.stderr.write(`Uncaught exception: ${error.message}\n`);
            this.gracefulShutdown(1);
        });
        
        process.on('unhandledRejection', (reason, promise) => {
            process.stderr.write(`Unhandled rejection: ${reason instanceof Error ? reason.message : String(reason)}\n`);
            this.gracefulShutdown(1);
        });
        
        process.on('SIGINT', () => {
            process.stderr.write("Received SIGINT, shutting down gracefully...\n");
            this.gracefulShutdown(0);
        });
        
        process.on('SIGTERM', () => {
            process.stderr.write("Received SIGTERM, shutting down gracefully...\n");
            this.gracefulShutdown(0);
        });
    }
    
    /**
     * 优雅关闭
     */
    gracefulShutdown(exitCode) {
        try {
            process.stderr.write("Performing graceful shutdown...\n");
            process.exit(exitCode);
        } catch (error) {
            process.stderr.write(`Error during graceful shutdown: ${error.message}\n`);
            process.exit(1);
        }
    }
    
    /**
     * 启动服务器
     */
    async start() {
        try {
            // 注册工具
            await this.registerTools();
            
            // 创建传输层
            const transport = new StdioServerTransport();
            
            // 连接服务器和传输层
            await this.server.connect(transport);
            
            process.stderr.write(`Custom Vision MCP Server started successfully\n`);
            process.stderr.write(`API Base URL: ${baseURL}\n`);
            process.stderr.write(`Model: ${model}\n`);
        } catch (error) {
            process.stderr.write(`Failed to start server: ${error.message}\n`);
            this.gracefulShutdown(1);
        }
    }
}

// 启动应用程序
const app = new McpServerApplication();
app.start().catch((error) => {
    process.stderr.write(`Application error: ${error.message}\n`);
    process.exit(1);
});