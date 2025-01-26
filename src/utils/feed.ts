import { Feed } from 'feed';
import path from 'path';
import fs from 'fs-extra';
import { PodcastSource, ProcessOptions } from '../types';

async function getFileSize(filePath: string): Promise<number> {
    try {
        const stats = await fs.stat(filePath);
        return stats.size;
    } catch (error) {
        console.warn(`Failed to get file size for ${filePath}:`, error);
        return 0;
    }
}

export async function generateFeed(source: PodcastSource, options: ProcessOptions): Promise<string> {
    const { config, episodes, coverPath } = source;
    const { baseUrl, defaultCover } = options;

    // 使用封面图片或默认封面
    const feedImage = coverPath
        ? `${baseUrl}/audio/${encodeURIComponent(path.basename(source.dirPath))}/cover.jpg`
        : defaultCover;

    // 获取最新一集的日期作为Feed更新时间
    const latestEpisode = episodes[episodes.length - 1];
    const updateDate = latestEpisode ? latestEpisode.pubDate : new Date();

    // 创建Feed实例
    const feed = new Feed({
        title: config.title,
        description: config.description,
        id: baseUrl,
        link: config.websiteUrl || baseUrl,
        language: config.language,
        copyright: `All rights reserved ${new Date().getFullYear()}, ${config.author}`,
        updated: updateDate,
        generator: 'Folder2Cast',
        feed: `${baseUrl}/audio/${encodeURIComponent(source.dirName)}/feed.xml`,
        author: {
            name: config.author,
            email: config.email,
            link: config.websiteUrl || baseUrl
        },
        image: feedImage
    });

    // 添加命名空间和根级属性
    feed.addExtension({
        name: '_declaration',
        objects: {
            _attributes: {
                version: '1.0',
                encoding: 'utf-8'
            }
        }
    });

    feed.addExtension({
        name: '_namespace',
        objects: {
            'xmlns:itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd',
            'xmlns:atom': 'http://www.w3.org/2005/Atom'
        }
    });

    // 添加标准RSS image标签
    feed.addExtension({
        name: '_channel',
        objects: {
            'image': {
                'url': feedImage,
                'title': config.title,
                'link': config.websiteUrl || baseUrl
            }
        }
    });

    // 添加iTunes特定标签
    feed.addExtension({
        name: '_iTunes',
        objects: {
            'itunes:image': {
                _attr: { href: feedImage }
            },
            'itunes:category': {
                _attr: { text: config.category }
            },
            'itunes:author': config.author,
            'itunes:summary': config.description,
            'itunes:explicit': config.explicit ? 'yes' : 'no',
            'itunes:owner': {
                'itunes:name': config.author,
                'itunes:email': config.email
            },
            'itunes:type': 'serial'
        }
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

function getMediaType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
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