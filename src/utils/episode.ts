import path from 'path';
import { Episode, PodcastConfig, EpisodeNumberStrategy } from '../types';
import crypto from 'crypto';
import fs from 'fs';

const BASE_DATE = new Date('2024-12-18T00:00:00.000Z');

// 从文件名开头部分匹配数字
function findPrefixNumber(fileName: string): number | null {
    // 匹配前缀部分中的数字（允许前面有字母）
    const match = fileName.match(/^[^0-9]*?(\d+)(?=[-_.\s])/);
    return match ? parseInt(match[1], 10) : null;
}

// 从文件名结尾部分匹配数字（在扩展名之前）
function findSuffixNumber(fileName: string): number | null {
    // 把文件名按 . 分割，只取最后一个点之前的部分
    const parts = fileName.split('.');
    if (parts.length < 2) return null;

    const nameWithoutExt = parts.slice(0, -1).join('.');
    // 匹配结尾处的数字（可以被其他非数字字符包围）
    const match = nameWithoutExt.match(/[^0-9](\d+)$/);
    return match ? parseInt(match[1], 10) : null;
}

// 从左到右找第一个数字（配置策略）
function findFirstNumber(fileName: string): number | null {
    // 检查文件名前30个字符
    const prefix = fileName.substring(0, 30);
    const match = prefix.match(/^[^0-9]*?(\d+)(?=[-_.\s])/);
    if (match) {
        return parseInt(match[1], 10);
    }
    return null;
}

// 从右到左找最后一个数字（配置策略）
function findLastNumber(fileName: string): number | null {
    // 去掉扩展名
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    // 匹配所有数字组
    const matches = nameWithoutExt.match(/(\d+)/g);
    if (!matches) return null;

    // 找到最后一个数字
    const lastNumber = matches[matches.length - 1];
    return parseInt(lastNumber, 10);
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
        pubDate: new Date(stats.ctimeMs),
        sortValue: Math.floor(stats.ctimeMs / 1000) * 10000 +
            parseInt(String(stats.size).slice(0, 4))
    };
}

// 根据配置和文件信息生成发布日期
function generateEpisodePubDate(params: {
    number: number | null;
    metadataPubDate: Date;
    useMTime?: boolean;
}): Date {
    const { number, metadataPubDate, useMTime } = params;

    // 如果配置为使用文件修改时间，直接返回
    if (useMTime) {
        return metadataPubDate;
    }

    // 如果有序号，使用序号生成日期
    if (number !== null) {
        return generatePubDate(number);
    }

    // 默认使用文件修改时间
    return metadataPubDate;
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

    // 生成最终的发布日期
    const pubDate = generateEpisodePubDate({
        number,
        metadataPubDate,
        useMTime: config?.useMTime
    });

    // 生成最终的序号（用于排序）
    const finalNumber = number !== null ? number : sortValue;

    return {
        number: finalNumber,
        title,
        fileName,
        filePath,
        pubDate
    };
}

export function validateFileName(fileName: string): boolean {
    // 检查是否是支持的音频格式
    const supportedFormats = /\.(mp3|m4a|wav)$/i;
    return supportedFormats.test(fileName);
}

// 直接运行测试
if (require.main === module) {
    // 测试用例
    const files = [
        'zk001 第一期.mp3',
        'zk发刊词 来，每天跟上全球科技新变化.mp3',
        'zk003 英伟达收购ARM：为什么引起芯片行业震动？.mp3',
        'zk004 可能&性&空间：为什么不幸的家庭各有各的不幸.mp3'
    ];

    // 添加后缀测试用例
    const moreFiles = [
        ...files,
        '第一期_001.mp3',
        '科技早知道ep003.mp3',
        '人工智能_005.wav'
    ];

    // 测试不同的策略
    const strategies = ['prefix', 'first', 'last', 'suffix'] as const;

    strategies.forEach(strategy => {
        console.log(`\n测试 ${strategy} 策略：`);
        console.log('-'.repeat(50));

        moreFiles.forEach(file => {
            const number = parseEpisodeNumber(file, { episodeNumberStrategy: strategy });
            console.log(`文件: ${file}`);
            console.log(`提取的序号: ${number === null ? '无序号' : number}`);
            console.log('-'.repeat(20));
        });
    });
}