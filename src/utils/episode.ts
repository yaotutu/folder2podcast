import path from 'path';
import { Episode } from '../types';

const BASE_DATE = new Date('2024-12-18T00:00:00.000Z');

export function parseEpisodeNumber(fileName: string): number {
    const match = fileName.match(/^(\d+)/);
    if (!match) {
        throw new Error(`Invalid filename: ${fileName} - Must start with a number`);
    }
    return parseInt(match[1], 10);
}

export function parseEpisodeTitle(fileName: string): string {
    // 移除开头的数字和分隔符
    const withoutNumber = fileName.replace(/^(\d+)[-_.\s]*/, '');
    // 移除文件扩展名
    return withoutNumber.replace(/\.[^/.]+$/, '');
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
    // 检查文件是否以数字开头
    if (!fileName.match(/^\d+/)) {
        return false;
    }

    // 检查是否是支持的音频格式
    const supportedFormats = /\.(mp3|m4a|wav)$/i;
    if (!supportedFormats.test(fileName)) {
        return false;
    }

    return true;
}