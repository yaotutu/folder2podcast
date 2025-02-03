import fastify, { FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { ProcessOptions, PodcastSource } from './types';
import { processPodcastSource } from './utils/scanner';
import { generateFeed } from './utils/feed';
import { getEnvConfig } from './utils/env';

// 设置默认封面路径为assets中的图片
const DEFAULT_COVER = '/assets/default-cover.png';  // 保持不变，因为现在在 src/assets 下

export class PodcastServer {
    private server: FastifyInstance;
    private audioDir: string;
    private sources: Map<string, PodcastSource> = new Map();
    private aliasMap: Map<string, string> = new Map(); // 存储别名到原始路径的映射
    private baseUrl: string;
    private port: number;

    constructor(audioDir: string, port: number) {
        this.audioDir = path.resolve(audioDir);
        this.port = port;
        const config = getEnvConfig();
        this.baseUrl = config.BASE_URL;
        this.server = fastify({
            logger: true
        });
    }

    private formatDate(date: Date): string {
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    private formatPodcastInfo(source: PodcastSource): string {
        const episodeCount = source.episodes.length;
        const coverInfo = source.coverPath ? '✓' : '✗';

        return `
  ${source.config.title}
  ├── 描述: ${source.config.description}
  ├── 作者: ${source.config.author}
  ├── 语言: ${source.config.language}
  ├── 封面: ${coverInfo}
  ├── 剧集数: ${episodeCount}
  ├── 文件夹名: ${source.dirName}
  ├── 别名: ${source.config.alias || '无'}
  ├── RSS地址1: ${this.baseUrl}/audio/${encodeURIComponent(source.dirName)}/feed.xml
  └── RSS地址2: ${source.config.alias ? this.baseUrl + '/audio/' + source.config.alias + '/feed.xml' : '无'}`;
    }

    private displayPodcastList(): void {
        if (this.sources.size === 0) {
            console.log('\n未发现任何播客源！请确保音频文件夹结构正确。');
            return;
        }

        console.log('\n发现以下播客源:');
        console.log('='.repeat(50));

        for (const source of this.sources.values()) {
            console.log(this.formatPodcastInfo(source));
            console.log('='.repeat(50));
        }

        console.log(`\n总共发现 ${this.sources.size} 个播客源`);
        console.log(`服务器地址: ${this.baseUrl}`);
        console.log('播客列表API: /podcasts\n');
    }

    private async processSources(): Promise<void> {
        // 清空现有源
        this.sources.clear();
        this.aliasMap.clear();

        // 扫描并处理所有播客源
        const dirs = await this.scanPodcastDirs();
        for (const dir of dirs) {
            const source = await processPodcastSource(
                path.join(this.audioDir, dir)
            );
            this.sources.set(dir, source);

            const alias = source.config.alias;
            if (alias) {
                if (this.aliasMap.has(alias)) {
                    throw new Error(`Duplicate alias "${alias}" found. Aliases must be unique.`);
                }
                this.aliasMap.set(alias, dir);
            }

            // 生成并保存feed文件
            const feed = await generateFeed(source, {
                baseUrl: this.baseUrl,
                defaultCover: `${this.baseUrl}${DEFAULT_COVER}`
            });
            const feedPath = path.join(this.audioDir, dir, 'feed.xml');
            await this.saveFeed(feedPath, feed);
        }

        // 显示更新后的播客列表
        this.displayPodcastList();
    }

    public async initialize(): Promise<void> {
        try {
            // 注册静态文件服务中间件 - 处理 src 目录下的所有静态文件
            await this.server.register(fastifyStatic, {
                root: path.join(__dirname),  // src 目录
                prefix: '/',
                decorateReply: false
            });

            // 处理所有播客源
            await this.processSources();

            // 设置别名路由处理器
            for (const [alias, originalDir] of this.aliasMap.entries()) {
                const prefix = `/audio/${alias}/`;
                this.server.get(`${prefix}*`, async (request, reply) => {
                    const originalPath = request.url.replace(alias, encodeURIComponent(originalDir));
                    return reply.redirect(301, originalPath);
                });
            }

            // 注册静态文件服务中间件 - 处理音频文件
            await this.server.register(fastifyStatic, {
                root: this.audioDir,
                prefix: '/audio/',
                decorateReply: false
            });

            // API路由: 获取所有播客列表
            this.server.get('/podcasts', async () => {
                const podcasts = Array.from(this.sources.values()).map(source => ({
                    title: source.config.title,
                    description: source.config.description,
                    dirName: source.dirName,
                    alias: source.config.alias,
                    coverUrl: source.coverPath
                        ? `/audio/${encodeURIComponent(source.dirName)}/cover.jpg`
                        : DEFAULT_COVER,
                    feedUrl: {
                        original: `${this.baseUrl}/audio/${encodeURIComponent(source.dirName)}/feed.xml`,
                        alias: source.config.alias ? `${this.baseUrl}/audio/${source.config.alias}/feed.xml` : null
                    },
                    episodeCount: source.episodes.length,
                    latestEpisodeDate: source.episodes.length > 0
                        ? source.episodes[source.episodes.length - 1].pubDate
                        : null
                }));
                return { podcasts };
            });

            // 添加根路径重定向
            this.server.get('/', async (request, reply) => {
                return reply.redirect('/public/index.html');
            });
        } catch (error) {
            this.server.log.error('Error processing podcast sources:', error);
            throw error;
        }
    }

    private async scanPodcastDirs(): Promise<string[]> {
        const { readdir, stat } = await import('fs/promises');
        const entries = await readdir(this.audioDir);
        const dirs = [];

        for (const entry of entries) {
            const fullPath = path.join(this.audioDir, entry);
            try {
                const stats = await stat(fullPath);
                if (stats.isDirectory()) {
                    dirs.push(entry);
                }
            } catch (error) {
                this.server.log.warn(`Failed to stat ${entry}:`, error);
                continue;
            }
        }

        return dirs;
    }

    private async saveFeed(feedPath: string, feed: string): Promise<void> {
        const { writeFile } = await import('fs/promises');
        await writeFile(feedPath, feed, 'utf-8');
    }

    public async start(): Promise<void> {
        try {
            const address = await this.server.listen({
                port: this.port,
                host: '0.0.0.0'
            });
            this.server.log.info(`Server listening at ${address}`);
        } catch (err) {
            this.server.log.error(err);
            process.exit(1);
        }
    }

    public async stop(): Promise<void> {
        await this.server.close();
    }

    public get audioDirectory(): string {
        return this.audioDir;
    }

    public async reprocessSources(): Promise<void> {
        try {
            await this.processSources();
        } catch (error) {
            this.server.log.error('Error reprocessing podcast sources:', error);
            throw error;
        }
    }
}