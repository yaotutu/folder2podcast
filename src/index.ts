#!/usr/bin/env node
import { PodcastServer } from './server';
import { getEnvConfig } from './utils/env';
import { watchFolderChanges } from './utils/watcher';


async function main() {
    try {
        // 获取环境变量配置
        const config = getEnvConfig();

        // 输出当前配置信息
        console.log('当前配置：', {
            AUDIO_DIR: config.AUDIO_DIR,
            PORT: config.PORT
        });

        const server = new PodcastServer(config.AUDIO_DIR, config.PORT);

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

        // 开始监听文件夹变化
        watchFolderChanges(server);

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