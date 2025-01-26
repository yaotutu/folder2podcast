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

## 🚀 快速开始

```bash
# 启动你的播客服务器
docker run -d \
  -p 3000:3000 \
  -v /path/to/audiobooks:/podcasts:ro \
  folder2podcast
```

就是这么简单！现在打开 `http://localhost:3000/podcasts` 看看你的播客列表吧！

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
  "websiteUrl": "https://myblog.com"
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

支持多种命名风格，自动提取剧集号（优先匹配数字开头格式）：

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

## 🔥 技术亮点

1. **异步文件处理**
   - 使用Node.js的异步I/O处理大量音频文件
   - 流式处理避免内存占用

2. **智能缓存**
   - RSS feed按需生成
   - 文件更改自动触发更新

3. **优雅的错误处理**
   - 文件访问错误自动重试
   - 友好的错误提示

4. **安全性考虑**
   - 文件系统只读挂载
   - 路径遍历防护
   - 服务器资源限制

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