import fastify, { FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { ProcessOptions, PodcastSource } from './types';
import { processPodcastSource } from './utils/scanner';
import { generateFeed, getFeedStoragePath } from './utils/feed';
import { getEnvConfig } from './utils/env';
import fs from 'fs-extra';

// 设置默认封面路径为assets中的图片
const DEFAULT_COVER = '/image/default-cover.png';

export class PodcastServer {
    private server: FastifyInstance;
    private audioDir: string;
    private sources: Map<string, PodcastSource> = new Map();
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
  └── RSS地址: ${this.baseUrl}/feeds/${encodeURIComponent(source.dirName)}.xml`;
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

        // 扫描并处理所有播客源
        const dirs = await this.scanPodcastDirs();
        for (const dir of dirs) {
            const source = await processPodcastSource(
                path.join(this.audioDir, dir)
            );
            this.sources.set(dir, source);

            // 生成并保存feed文件到新的存储位置
            const feed = await generateFeed(source, {
                baseUrl: this.baseUrl,
                defaultCover: `${this.baseUrl}${DEFAULT_COVER}`
            });
            const feedPath = getFeedStoragePath(source);
            await this.saveFeed(feedPath, feed);
        }

        // 显示更新后的播客列表
        this.displayPodcastList();
    }

    public async initialize(): Promise<void> {
        try {
            // 注册静态文件服务中间件 - 处理静态资源
            await this.server.register(fastifyStatic, {
                root: path.join(__dirname, '../assets'),
                prefix: '/',
                decorateReply: false
            });

            // 注册feed文件的静态服务
            const feedsDir = path.join(process.cwd(), '.feeds');
            await fs.ensureDir(feedsDir);
            await this.server.register(fastifyStatic, {
                root: feedsDir,
                prefix: '/feeds/',
                decorateReply: false
            });

            // 注册音频文件的静态服务
            await this.server.register(fastifyStatic, {
                root: this.audioDir,
                prefix: '/audio/',
                decorateReply: false
            });

            // 处理所有播客源
            await this.processSources();

            // API路由: 获取所有播客列表
            this.server.get('/podcasts', async () => {
                const podcasts = Array.from(this.sources.values()).map(source => ({
                    title: source.config.title,
                    description: source.config.description,
                    dirName: source.dirName,
                    coverUrl: source.coverPath
                        ? `/audio/${encodeURIComponent(source.dirName)}/cover.jpg`
                        : DEFAULT_COVER,
                    feedUrl: `/feeds/${encodeURIComponent(source.dirName)}.xml`,
                    episodeCount: source.episodes.length,
                    latestEpisodeDate: source.episodes.length > 0
                        ? source.episodes[source.episodes.length - 1].pubDate
                        : null
                }));
                return { podcasts };
            });

            // 添加根路径重定向
            this.server.get('/', async (request, reply) => {
                return reply.redirect('/web/index.html');
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
        const feedDir = path.dirname(feedPath);
        await fs.ensureDir(feedDir);  // 确保目录存在
        await fs.writeFile(feedPath, feed, 'utf-8');
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