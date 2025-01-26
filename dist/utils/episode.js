"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEpisodeNumber = parseEpisodeNumber;
exports.parseEpisodeTitle = parseEpisodeTitle;
exports.generatePubDate = generatePubDate;
exports.createEpisode = createEpisode;
exports.sortEpisodes = sortEpisodes;
exports.validateFileName = validateFileName;
const path_1 = __importDefault(require("path"));
const BASE_DATE = new Date('2024-12-18T00:00:00.000Z');
function parseEpisodeNumber(fileName) {
    // 首先尝试匹配文件名开头的数字（优先级更高）
    const frontMatch = fileName.match(/^(\d+)/);
    if (frontMatch) {
        return parseInt(frontMatch[1], 10);
    }
    // 如果文件名开头没有数字，尝试匹配文件扩展名前的数字
    const backMatch = fileName.match(/(\d+)\.[^/.]+$/);
    if (backMatch) {
        return parseInt(backMatch[1], 10);
    }
    throw new Error(`Invalid filename: ${fileName} - Must contain a number either at start or before extension`);
}
function parseEpisodeTitle(fileName) {
    // 移除文件扩展名
    const withoutExt = fileName.replace(/\.[^/.]+$/, '');
    // 如果以数字开头，移除开头的数字和分隔符
    if (withoutExt.match(/^\d+/)) {
        return withoutExt.replace(/^(\d+)[-_.\s]*/, '');
    }
    // 如果以数字结尾，移除结尾的数字和分隔符
    return withoutExt.replace(/[-_.\s]*\d+$/, '');
}
function generatePubDate(episodeNumber) {
    // 根据剧集编号增加天数
    const pubDate = new Date(BASE_DATE);
    pubDate.setDate(BASE_DATE.getDate() + episodeNumber - 1); // -1是因为第一集应该是基准日期
    return pubDate;
}
function createEpisode(fileName, dirPath) {
    const number = parseEpisodeNumber(fileName);
    const title = parseEpisodeTitle(fileName);
    const pubDate = generatePubDate(number);
    return {
        number,
        title,
        fileName,
        filePath: path_1.default.join(dirPath, fileName),
        pubDate
    };
}
function sortEpisodes(episodes) {
    return [...episodes].sort((a, b) => a.number - b.number);
}
function validateFileName(fileName) {
    // 检查是否是支持的音频格式
    const supportedFormats = /\.(mp3|m4a|wav)$/i;
    if (!supportedFormats.test(fileName)) {
        return false;
    }
    // 检查文件名是否符合以下任一格式：
    // 1. 以数字开头（优先格式）
    // 2. 在文件扩展名前有数字
    const hasNumberAtFront = fileName.match(/^\d+/);
    const hasNumberAtBack = fileName.match(/\d+\.[^/.]+$/);
    return hasNumberAtFront || hasNumberAtBack ? true : false;
}
