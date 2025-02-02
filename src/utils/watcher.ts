import chokidar from 'chokidar';
import { PodcastServer } from '../server';

function debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | undefined;

    return function (this: void, ...args: Parameters<T>) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            fn.apply(this, args);
            timeoutId = undefined;
        }, delay);
    };
}

export function watchFolderChanges(server: PodcastServer): void {
    // 创建一个防抖的重新处理函数
    const debouncedReprocess = debounce(async () => {
        console.log('检测到文件变化，正在重新处理播客源...');
        await server.reprocessSources();
    }, 1000);

    // 初始化 watcher
    const watcher = chokidar.watch(server.audioDirectory, {
        // 忽略隐藏文件和 feed.xml
        ignored: [
            /(^|[\/\\])\../,  // 隐藏文件
            '**/feed.xml'      // feed.xml 文件
        ],
        persistent: true,
        ignoreInitial: true,
        ignorePermissionErrors: true,
        // 添加详细的调试信息
        awaitWriteFinish: {
            stabilityThreshold: 2000,
            pollInterval: 100
        }
    });

    // 监听所有可能的文件变化事件
    watcher
        .on('add', (path) => {
            console.log(`[WATCH] 文件被添加: ${path}`);
            debouncedReprocess();
        })
        .on('change', (path) => {
            console.log(`[WATCH] 文件被修改: ${path}`);
            console.log('变更详情:', { path, time: new Date().toISOString() });
            debouncedReprocess();
        })
        .on('unlink', (path) => {
            console.log(`[WATCH] 文件被删除: ${path}`);
            debouncedReprocess();
        })
        // 添加更多事件监听以帮助调试
        .on('error', error => console.log(`[WATCH] 错误: ${error}`))
        .on('raw', (event, path, details) => {
            console.log('[WATCH] Raw event:', { event, path, details });
        });

    console.log(`开始监听文件夹: ${server.audioDirectory}`);
} 