import fs from 'fs-extra';
import path from 'path';
import { Episode, PodcastSource, PodcastConfig } from '../types';
import { readConfig, getConfigWithDefaults, validateConfig } from './config';
import { createEpisode, validateFileName, parseEpisodeNumber } from './episode';

export async function validatePodcastDirectory(dirPath: string): Promise<void> {
    // 只检查目录是否存在
    if (!await fs.pathExists(dirPath)) {
        throw new Error(`Directory not found: ${dirPath}`);
    }
}

export function sortEpisodes(episodes: Episode[], config?: Required<PodcastConfig>): Episode[] {
    // 创建一个 Map 来缓存文件名的序号解析结果
    const numberCache = new Map<string, number | null>();

    // 首先解析并缓存所有文件的序号
    episodes.forEach(episode => {
        numberCache.set(episode.fileName, parseEpisodeNumber(episode.fileName, config));
    });

    // 分离有序号和无序号文件
    const numberedEpisodes = episodes.filter(e => numberCache.get(e.fileName) !== null);
    const unnumberedEpisodes = episodes.filter(e => numberCache.get(e.fileName) === null);

    // 如果全是无序号文件，直接按时间排序
    if (numberedEpisodes.length === 0) {
        return [...episodes].sort((a, b) => a.pubDate.getTime() - b.pubDate.getTime());
    }

    // 有序号的按序号排序
    numberedEpisodes.sort((a, b) => {
        const aNumber = numberCache.get(a.fileName);
        const bNumber = numberCache.get(b.fileName);
        return (aNumber || 0) - (bNumber || 0);
    });

    // 无序号的按时间排序
    unnumberedEpisodes.sort((a, b) => a.pubDate.getTime() - b.pubDate.getTime());

    // 合并：有序号的在前，无序号的在后
    return [...numberedEpisodes, ...unnumberedEpisodes];
}

export async function scanAudioFiles(dirPath: string, config: Required<PodcastConfig>): Promise<Episode[]> {
    const files = await fs.readdir(dirPath);
    const episodes: Episode[] = [];

    for (const file of files) {
        // 跳过隐藏文件（以 . 开头的文件）
        if (file.startsWith('.')) {
            continue;
        }

        if (!validateFileName(file)) {
            continue;
        }

        try {
            // 将配置对象传递给 createEpisode
            const episode = createEpisode(file, dirPath, config.titleFormat, config);
            episodes.push(episode);
        } catch (error) {
            console.warn(`Skipping invalid file: ${file}`, error);
        }
    }

    return sortEpisodes(episodes, config);
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