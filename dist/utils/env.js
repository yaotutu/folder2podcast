"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnvConfig = getEnvConfig;
const path_1 = __importDefault(require("path"));
/**
 * 获取环境变量配置
 * 如果环境变量未设置，使用默认值
 */
function getEnvConfig() {
    const defaultAudioDir = path_1.default.join(process.cwd(), 'audio');
    const defaultPort = 3000;
    return {
        // 音频文件夹路径，默认为当前目录下的 audio 文件夹
        AUDIO_DIR: process.env.AUDIO_DIR || defaultAudioDir,
        // 服务器端口，默认3000
        PORT: parseInt(process.env.PORT || String(defaultPort), 10),
        // 标题显示策略，默认为clean（清理后的标题）
        TITLE_FORMAT: process.env.TITLE_FORMAT || 'clean'
    };
}
