import path from 'path';
import { Episode } from '../types';

const BASE_DATE = new Date('2024-12-18T00:00:00.000Z');

export function parseEpisodeNumber(fileName: string): number {
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

    throw new Error(`Invalid filename: ${fileName} - Must contain a number either at start or before extension`);
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
    pubDate.setDate(BASE_DATE.getDate() + episodeNumber - 1); // -1是因为第一集应该是基准日期
    return pubDate;
}

export function createEpisode(fileName: string, dirPath: string): Episode {
    const number = parseEpisodeNumber(fileName);
    const title = parseEpisodeTitle(fileName);
    const pubDate = generatePubDate(number);

    return {
        number,
        title,
        fileName,
        filePath: path.join(dirPath, fileName),
        pubDate
    };
}

export function sortEpisodes(episodes: Episode[]): Episode[] {
    return [...episodes].sort((a, b) => a.number - b.number);
}

export function validateFileName(fileName: string): boolean {
    // 检查是否是支持的音频格式
    const supportedFormats = /\.(mp3|m4a|wav)$/i;
    if (!supportedFormats.test(fileName)) {
        return false;
    }

    // 检查文件名是否符合以下任一格式：
    // 1. 以数字开头（优先格式）
    // 2. 在文件扩展名前有数字
    const hasNumberAtFront = fileName.match(/^\d+/);
    const hasNumberAtBack = fileName.match(/\d+\.[^/.]+$/);

    return hasNumberAtFront || hasNumberAtBack ? true : false;
}