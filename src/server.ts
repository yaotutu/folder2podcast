import fastify, { FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import pinyin from 'pinyin';
import { ProcessOptions, PodcastSource } from './types';
import { processPodcastSource } from './utils/scanner';
import { generateFeed } from './utils/feed';

const DEFAULT_COVER = 'https://cdn.pixabay.com/photo/2019/07/04/06/26/podcast-4315494_1280.jpg';

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
        // 将特殊字符替换为空格，然后转换为拼音
        const cleaned = str.replace(/[^\w\u4e00-\u9fff]/g, ' ');
        return pinyin(cleaned, {
            style: pinyin.STYLE_NORMAL,
            heteronym: false
        })
            .flat()
            .join('-')
            .replace(/\s+/g, '-') // 将连续的空格替换为单个连字符
            .replace(/-+/g, '-')  // 将连续的连字符替换为单个连字符
            .toLowerCase();
    }

    private formatDate(date: Date): string {
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    private getFeedUrl(dirName: string): string {
        const encodedName = encodeURIComponent(dirName);
        return `${this.baseUrl}/audio/${encodedName}/feed.xml`;
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
  ├── 拼音路径: ${this.toPinyin(source.dirName)}
  └── RSS地址: ${this.getFeedUrl(source.dirName)}`;
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

    public async initialize(): Promise<void> {
        // 注册静态文件服务中间件
        await this.server.register(fastifyStatic, {
            root: this.audioDir,
            prefix: '/audio/',
            decorateReply: false
        });

        // 处理所有播客源
        const options: ProcessOptions = {
            baseUrl: this.baseUrl,
            defaultCover: DEFAULT_COVER
        };

        // API路由: 获取所有播客列表
        this.server.get('/podcasts', async () => {
            const podcasts = Array.from(this.sources.values()).map(source => ({
                title: source.config.title,
                description: source.config.description,
                dirName: source.dirName,
                slug: this.toPinyin(source.dirName),
                coverUrl: source.coverPath
                    ? `/audio/${source.dirName}/cover.jpg`
                    : DEFAULT_COVER,
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
                const feed = await generateFeed(source, options);
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