import path from 'path';
import { Episode, PodcastConfig, EpisodeNumberStrategy } from '../types';
import crypto from 'crypto';
import fs from 'fs';

const BASE_DATE = new Date('2024-12-18T00:00:00.000Z');

// 从文件名开头匹配数字（默认策略之一）
function findPrefixNumber(fileName: string): number | null {
    const match = fileName.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : null;
}

// 从文件扩展名前匹配数字（默认策略之一）
function findSuffixNumber(fileName: string): number | null {
    const match = fileName.match(/(\d+)\.[^/.]+$/);
    return match ? parseInt(match[1], 10) : null;
}

// 从左到右找第一个数字（配置策略）
function findFirstNumber(fileName: string): number | null {
    const match = fileName.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
}

// 从右到左找最后一个数字（配置策略）
function findLastNumber(fileName: string): number | null {
    const matches = fileName.match(/\d+/g);
    return matches ? parseInt(matches[matches.length - 1], 10) : null;
}

// 使用自定义正则表达式（配置策略）
function findNumberByPattern(fileName: string, pattern: string): number | null {
    try {
        const match = fileName.match(new RegExp(pattern));
        if (match && match[1]) {
            return parseInt(match[1], 10);
        }
    } catch (error) {
        console.warn(`Error using custom pattern: ${error}`);
    }
    return null;
}

export function parseEpisodeNumber(fileName: string, config?: PodcastConfig): number | null {
    const strategy = config?.episodeNumberStrategy || 'prefix';

    // 根据策略选择提取方法
    if (typeof strategy === 'string') {
        switch (strategy) {
            case 'prefix':
                return findPrefixNumber(fileName);
            case 'suffix':
                return findSuffixNumber(fileName);
            case 'first':
                return findFirstNumber(fileName);
            case 'last':
                return findLastNumber(fileName);
            default:
                console.warn(`Unknown strategy: ${strategy}, falling back to prefix`);
                return findPrefixNumber(fileName);
        }
    } else if (strategy.pattern) {
        // 使用自定义正则表达式
        const result = findNumberByPattern(fileName, strategy.pattern);
        if (result !== null) {
            return result;
        }
        // 如果自定义正则表达式失败，回退到默认策略
        console.warn(`Custom pattern failed for "${fileName}", falling back to prefix strategy`);
        return findPrefixNumber(fileName);
    }

    // 如果策略无效，使用默认的前缀策略
    return findPrefixNumber(fileName);
}

export function parseEpisodeTitle(fileName: string): string {
    // 移除文件扩展名
    const withoutExt = fileName.replace(/\.[^/.]+$/, '');

    // 如果以数字开头，移除开头的数字和分隔符
    if (withoutExt.match(/^\d+/)) {
        return withoutExt.replace(/^(\d+)[-_.\s]*/, '');
    }

    // 如果以数字结尾，移除结尾的数字和分隔符
    return withoutExt.replace(/[-_.\s]*\d+$/, '');
}

export function generatePubDate(episodeNumber: number): Date {
    // 根据剧集编号增加天数
    const pubDate = new Date(BASE_DATE);
    pubDate.setDate(BASE_DATE.getDate() + episodeNumber - 1);
    return pubDate;
}

function getFileMetadata(filePath: string) {
    const stats = fs.statSync(filePath);
    return {
        // 使用文件的创建时间作为发布日期
        pubDate: new Date(stats.ctimeMs),
        // 使用创建时间的时间戳和文件大小生成一个稳定的排序值
        sortValue: Math.floor(stats.ctimeMs / 1000) * 10000 +
            parseInt(String(stats.size).slice(0, 4))
    };
}

export function createEpisode(
    fileName: string,
    dirPath: string,
    titleFormat: 'clean' | 'full' = 'clean',
    config?: PodcastConfig
): Episode {
    const number = parseEpisodeNumber(fileName, config);
    const title = titleFormat === 'clean' && number !== null
        ? parseEpisodeTitle(fileName)
        : fileName.replace(/\.[^/.]+$/, '');

    const filePath = path.join(dirPath, fileName);
    const { pubDate: metadataPubDate, sortValue } = getFileMetadata(filePath);

    // 两套独立的逻辑：
    // 1. 有序号的文件：使用序号生成pubDate，保持原有逻辑
    // 2. 无序号的文件：使用文件元数据的时间和排序值
    const finalNumber = number !== null ? number : sortValue;
    const pubDate = number !== null
        ? generatePubDate(number)  // 有序号文件使用原有逻辑
        : metadataPubDate;        // 无序号文件使用文件元数据时间

    return {
        number: finalNumber,
        title,
        fileName,
        filePath,
        pubDate
    };
}

export function sortEpisodes(episodes: Episode[]): Episode[] {
    return [...episodes].sort((a, b) => a.number - b.number);
}

export function validateFileName(fileName: string): boolean {
    // 检查是否是支持的音频格式
    const supportedFormats = /\.(mp3|m4a|wav)$/i;
    return supportedFormats.test(fileName);
}