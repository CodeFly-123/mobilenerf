#!/usr/bin/env node

// MCP服务诊断脚本
import http from 'http';

const MCP_URL = 'http://10.33.15.3:8796/mcp';
const LOCAL_URL = 'http://localhost:8796/mcp';

console.log('🔍 MCP服务诊断开始...\n');

// 测试本地连接
function testLocalConnection() {
    return new Promise((resolve) => {
        console.log('1. 测试本地连接...');
        const req = http.request({
            hostname: 'localhost',
            port: 8796,
            path: '/mcp',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000
        }, (res) => {
            console.log(`   ✅ 本地连接成功 (状态码: ${res.statusCode})`);
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    console.log('   📋 可用工具:', response.result?.tools?.map(t => t.name).join(', ') || '无');
                    resolve(true);
                } catch (e) {
                    console.log('   ⚠️  响应解析失败:', data);
                    resolve(false);
                }
            });
        });
        
        req.on('error', (error) => {
            console.log(`   ❌ 本地连接失败: ${error.message}`);
            resolve(false);
        });
        
        req.on('timeout', () => {
            console.log('   ❌ 本地连接超时');
            req.destroy();
            resolve(false);
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

// 测试外部连接
function testExternalConnection() {
    return new Promise((resolve) => {
        console.log('\n2. 测试外部连接...');
        const url = new URL(MCP_URL);
        const req = http.request({
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        }, (res) => {
            console.log(`   ✅ 外部连接成功 (状态码: ${res.statusCode})`);
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    console.log('   📋 可用工具:', response.result?.tools?.map(t => t.name).join(', ') || '无');
                    resolve(true);
                } catch (e) {
                    console.log('   ⚠️  响应解析失败:', data);
                    resolve(false);
                }
            });
        });
        
        req.on('error', (error) => {
            console.log(`   ❌ 外部连接失败: ${error.message}`);
            console.log('   💡 可能原因:');
            console.log('      - 服务器防火墙阻止了端口8796');
            console.log('      - 网络连接问题');
            console.log('      - 服务器未正确绑定到0.0.0.0');
            resolve(false);
        });
        
        req.on('timeout', () => {
            console.log('   ❌ 外部连接超时');
            req.destroy();
            resolve(false);
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

// 检查服务器配置
function checkServerConfig() {
    console.log('\n3. 检查服务器配置...');
    console.log('   📍 当前服务器地址: 0.0.0.0:8796');
    console.log('   📍 Dify目标地址: 10.33.15.3:8796');
    console.log('   ⚠️  注意: 服务器绑定到0.0.0.0，但Dify访问10.33.15.3');
    console.log('   💡 建议: 确保10.33.15.3指向当前服务器');
}

// 提供解决方案
function provideSolutions() {
    console.log('\n🔧 解决方案:');
    console.log('1. 检查网络连接:');
    console.log('   ping 10.33.15.3');
    console.log('   telnet 10.33.15.3 8796');
    console.log('');
    console.log('2. 检查防火墙设置:');
    console.log('   sudo ufw allow 8796');
    console.log('   sudo iptables -A INPUT -p tcp --dport 8796 -j ACCEPT');
    console.log('');
    console.log('3. 修改服务器绑定地址:');
    console.log('   编辑 custom-vision-mcp-server.js，将 HTTP_HOST 改为 "10.33.15.3"');
    console.log('');
    console.log('4. 使用PM2管理进程:');
    console.log('   npm install -g pm2');
    console.log('   pm2 start custom-vision-mcp-server.js --name vision-mcp -- --http');
    console.log('   pm2 logs vision-mcp');
}

// 运行诊断
async function runDiagnosis() {
    const localOk = await testLocalConnection();
    const externalOk = await testExternalConnection();
    
    checkServerConfig();
    
    if (localOk && !externalOk) {
        console.log('\n🎯 诊断结果: 本地服务正常，但外部访问失败');
        console.log('   这通常是网络或防火墙问题');
    } else if (!localOk) {
        console.log('\n🎯 诊断结果: 本地服务未启动或配置错误');
        console.log('   请检查服务器是否正在运行');
    } else {
        console.log('\n🎯 诊断结果: 服务运行正常');
        console.log('   如果Dify仍然无法连接，请检查Dify的网络配置');
    }
    
    provideSolutions();
}

runDiagnosis().catch(console.error);