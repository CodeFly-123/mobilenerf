#!/usr/bin/env node

// FastMCP服务器测试脚本
import http from 'http';

console.log('🧪 FastMCP服务器测试开始...\n');

// 测试MCP协议方法
const testCases = [
    {
        name: 'tools/list',
        request: {
            jsonrpc: "2.0",
            id: 1,
            method: "tools/list",
            params: {}
        }
    },
    {
        name: 'tools/call - analyze_image',
        request: {
            jsonrpc: "2.0",
            id: 2,
            method: "tools/call",
            params: {
                name: "analyze_image",
                arguments: {
                    image: "https://example.com/test.jpg",
                    prompt: "请描述这张图片"
                }
            }
        }
    },
    {
        name: 'tools/call - health_check',
        request: {
            jsonrpc: "2.0",
            id: 3,
            method: "tools/call",
            params: {
                name: "health_check",
                arguments: {}
            }
        }
    },
    {
        name: 'tools/call - server_info',
        request: {
            jsonrpc: "2.0",
            id: 4,
            method: "tools/call",
            params: {
                name: "server_info",
                arguments: {}
            }
        }
    }
];

// 发送HTTP请求
function makeRequest(request) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 8796,
            path: '/mcp',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve(response);
                } catch (e) {
                    reject(new Error(`响应解析失败: ${data}`));
                }
            });
        });
        
        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('请求超时'));
        });
        
        req.write(JSON.stringify(request));
        req.end();
    });
}

// 运行测试
async function runTests() {
    console.log('1. 测试本地连接...');
    
    for (const testCase of testCases) {
        console.log(`\n   测试 ${testCase.name}...`);
        
        try {
            const response = await makeRequest(testCase.request);
            
            if (response.error) {
                console.log(`   ❌ ${testCase.name} 失败:`, response.error.message);
            } else {
                console.log(`   ✅ ${testCase.name} 成功`);
                if (response.result) {
                    console.log(`   📋 结果:`, JSON.stringify(response.result, null, 2));
                }
            }
        } catch (error) {
            console.log(`   ❌ ${testCase.name} 失败:`, error.message);
        }
    }
    
    console.log('\n2. 测试外部连接...');
    
    try {
        const externalResponse = await makeExternalRequest();
        console.log('   ✅ 外部连接成功');
        console.log('   📋 响应:', JSON.stringify(externalResponse, null, 2));
    } catch (error) {
        console.log('   ❌ 外部连接失败:', error.message);
        console.log('   💡 这可能是网络或防火墙问题');
    }
    
    console.log('\n🎯 测试完成!');
}

// 测试外部连接
function makeExternalRequest() {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: '3.136.170.51',
            port: 8796,
            path: '/mcp',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 5000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve(response);
                } catch (e) {
                    reject(new Error(`响应解析失败: ${data}`));
                }
            });
        });
        
        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('外部连接超时'));
        });
        
        req.write(JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "tools/list",
            params: {}
        }));
        req.end();
    });
}

// 运行测试
runTests().catch(console.error);