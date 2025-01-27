"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePodcastDirectory = validatePodcastDirectory;
exports.scanAudioFiles = scanAudioFiles;
exports.processPodcastSource = processPodcastSource;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
const episode_1 = require("./episode");
async function validatePodcastDirectory(dirPath) {
    // 只检查目录是否存在
    if (!await fs_extra_1.default.pathExists(dirPath)) {
        throw new Error(`Directory not found: ${dirPath}`);
    }
}
async function scanAudioFiles(dirPath, config) {
    const files = await fs_extra_1.default.readdir(dirPath);
    const episodes = [];
    for (const file of files) {
        if (!(0, episode_1.validateFileName)(file)) {
            continue;
        }
        try {
            const episode = (0, episode_1.createEpisode)(file, dirPath, config.titleFormat);
            episodes.push(episode);
        }
        catch (error) {
            console.warn(`Skipping invalid file: ${file}`, error);
        }
    }
    return (0, episode_1.sortEpisodes)(episodes);
}
async function processPodcastSource(dirPath) {
    // 验证目录结构
    await validatePodcastDirectory(dirPath);
    // 先读取和验证配置
    const rawConfig = await (0, config_1.readConfig)(dirPath);
    (0, config_1.validateConfig)(rawConfig);
    // 获取完整配置（包含默认值和生成的别名）
    const fullConfig = (0, config_1.getConfigWithDefaults)(dirPath, rawConfig);
    // 使用完整配置来扫描音频文件
    const episodes = await scanAudioFiles(dirPath, fullConfig);
    // 检查cover.jpg是否存在，但不强制要求
    const coverPath = path_1.default.join(dirPath, 'cover.jpg');
    const hasCover = await fs_extra_1.default.pathExists(coverPath);
    return {
        dirName: path_1.default.basename(dirPath),
        dirPath,
        config: fullConfig,
        episodes,
        coverPath: hasCover ? coverPath : undefined
    };
}
