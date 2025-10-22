#!/usr/bin/env node

// 测试自定义vision-mcp-server
import { spawn } from 'child_process';
import fs from 'fs';

console.log('Testing Custom Vision MCP Server...\n');

// 设置环境变量
const env = {
    ...process.env,
    CUSTOM_API_KEY: "your-api-key-here",
    CUSTOM_BASE_URL: "http://10.33.15.1:8808/v1",
    CUSTOM_MODEL: "Qwen2.5-VL-7B-Instruct"
};

// 启动MCP服务器
const mcpServer = spawn('node', ['/workspace/custom-vision-mcp-server.js'], {
    env: env,
    stdio: ['pipe', 'pipe', 'pipe']
});

// 监听服务器输出
mcpServer.stdout.on('data', (data) => {
    console.log('MCP Server Output:', data.toString());
});

mcpServer.stderr.on('data', (data) => {
    console.log('MCP Server Error:', data.toString());
});

// 发送测试请求
setTimeout(() => {
    console.log('\nSending test request...');
    
    // 发送list_tools请求
    const listToolsRequest = {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/list",
        params: {}
    };
    
    mcpServer.stdin.write(JSON.stringify(listToolsRequest) + '\n');
    
    // 等待响应
    setTimeout(() => {
        console.log('\nSending analyze_image request...');
        
        // 发送analyze_image请求
        const analyzeRequest = {
            jsonrpc: "2.0",
            id: 2,
            method: "tools/call",
            params: {
                name: "analyze_image",
                arguments: {
                    image: "https://example.com/test-image.jpg",
                    prompt: "请描述这张图片的内容"
                }
            }
        };
        
        mcpServer.stdin.write(JSON.stringify(analyzeRequest) + '\n');
        
        // 等待响应后关闭
        setTimeout(() => {
            console.log('\nTest completed. Closing server...');
            mcpServer.kill();
        }, 3000);
        
    }, 2000);
    
}, 1000);

// 处理服务器关闭
mcpServer.on('close', (code) => {
    console.log(`\nMCP Server closed with code ${code}`);
});

mcpServer.on('error', (error) => {
    console.error('MCP Server error:', error);
});