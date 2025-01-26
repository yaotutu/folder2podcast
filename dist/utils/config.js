"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONFIG = void 0;
exports.readConfig = readConfig;
exports.validateConfig = validateConfig;
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
    websiteUrl: ''
};
async function readConfig(dirPath) {
    const configPath = path_1.default.join(dirPath, 'podcast.json');
    try {
        return await fs_extra_1.default.readJSON(configPath);
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
}
