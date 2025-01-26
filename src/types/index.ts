export interface Episode {
    number: number;
    title: string;
    fileName: string;
    filePath: string;
    pubDate: Date;  // 添加发布日期字段
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
    coverPath?: string;
}

export interface ProcessOptions {
    baseUrl: string;
}