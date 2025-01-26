"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONFIG = void 0;
exports.readConfig = readConfig;
exports.validateConfig = validateConfig;
exports.getConfigWithDefaults = getConfigWithDefaults;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
exports.DEFAULT_CONFIG = {
    title: '', // 将在处理时被文件夹名替换
    description: '', // 将在处理时被文件夹名替换
    author: 'Unknown',
    language: 'zh-cn',
    category: 'Podcast',
    explicit: false,
    email: '',
    websiteUrl: '',
    alias: '' // 将在处理时被文件夹名转为安全的URL字符串替换
};
function generateDefaultAlias(dirName) {
    // 将文件夹名转换为安全的URL字符串
    // 移除所有非字母数字字符，用连字符替换空格
    return dirName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
async function readConfig(dirPath) {
    const configPath = path_1.default.join(dirPath, 'podcast.json');
    try {
        const config = await fs_extra_1.default.readJSON(configPath);
        return config;
    }
    catch {
        // 如果配置文件不存在或无法读取，返回空对象
        return {};
    }
}
function validateConfig(config) {
    // 验证邮箱格式
    if (config.email && !config.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        throw new Error('Invalid email format in podcast.json');
    }
    // 验证网址格式
    if (config.websiteUrl && !config.websiteUrl.match(/^https?:\/\/.+/)) {
        throw new Error('Invalid website URL format in podcast.json');
    }
    // 验证别名格式（如果提供）
    if (config.alias && !config.alias.match(/^[a-z0-9-]+$/)) {
        throw new Error('Invalid alias format in podcast.json. Only lowercase letters, numbers, and hyphens are allowed.');
    }
}
function getConfigWithDefaults(dirPath, config) {
    const dirName = path_1.default.basename(dirPath);
    // 如果没有提供alias，生成一个默认的
    const alias = config.alias || generateDefaultAlias(dirName);
    return {
        ...exports.DEFAULT_CONFIG,
        ...config,
        title: config.title || dirName,
        description: config.description || dirName,
        alias
    };
}
