import fs from 'fs-extra';
import path from 'path';
import { PodcastConfig } from '../types';

import { getEnvConfig } from './env';

export const DEFAULT_CONFIG: Required<PodcastConfig> = {
    title: '',          // 将在处理时被文件夹名替换
    description: '',    // 将在处理时被文件夹名替换
    author: 'Unknown',
    language: 'zh-cn',
    category: 'Podcast',
    explicit: false,
    email: '',
    websiteUrl: '',
    titleFormat: getEnvConfig().TITLE_FORMAT  // 使用全局环境变量中的配置
};

export async function readConfig(dirPath: string): Promise<PodcastConfig> {
    const configPath = path.join(dirPath, 'podcast.json');
    try {
        const config = await fs.readJSON(configPath);
        return config;
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

export function getConfigWithDefaults(dirPath: string, config: PodcastConfig): Required<PodcastConfig> {
    const dirName = path.basename(dirPath);

    return {
        ...DEFAULT_CONFIG,
        ...config,
        title: config.title || dirName,
        description: config.description || dirName
    };
}