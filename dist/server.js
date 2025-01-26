"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PodcastServer = void 0;
const fastify_1 = __importDefault(require("fastify"));
const static_1 = __importDefault(require("@fastify/static"));
const path_1 = __importDefault(require("path"));
const pinyin_1 = __importDefault(require("pinyin"));
const scanner_1 = require("./utils/scanner");
const feed_1 = require("./utils/feed");
const DEFAULT_COVER = 'https://cdn.pixabay.com/photo/2019/07/04/06/26/podcast-4315494_1280.jpg';
class PodcastServer {
    constructor(audioDir, port) {
        this.sources = new Map();
        this.audioDir = path_1.default.resolve(audioDir);
        this.port = port;
        this.baseUrl = `http://localhost:${port}`;
        this.server = (0, fastify_1.default)({
            logger: true
        });
    }
    toPinyin(str) {
        // 将特殊字符替换为空格，然后转换为拼音
        const cleaned = str.replace(/[^\w\u4e00-\u9fff]/g, ' ');
        return (0, pinyin_1.default)(cleaned, {
            style: pinyin_1.default.STYLE_NORMAL,
            heteronym: false
        })
            .flat()
            .join('-')
            .replace(/\s+/g, '-') // 将连续的空格替换为单个连字符
            .replace(/-+/g, '-') // 将连续的连字符替换为单个连字符
            .toLowerCase();
    }
    formatDate(date) {
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
    getFeedUrl(dirName) {
        const encodedName = encodeURIComponent(dirName);
        return `${this.baseUrl}/audio/${encodedName}/feed.xml`;
    }
    formatPodcastInfo(source) {
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
    displayPodcastList() {
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
    async initialize() {
        // 注册静态文件服务中间件
        await this.server.register(static_1.default, {
            root: this.audioDir,
            prefix: '/audio/',
            decorateReply: false
        });
        // 处理所有播客源
        const options = {
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
                const source = await (0, scanner_1.processPodcastSource)(path_1.default.join(this.audioDir, dir));
                this.sources.set(dir, source);
                // 生成并保存feed文件
                const feed = await (0, feed_1.generateFeed)(source, options);
                const feedPath = path_1.default.join(this.audioDir, dir, 'feed.xml');
                await this.saveFeed(feedPath, feed);
                this.server.log.info(`Processed podcast source: ${dir}`);
            }
            // 显示发现的播客列表
            this.displayPodcastList();
        }
        catch (error) {
            this.server.log.error('Error processing podcast sources:', error);
            throw error;
        }
    }
    async scanPodcastDirs() {
        const { readdir, stat } = await Promise.resolve().then(() => __importStar(require('fs/promises')));
        const entries = await readdir(this.audioDir);
        const dirs = [];
        for (const entry of entries) {
            const fullPath = path_1.default.join(this.audioDir, entry);
            try {
                const stats = await stat(fullPath);
                if (stats.isDirectory()) {
                    dirs.push(entry);
                }
            }
            catch (error) {
                this.server.log.warn(`Failed to stat ${entry}:`, error);
                continue;
            }
        }
        return dirs;
    }
    async saveFeed(feedPath, feed) {
        const { writeFile } = await Promise.resolve().then(() => __importStar(require('fs/promises')));
        await writeFile(feedPath, feed, 'utf-8');
    }
    async start() {
        try {
            const address = await this.server.listen({
                port: this.port,
                host: '0.0.0.0'
            });
            this.server.log.info(`Server listening at ${address}`);
        }
        catch (err) {
            this.server.log.error(err);
            process.exit(1);
        }
    }
    async stop() {
        await this.server.close();
    }
}
exports.PodcastServer = PodcastServer;
