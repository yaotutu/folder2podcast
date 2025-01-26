"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEpisodeNumber = parseEpisodeNumber;
exports.parseEpisodeTitle = parseEpisodeTitle;
exports.createEpisode = createEpisode;
exports.sortEpisodes = sortEpisodes;
exports.validateFileName = validateFileName;
const path_1 = __importDefault(require("path"));
function parseEpisodeNumber(fileName) {
    const match = fileName.match(/^(\d+)/);
    if (!match) {
        throw new Error(`Invalid filename: ${fileName} - Must start with a number`);
    }
    return parseInt(match[1], 10);
}
function parseEpisodeTitle(fileName) {
    // 移除开头的数字和分隔符
    const withoutNumber = fileName.replace(/^(\d+)[-_.\s]*/, '');
    // 移除文件扩展名
    return withoutNumber.replace(/\.[^/.]+$/, '');
}
function createEpisode(fileName, dirPath) {
    const number = parseEpisodeNumber(fileName);
    const title = parseEpisodeTitle(fileName);
    return {
        number,
        title,
        fileName,
        filePath: path_1.default.join(dirPath, fileName)
    };
}
function sortEpisodes(episodes) {
    return [...episodes].sort((a, b) => a.number - b.number);
}
function validateFileName(fileName) {
    // 检查文件是否以数字开头
    if (!fileName.match(/^\d+/)) {
        return false;
    }
    // 检查是否是支持的音频格式
    const supportedFormats = /\.(mp3|m4a|wav)$/i;
    if (!supportedFormats.test(fileName)) {
        return false;
    }
    return true;
}
