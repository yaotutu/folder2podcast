[![SVG Banners](https://svg-banners.vercel.app/api?type=rainbow&text1=Folder2Podcast📻&width=800&height=400)](https://github.com/Akshay090/svg-banners)

# 🎙️ Folder2Cast

> 把普通文件夹变成播客源的魔法工具！

你是否曾经想把自己收藏的音频整理成播客？或者想要一个简单的方式来管理和收听有声读物？Folder2Cast 就是为此而生！只需要一个装满音频文件的文件夹，就能秒变成完美的播客源。

## ✨ 特性

- 🚀 **超简单部署** - 一个命令启动，自动发现播客内容
- 🎯 **智能排序** - 自动识别文件名中的数字作为剧集顺序
- 🌐 **优雅URLs** - 支持中文路径和英文别名双重访问
- 🔄 **实时更新** - 修改文件自动反映在播客中
- 🎨 **高度可定制** - 每个播客都可以有自己的配置和封面

## 🚀 五分钟上手

### 1. 准备工作

1. **安装方式**（选择一种）：
   - 使用 npm：确保已安装 Node.js
   - 使用 Docker：确保已安装 Docker

2. **准备音频文件**：
   - 创建一个音频文件夹
   - 按播客系列分子文件夹
   - 确保音频文件带数字前缀（如：01-序章.mp3）

### 2. 快速启动

**方式一：使用 npm**
```bash
# 1. 安装依赖
npm install

# 2. 启动服务（二选一）
npm run start:dev                    # 使用默认配置
# 或
AUDIO_DIR=~/Music npm run start:dev  # 指定音频目录
```

**方式二：使用 Docker**
```bash
# 一行命令启动
docker run -d -p 3000:3000 -v ~/Music:/podcasts:ro folder2podcast
```

### 3. 开始使用

1. 访问播客列表：
   打开浏览器访问 `http://localhost:3000/podcasts`

2. 订阅播客：
   - 复制任意播客的 RSS 地址
   - 在播客客户端中添加订阅

3. 后续管理：
   - 添加新文件会自动更新
   - 修改 podcast.json 可以自定义配置
   - 添加 cover.jpg 自定义封面

## 📦 目录魔法

看看这个优雅的目录结构：

```
audiobooks/
├── 📚 有声小说/
│   ├── 01-第一章.mp3     # 数字开头，自动排序
│   ├── 02-第二章.mp3     # 支持任意分隔符
│   ├── 🖼️ cover.jpg     # 可选，播客封面
│   └── ⚙️ podcast.json  # 可选，播客配置
│
└── 🎵 音乐故事/
    ├── 1.序章.mp3
    ├── 2.正文.mp3
    └── 3.尾声.mp3
```

## ⚡ 配置示例

在 `podcast.json` 中释放更多功能：

```json
{
  "title": "🌟 我的播客",
  "description": "精彩的节目简介",
  "author": "播客主理人",
  "alias": "my-awesome-podcast",  // 英文访问路径
  "language": "zh-cn",
  "category": "科技",
  "explicit": false,
  "email": "me@example.com",
  "websiteUrl": "https://myblog.com",
  "titleFormat": "full"  // 标题显示策略：'clean'（清理数字前缀）或'full'（保留完整文件名）
}
```

## 🎯 一键部署

使用Docker Compose更优雅：

```yaml
version: '3.8'
services:
  folder2podcast:
    image: folder2podcast
    ports:
      - "3000:3000"
    volumes:
      - ./audiobooks:/podcasts:ro
    restart: unless-stopped
    # 可选：健康检查
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/podcasts"]
      interval: 1m
      timeout: 10s
```

## 🔮 播客URL魔法

每个播客都有两种访问方式：

1. 原始路径：
```
http://localhost:3000/audio/有声小说/feed.xml
```

2. 别名路径（更优雅）：
```
http://localhost:3000/audio/my-awesome-podcast/feed.xml
```

## 🎨 高级技巧

### 智能文件名处理

支持多种命名风格，自动提取剧集号（优先匹配数字开头格式）。可通过全局环境变量或每个播客的配置文件来控制标题显示方式：

#### 标题显示策略

- **清理模式**（默认）：移除数字前缀，保留描述性内容
  ```bash
  01-简介.mp3    → "简介"
  第01期.mp3     → "第期"
  简介01.mp3     → "简介"
  ```

- **完整模式**：保留原始文件名（不含扩展名）
  ```bash
  01-简介.mp3    → "01-简介"
  第01期.mp3     → "第01期"
  简介01.mp3     → "简介01"
  ```

可以通过以下方式配置：
1. 环境变量：`TITLE_FORMAT=full`
2. 播客配置：在 `podcast.json` 中设置 `"titleFormat": "full"`
（文件夹配置优先级高于环境变量）

支持的命名格式示例：

```bash
# 优先格式：数字在前
01.mp3         → 第1集
01-简介.mp3    → 第1集：简介
01_开场.mp3    → 第1集：开场
第01期.mp3     → 第1集

# 次要格式：数字在末尾（紧邻扩展名）
简介01.mp3     → 第1集：简介
开场-01.mp3    → 第1集：开场
第一章001.mp3  → 第1集：第一章
```

### 批量重命名技巧

将所有文件按顺序重命名（Mac/Linux）：
```bash
ls -1v *.mp3 | cat -n | while read n f; do 
  mv "$f" "$(printf '%02d-%s' $n "${f#*-}")"; 
done
```

### 剧集时间管理

系统会自动为剧集生成发布时间，便于播客客户端正确排序：
- 第一集：今天
- 之后每集：间隔一天
- 保证最新的剧集在前面

## 📘 详细指南

### API使用说明

1. **播客列表接口**
   - 访问 `/podcasts` 获取所有可用播客列表
   - 返回每个播客的详细信息，包括标题、描述、订阅地址等
   - 支持中文路径和英文别名双重访问
   - Feed URL包含完整的访问地址，可直接用于播客订阅

2. **播客订阅**
   - 每个播客都有两个RSS地址可选：
     * 原始地址：`http://your-server/audio/播客文件夹名/feed.xml`
     * 别名地址：`http://your-server/audio/english-alias/feed.xml`
   - 支持所有标准播客客户端

3. **资源访问**
   - 播客封面：`/audio/播客名称/cover.jpg`
   - 音频文件：`/audio/播客名称/episode.mp3`
   - 默认资源：`/assets/default-cover.png`

### 配置说明

1. **全局配置**（环境变量）
   - `AUDIO_DIR`: 音频文件根目录
   - `PORT`: 服务器端口
   - `TITLE_FORMAT`: 标题显示格式（clean/full）

2. **播客配置**（podcast.json）
   - 支持每个播客文件夹单独配置
   - 可配置项：
     * title: 播客标题
     * description: 播客描述
     * author: 作者信息
     * alias: 英文访问路径
     * language: 语言代码
     * category: 分类
     * email: 联系邮箱
     * websiteUrl: 网站地址
     * titleFormat: 标题显示格式

### 最佳实践

1. **目录组织**
   - 每个播客系列独立文件夹
   - 使用数字前缀确保正确排序
   - 添加清晰的文件描述
   - 配置合适的播客信息

2. **文件命名**
   - 推荐格式：`数字-描述.mp3`
   - 示例：`01-序章.mp3`, `02-正文.mp3`
   - 支持多种分隔符：`.` `-` `_` 空格

3. **性能优化**
   - 控制单个文件夹的文件数量
   - 使用英文别名提高兼容性
   - 添加合适大小的封面图片

4. **安全性**
   - 使用只读挂载保护音频文件
   - 避免在文件名中使用特殊字符
   - 定期备份配置文件

### 故障排查

1. **常见问题**
   - 播客不显示：检查目录权限和文件名格式
   - 封面不显示：确认图片格式和文件名（cover.jpg）
   - 排序错误：检查文件名的数字前缀

2. **日志查看**
   - 查看服务器日志了解详细错误信息
   - 使用健康检查确保服务正常运行

3. **更新维护**
   - 定期更新服务器
   - 监控磁盘空间使用
   - 保持文件结构整洁

## 📱 支持的播客客户端

- Apple Podcasts
- Pocket Casts
- Overcast
- Castro
- Google Podcasts
...基本上所有支持自定义RSS的播客客户端！

## 💡 使用提示

1. **整理策略**
   - 按系列创建文件夹
   - 用数字前缀保证顺序
   - 添加简短描述性文件名

2. **性能优化**
   - 控制单个文件夹内的文件数量
   - 定期清理不需要的文件
   - 使用SSD存储获得更好性能

3. **最佳实践**
   - 使用英文别名避免兼容性问题
   - 保持文件名简洁明了
   - 添加合适的封面图片

## 🤝 需要帮助？

- 🐛 发现bug？开个issue！
- 💡 有新想法？欢迎讨论！
- 🎨 分享你的使用技巧！

---

享受你的播客之旅！🎉