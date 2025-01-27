import path from 'path';

export interface EnvConfig {
    // 音频文件夹路径
    AUDIO_DIR: string;
    // 服务器端口
    PORT: number;
    // 全局标题显示策略：clean=清理后的标题，full=完整文件名
    TITLE_FORMAT: 'clean' | 'full';
    // 服务器基础URL，用于生成RSS feed中的链接
    BASE_URL: string;
}

/**
 * 获取环境变量配置
 * 如果环境变量未设置，使用默认值
 */
export function getEnvConfig(): EnvConfig {
    const defaultAudioDir = path.join(process.cwd(), 'audio');
    const defaultPort = 3000;

    const port = parseInt(process.env.PORT || String(defaultPort), 10);
    // 构建默认的基础URL
    const defaultBaseUrl = `http://localhost:${port}`;

    return {
        // 音频文件夹路径，默认为当前目录下的 audio 文件夹
        AUDIO_DIR: process.env.AUDIO_DIR || defaultAudioDir,
        // 服务器端口，默认3000
        PORT: port,
        // 标题显示策略，默认为clean（清理后的标题）
        TITLE_FORMAT: (process.env.TITLE_FORMAT as 'clean' | 'full') || 'clean',
        // 服务器基础URL，默认为 http://localhost:端口号
        BASE_URL: process.env.BASE_URL || defaultBaseUrl
    };
}