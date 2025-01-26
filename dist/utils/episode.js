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
