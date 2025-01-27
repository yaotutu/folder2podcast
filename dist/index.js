#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const env_1 = require("./utils/env");
async function main() {
    try {
        // 获取环境变量配置
        const config = (0, env_1.getEnvConfig)();
        // 输出当前配置信息
        console.log('当前配置：', {
            AUDIO_DIR: config.AUDIO_DIR,
            PORT: config.PORT
        });
        const server = new server_1.PodcastServer(config.AUDIO_DIR, config.PORT);
        // 优雅关闭服务器
        process.on('SIGINT', async () => {
            console.log('\n正在关闭服务器...');
            await server.stop();
            process.exit(0);
        });
        // 初始化并启动服务器
        console.log('正在初始化播客服务器...');
        await server.initialize();
        console.log(`正在启动服务器 (端口: ${config.PORT})...`);
        await server.start();
    }
    catch (error) {
        console.error('致命错误:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}
// 启动程序
main().catch(error => {
    console.error('未处理的错误:', error);
    process.exit(1);
});
