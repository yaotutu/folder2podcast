import { Feed } from 'feed';
import path from 'path';
import { PodcastSource, ProcessOptions } from '../types';

export function generateFeed(source: PodcastSource, options: ProcessOptions): string {
    const { config, episodes, coverPath } = source;
    const { baseUrl } = options;

    const feedImage = coverPath
        ? `${baseUrl}/${path.basename(source.dirPath)}/cover.jpg`
        : undefined;

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
        updated: new Date(),
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

        feed.addItem({
            title: episode.title,
            id: episodeUrl,
            link: episodeUrl,
            description: episode.title,
            content: episode.title,
            author: [
                {
                    name: config.author,
                    email: config.email,
                    link: config.websiteUrl || baseUrl
                }
            ],
            date: new Date(), // 这里可以添加文件的修改时间
            enclosure: {
                url: episodeUrl,
                type: getMediaType(episode.fileName),
                length: 0 // 这里可以添加实际文件大小
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