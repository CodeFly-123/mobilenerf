#!/usr/bin/env node

// 测试MCP服务连接
import https from 'https';
import http from 'http';

const MCP_URL = 'http://10.33.15.3:8796/mcp';

console.log('Testing MCP connection to:', MCP_URL);
console.log('=====================================\n');

// 测试连接
function testConnection() {
    return new Promise((resolve, reject) => {
        const url = new URL(MCP_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            console.log(`Status: ${res.statusCode}`);
            console.log(`Headers:`, res.headers);
            
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('Response:', data);
                resolve({ status: res.statusCode, data });
            });
        });

        req.on('error', (error) => {
            console.error('Connection error:', error.message);
            reject(error);
        });

        req.on('timeout', () => {
            console.error('Connection timeout');
            req.destroy();
            reject(new Error('Connection timeout'));
        });

        // 发送测试请求
        const testRequest = {
            jsonrpc: "2.0",
            id: 1,
            method: "tools/list",
            params: {}
        };

        req.write(JSON.stringify(testRequest));
        req.end();
    });
}

// 运行测试
testConnection()
    .then((result) => {
        console.log('\n✅ MCP服务连接成功！');
        console.log('您可以在Dify中使用以下地址导入MCP服务：');
        console.log('http://10.33.15.3:8796/mcp');
    })
    .catch((error) => {
        console.log('\n❌ MCP服务连接失败：');
        console.log('错误信息:', error.message);
        console.log('\n请检查：');
        console.log('1. MCP服务是否在 http://10.33.15.3:8796/mcp 运行');
        console.log('2. 网络连接是否正常');
        console.log('3. 防火墙设置是否正确');
    });