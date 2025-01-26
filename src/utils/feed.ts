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
    const { baseUrl } = options;

    const feedImage = coverPath
        ? `${baseUrl}/${path.basename(source.dirPath)}/cover.jpg`
        : undefined;

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
        image: feedImage,
        favicon: feedImage,
        copyright: `All rights reserved ${new Date().getFullYear()}, ${config.author}`,
        updated: updateDate,
        generator: 'Folder2Cast',
        feedLinks: {
            rss: `${baseUrl}/${path.basename(source.dirPath)}/feed.xml`
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

    const itunesExtension: any = {
        'itunes:author': config.author,
        'itunes:category': {
            _attr: { text: config.category }
        },
        'itunes:explicit': config.explicit ? 'yes' : 'no',
        'itunes:owner': {
            'itunes:name': config.author,
            'itunes:email': config.email
        },
        'itunes:summary': config.description
    };

    // 只有在有封面图片时添加图片标签
    if (feedImage) {
        itunesExtension['itunes:image'] = {
            _attr: { href: feedImage }
        };
    }

    feed.addExtension({
        name: '_iTunes',
        objects: itunesExtension
    });

    // 添加每个剧集
    for (const episode of episodes) {
        const episodeUrl = `${baseUrl}/${path.basename(source.dirPath)}/${episode.fileName}`;
        const fileSize = await getFileSize(episode.filePath);

        feed.addItem({
            title: episode.title,
            id: episodeUrl,
            link: episodeUrl,
            description: episode.title,
            content: episode.title,
            date: episode.pubDate, // 使用生成的发布日期
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
                        'itunes:duration': '00:00:00', // 这里可以添加实际音频时长
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