import fs from 'fs-extra';
import path from 'path';
import { Episode, PodcastSource, PodcastConfig } from '../types';
import { readConfig, getConfigWithDefaults, validateConfig } from './config';
import { createEpisode, sortEpisodes, validateFileName } from './episode';

export async function validatePodcastDirectory(dirPath: string): Promise<void> {
    // 只检查目录是否存在
    if (!await fs.pathExists(dirPath)) {
        throw new Error(`Directory not found: ${dirPath}`);
    }
}

export async function scanAudioFiles(dirPath: string, config: Required<PodcastConfig>): Promise<Episode[]> {
    const files = await fs.readdir(dirPath);
    const episodes: Episode[] = [];

    for (const file of files) {
        if (!validateFileName(file)) {
            continue;
        }

        try {
            const episode = createEpisode(file, dirPath, config.titleFormat);
            episodes.push(episode);
        } catch (error) {
            console.warn(`Skipping invalid file: ${file}`, error);
        }
    }

    return sortEpisodes(episodes);
}

export async function processPodcastSource(dirPath: string): Promise<PodcastSource> {
    // 验证目录结构
    await validatePodcastDirectory(dirPath);

    // 先读取和验证配置
    const rawConfig = await readConfig(dirPath);
    validateConfig(rawConfig);

    // 获取完整配置（包含默认值和生成的别名）
    const fullConfig = getConfigWithDefaults(dirPath, rawConfig);

    // 使用完整配置来扫描音频文件
    const episodes = await scanAudioFiles(dirPath, fullConfig);

    // 检查cover.jpg是否存在，但不强制要求
    const coverPath = path.join(dirPath, 'cover.jpg');
    const hasCover = await fs.pathExists(coverPath);

    return {
        dirName: path.basename(dirPath),
        dirPath,
        config: fullConfig,
        episodes,
        coverPath: hasCover ? coverPath : undefined
    };
}