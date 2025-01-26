export interface Episode {
    number: number;
    title: string;
    fileName: string;
    filePath: string;
}

export interface PodcastConfig {
    title?: string;
    description?: string;
    author?: string;
    language?: string;
    category?: string;
    explicit?: boolean;
    email?: string;
    websiteUrl?: string;
}

export interface PodcastSource {
    dirName: string;
    dirPath: string;
    config: Required<PodcastConfig>;
    episodes: Episode[];
    coverPath?: string;  // 修改为可选属性
}

export interface ProcessOptions {
    baseUrl: string;  // 用于生成音频文件的完整URL
}