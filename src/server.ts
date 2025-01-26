import fastify, { FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import pinyin from 'pinyin';
import { ProcessOptions, PodcastSource } from './types';
import { processPodcastSource } from './utils/scanner';
import { generateFeed } from './utils/feed';

export class PodcastServer {
    private server: FastifyInstance;
    private audioDir: string;
    private sources: Map<string, PodcastSource> = new Map();
    private baseUrl: string;
    private port: number;

    constructor(audioDir: string, port: number) {
        this.audioDir = path.resolve(audioDir);
        this.port = port;
        this.baseUrl = `http://localhost:${port}`;
        this.server = fastify({
            logger: true
        });
    }

    private toPinyin(str: string): string {
        return pinyin(str, {
            style: pinyin.STYLE_NORMAL,
            heteronym: false
        }).flat().join('-');
    }

    private formatDate(date: Date): string {
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    private formatPodcastInfo(source: PodcastSource): string {
        const episodes = source.episodes
            .map(ep => `    - [${this.formatDate(ep.pubDate)}] ${ep.fileName}`)
            .join('\n');
        return `
  ${source.config.title}
  ├── 描述: ${source.config.description}
  ├── 作者: ${source.config.author}
  ├── 语言: ${source.config.language}
  ├── RSS: ${this.baseUrl}/audio/${source.dirName}/feed.xml
  ├── 剧集数: ${source.episodes.length}
  └── 剧集列表:
${episodes}`;
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
        console.log('播客列表API: /podcasts');
    }

    public async initialize(): Promise<void> {
        // 注册静态文件服务中间件
        await this.server.register(fastifyStatic, {
            root: this.audioDir,
            prefix: '/audio/',
            decorateReply: false
        });

        // 处理所有播客源
        const options: ProcessOptions = {
            baseUrl: this.baseUrl
        };

        // API路由: 获取所有播客列表
        this.server.get('/podcasts', async () => {
            const podcasts = Array.from(this.sources.values()).map(source => ({
                title: source.config.title,
                description: source.config.description,
                slug: this.toPinyin(source.dirName),
                coverUrl: source.coverPath
                    ? `/audio/${source.dirName}/cover.jpg`
                    : undefined,
                feedUrl: `/audio/${source.dirName}/feed.xml`,
                episodeCount: source.episodes.length,
                latestEpisodeDate: source.episodes.length > 0
                    ? source.episodes[source.episodes.length - 1].pubDate
                    : null
            }));
            return { podcasts };
        });

        // 初始化时扫描并处理所有播客源
        try {
            const dirs = await this.scanPodcastDirs();
            for (const dir of dirs) {
                const source = await processPodcastSource(
                    path.join(this.audioDir, dir)
                );
                this.sources.set(dir, source);

                // 生成并保存feed文件
                const feed = await generateFeed(source, {
                    baseUrl: `${this.baseUrl}/audio/${dir}`
                });
                const feedPath = path.join(this.audioDir, dir, 'feed.xml');
                await this.saveFeed(feedPath, feed);

                this.server.log.info(`Processed podcast source: ${dir}`);
            }

            // 显示发现的播客列表
            this.displayPodcastList();
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
}