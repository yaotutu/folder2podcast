"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFeed = generateFeed;
const feed_1 = require("feed");
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
async function getFileSize(filePath) {
    try {
        const stats = await fs_extra_1.default.stat(filePath);
        return stats.size;
    }
    catch (error) {
        console.warn(`Failed to get file size for ${filePath}:`, error);
        return 0;
    }
}
async function generateFeed(source, options) {
    const { config, episodes, coverPath } = source;
    const { baseUrl, defaultCover } = options;
    // 使用封面图片或默认封面
    const feedImage = coverPath
        ? `${baseUrl}/audio/${encodeURIComponent(source.dirName)}/cover.jpg`
        : defaultCover;
    // 创建Feed实例
    const feed = new feed_1.Feed({
        title: config.title,
        description: config.description,
        id: baseUrl,
        link: config.websiteUrl || baseUrl,
        language: config.language,
        image: feedImage,
        favicon: feedImage,
        copyright: `All rights reserved ${new Date().getFullYear()}, ${config.author}`,
        updated: new Date(),
        generator: 'Folder2Cast',
        feedLinks: {
            rss: `${baseUrl}/audio/${encodeURIComponent(source.dirName)}/feed.xml`
        },
        author: {
            name: config.author,
            email: config.email,
            link: config.websiteUrl || baseUrl
        }
    });
    // 添加iTunes特定标签
    feed.addExtension({
        name: '_xmlns:itunes',
        objects: {
            'xmlns:itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd'
        }
    });
    const itunesExtension = {
        'itunes:author': config.author,
        'itunes:category': {
            _attr: { text: config.category }
        },
        'itunes:explicit': config.explicit ? 'yes' : 'no',
        'itunes:owner': {
            'itunes:name': config.author,
            'itunes:email': config.email
        },
        'itunes:summary': config.description,
        'itunes:image': {
            _attr: { href: feedImage }
        }
    };
    feed.addExtension({
        name: '_iTunes',
        objects: itunesExtension
    });
    // 添加每个剧集
    for (const episode of episodes) {
        const episodeUrl = `${baseUrl}/audio/${encodeURIComponent(source.dirName)}/${encodeURIComponent(episode.fileName)}`;
        const fileSize = await getFileSize(episode.filePath);
        feed.addItem({
            title: episode.title,
            id: episodeUrl,
            link: episodeUrl,
            description: episode.title,
            content: episode.title,
            date: episode.pubDate,
            author: [
                {
                    name: config.author,
                    email: config.email,
                    link: config.websiteUrl || baseUrl
                }
            ],
            enclosure: {
                url: episodeUrl,
                type: getMediaType(episode.fileName),
                length: fileSize
            },
            extensions: [
                {
                    name: '_iTunes',
                    objects: {
                        'itunes:author': config.author,
                        'itunes:subtitle': episode.title,
                        'itunes:summary': episode.title,
                        'itunes:duration': '00:00:00',
                        'itunes:explicit': config.explicit ? 'yes' : 'no',
                        'itunes:episodeType': 'full'
                    }
                }
            ]
        });
    }
    // 生成RSS XML
    return feed.rss2();
}
function getMediaType(fileName) {
    const ext = path_1.default.extname(fileName).toLowerCase();
    switch (ext) {
        case '.mp3':
            return 'audio/mpeg';
        case '.m4a':
            return 'audio/x-m4a';
        case '.wav':
            return 'audio/wav';
        default:
            return 'audio/mpeg';
    }
}
