export interface Episode {
    number: number;
    title: string;
    fileName: string;
    filePath: string;
    pubDate: Date;
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
    alias?: string;  // 添加别名配置，用于URL访问
}

export interface PodcastSource {
    dirName: string;
    dirPath: string;
    config: Required<PodcastConfig>;
    episodes: Episode[];
    coverPath?: string;
}

export interface ProcessOptions {
    baseUrl: string;
    defaultCover: string;
}