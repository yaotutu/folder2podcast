import fs from 'fs-extra';
import path from 'path';
import { Episode, PodcastSource, PodcastConfig } from '../types';
import { readConfig, DEFAULT_CONFIG, validateConfig } from './config';
import { createEpisode, sortEpisodes, validateFileName } from './episode';

export async function validatePodcastDirectory(dirPath: string): Promise<void> {
    // 只检查目录是否存在
    if (!await fs.pathExists(dirPath)) {
        throw new Error(`Directory not found: ${dirPath}`);
    }
}

export async function scanAudioFiles(dirPath: string): Promise<Episode[]> {
    const files = await fs.readdir(dirPath);
    const episodes: Episode[] = [];

    for (const file of files) {
        if (!validateFileName(file)) {
            continue;
        }

        try {
            const episode = createEpisode(file, dirPath);
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

    // 读取配置和扫描音频文件
    const [config, episodes] = await Promise.all([
        readConfig(dirPath),
        scanAudioFiles(dirPath)
    ]);

    // 验证配置
    validateConfig(config);

    // 使用文件夹名作为默认标题和描述
    const dirName = path.basename(dirPath);
    const defaultConfig = {
        ...DEFAULT_CONFIG,
        title: dirName,
        description: dirName
    };

    // 合并默认配置和用户配置
    const finalConfig: Required<PodcastConfig> = {
        ...defaultConfig,
        ...config
    };

    // 检查cover.jpg是否存在，但不强制要求
    const coverPath = path.join(dirPath, 'cover.jpg');
    const hasCover = await fs.pathExists(coverPath);

    return {
        dirName,
        dirPath,
        config: finalConfig,
        episodes,
        coverPath: hasCover ? coverPath : undefined
    };
}