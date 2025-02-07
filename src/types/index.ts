export interface Episode {
    number: number;
    title: string;
    fileName: string;
    filePath: string;
    pubDate: Date;
}

export type EpisodeNumberStrategy =
    | 'prefix'          // 默认：从文件名开头匹配数字
    | 'suffix'          // 默认：从文件名末尾匹配数字
    | 'first'           // 配置：从左到右找第一个数字
    | 'last'            // 配置：从右到左找最后一个数字
    | { pattern: string }; // 配置：使用自定义正则表达式

export interface PodcastConfig {
    title?: string;
    description?: string;
    author?: string;
    language?: string;
    category?: string;
    explicit?: boolean;
    email?: string;
    websiteUrl?: string;
    titleFormat?: 'clean' | 'full';  // 标题显示策略：clean=清理后的标题，full=完整文件名
    episodeNumberStrategy?: EpisodeNumberStrategy;  // 可选：序号提取策略
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