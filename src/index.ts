#!/usr/bin/env node
import { PodcastServer } from './server';

async function main() {
    try {
        // 获取命令行参数
        const [, , audioDir = 'audio', portStr = '3000'] = process.argv;
        const port = parseInt(portStr, 10);

        if (isNaN(port)) {
            console.error('错误: 端口号必须是有效的数字');
            console.error('用法: folder2podcast [音频目录] [端口号]');
            console.error('示例: folder2podcast ./podcasts 3000');
            process.exit(1);
        }

        const server = new PodcastServer(audioDir, port);

        // 优雅关闭服务器
        process.on('SIGINT', async () => {
            console.log('\n正在关闭服务器...');
            await server.stop();
            process.exit(0);
        });

        // 初始化并启动服务器
        console.log('正在初始化播客服务器...');
        await server.initialize();

        console.log(`正在启动服务器 (端口: ${port})...`);
        await server.start();

    } catch (error) {
        console.error('致命错误:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

// 启动程序
main().catch(error => {
    console.error('未处理的错误:', error);
    process.exit(1);
});