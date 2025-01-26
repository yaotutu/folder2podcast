import path from 'path';

export interface EnvConfig {
    // 音频文件夹路径
    AUDIO_DIR: string;
    // 服务器端口
    PORT: number;
}

/**
 * 获取环境变量配置
 * 如果环境变量未设置，使用默认值
 */
export function getEnvConfig(): EnvConfig {
    const defaultAudioDir = path.join(process.cwd(), 'audio');
    const defaultPort = 3000;

    return {
        // 音频文件夹路径，默认为当前目录下的 audio 文件夹
        AUDIO_DIR: process.env.AUDIO_DIR || defaultAudioDir,
        // 服务器端口，默认3000
        PORT: parseInt(process.env.PORT || String(defaultPort), 10)
    };
}