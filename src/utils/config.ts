import fs from 'fs-extra';
import path from 'path';
import { PodcastConfig } from '../types';

export const DEFAULT_CONFIG: Required<PodcastConfig> = {
    title: '',          // 将在处理时被文件夹名替换
    description: '',    // 将在处理时被文件夹名替换
    author: 'Unknown',
    language: 'zh-cn',
    category: 'Podcast',
    explicit: false,
    email: '',
    websiteUrl: ''
};

export async function readConfig(dirPath: string): Promise<PodcastConfig> {
    const configPath = path.join(dirPath, 'podcast.json');
    try {
        return await fs.readJSON(configPath);
    } catch {
        // 如果配置文件不存在或无法读取，返回空对象
        return {};
    }
}

export function validateConfig(config: PodcastConfig): void {
    // 验证邮箱格式
    if (config.email && !config.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        throw new Error('Invalid email format in podcast.json');
    }

    // 验证网址格式
    if (config.websiteUrl && !config.websiteUrl.match(/^https?:\/\/.+/)) {
        throw new Error('Invalid website URL format in podcast.json');
    }
}