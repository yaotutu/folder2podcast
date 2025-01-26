# Folder2Cast 项目需求与设计文档

## 项目概述
将音频文件夹转换为播客源，方便通过播客客户端进行收听和进度管理。

## 技术栈
- Node.js
- TypeScript
- fs-extra (文件操作增强)
- feed (RSS生成)

## 核心功能需求

### 1. 文件处理
- 扫描指定目录中的音频文件
- 支持 mp3、m4a、wav 等常见音频格式
- 根据文件名开头的数字确定剧集顺序
- 文件名格式灵活：支持1/01/001开头，支持各种分隔符

### 2. 播客配置
- 每个文件夹作为独立的播客源
- 通过 podcast.json 配置播客信息（可选）
- 默认使用文件夹名作为播客标题和描述
- 必须包含 cover.jpg 作为播客封面

### 3. RSS生成
- 为每个文件夹生成独立的RSS feed
- 支持播客所需的所有元数据
- 生成符合规范的播客RSS格式

## 项目结构
```
folder2cast/
├── src/
│   ├── types/       # 类型定义
│   ├── utils/       # 工具函数
│   └── index.ts     # 入口文件
├── package.json
└── tsconfig.json
```

## 文件夹结构规范
```
podcast-source/
├── 小说一/                # 第一个播客源
│   ├── podcast.json      # 可选的播客配置
│   ├── cover.jpg         # 必需的封面图片
│   ├── 1.mp3
│   ├── 2.mp3
│   └── 3.mp3
└── 小说二/                # 第二个播客源
    ├── podcast.json
    ├── cover.jpg
    ├── 01-章节一.mp3
    └── 02-章节二.mp3
```

## 配置文件格式
`podcast.json` 示例:
```json
{
  "title": "播客标题",
  "description": "播客描述",
  "author": "作者",
  "language": "zh-cn",
  "category": "分类",
  "explicit": false,
  "email": "联系邮箱",
  "websiteUrl": "网站地址"
}
```

## 实现细节

### 核心类型定义
```typescript
interface Episode {
  number: number;
  title: string;
  fileName: string;
  filePath: string;
}

interface PodcastConfig {
  title?: string;
  description?: string;
  author?: string;
  language?: string;
  category?: string;
  explicit?: boolean;
  email?: string;
  websiteUrl?: string;
}

interface PodcastSource {
  dirName: string;
  dirPath: string;
  config: Required<PodcastConfig>;
  episodes: Episode[];
  coverPath: string;
}
```

### 主要功能函数
```typescript
// 读取配置文件
async function readConfig(dirPath: string): Promise<PodcastConfig> {
  const configPath = path.join(dirPath, 'podcast.json');
  try {
    return await fs.readJSON(configPath);
  } catch {
    return {};
  }
}

// 解析文件名中的剧集信息
function parseEpisodeNumber(fileName: string): number {
  const match = fileName.match(/^(\d+)/);
  if (!match) {
    throw new Error(`Invalid filename: ${fileName}`);
  }
  return parseInt(match[1], 10);
}

// 扫描音频文件
async function scanAudioFiles(dirPath: string): Promise<Episode[]> {
  const files = await fs.readdir(dirPath);
  const audioFiles = files.filter(file => /\.(mp3|m4a|wav)$/i.test(file));
  
  return audioFiles
    .map(file => {
      try {
        const number = parseEpisodeNumber(file);
        return {
          number,
          fileName: file,
          filePath: path.join(dirPath, file),
          title: file
            .replace(/^(\d+)[-_.\s]*/, '')
            .replace(/\.[^/.]+$/, '')
        };
      } catch {
        return null;
      }
    })
    .filter((episode): episode is Episode => episode !== null)
    .sort((a, b) => a.number - b.number);
}

// 处理单个播客源
async function processPodcastSource(
  dirPath: string,
  baseUrl: string
): Promise<string> {
  const dirName = path.basename(dirPath);
  const hasCover = await fs.pathExists(path.join(dirPath, 'cover.jpg'));
  
  if (!hasCover) {
    throw new Error(`Missing cover.jpg in ${dirName}`);
  }
  
  const [config, episodes] = await Promise.all([
    readConfig(dirPath),
    scanAudioFiles(dirPath)
  ]);

  const defaultConfig: Required<PodcastConfig> = {
    title: dirName,
    description: dirName,
    author: 'Unknown',
    language: 'zh-cn',
    category: 'Podcast',
    explicit: false,
    email: '',
    websiteUrl: ''
  };

  const source: PodcastSource = {
    dirName,
    dirPath,
    config: { ...defaultConfig, ...config },
    episodes,
    coverPath: path.join(dirPath, 'cover.jpg')
  };

  return generateFeed(source, baseUrl);
}

// 生成播客Feed
function generateFeed(source: PodcastSource, baseUrl: string): string {
  // 使用feed库实现RSS生成
  // ...
}
```

### 错误处理
- 使用 async/await 和 try/catch 处理异步错误
- 提供清晰的错误信息
- 优雅处理可选文件不存在的情况

### 文件名解析规则
- 提取开头数字作为剧集编号
- 忽略分隔符类型
- 剩余部分作为标题

## 注意事项
1. 每个文件夹必须有cover.jpg
2. 文件名必须以数字开头
3. 支持的音频格式：mp3、m4a、wav
4. 配置文件podcast.json可选
5. 默认使用文件夹名作为播客信息