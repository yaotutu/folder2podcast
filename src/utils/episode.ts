import path from 'path';
import { Episode } from '../types';
import crypto from 'crypto';
import fs from 'fs';

const BASE_DATE = new Date('2024-12-18T00:00:00.000Z');

export function parseEpisodeNumber(fileName: string): number | null {
    // 首先尝试匹配文件名开头的数字（优先级更高）
    const frontMatch = fileName.match(/^(\d+)/);
    if (frontMatch) {
        return parseInt(frontMatch[1], 10);
    }

    // 如果文件名开头没有数字，尝试匹配文件扩展名前的数字
    const backMatch = fileName.match(/(\d+)\.[^/.]+$/);
    if (backMatch) {
        return parseInt(backMatch[1], 10);
    }

    // 如果没有找到数字，返回 null
    return null;
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

export function createEpisode(fileName: string, dirPath: string, titleFormat: 'clean' | 'full' = 'clean'): Episode {
    const number = parseEpisodeNumber(fileName);
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