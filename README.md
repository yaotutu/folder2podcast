[![SVG Banners](https://svg-banners.vercel.app/api?type=rainbow&text1=Folder2Podcast📻&width=800&height=400)](https://github.com/Akshay090/svg-banners)

# 🎙️ Folder2Podcast RSS

> 一键将本地音频文件夹转换为私人播客 RSS 订阅源

[English Version](README.en.md)


## 目录

- [🎙️ Folder2Podcast RSS](#️-folder2podcast-rss)
  - [目录](#目录)
  - [项目背景](#项目背景)
  - [✨ 核心功能](#-核心功能)
  - [🚀 快速开始](#-快速开始)
    - [Docker 一键部署（推荐）](#docker-一键部署推荐)
  - [Docker 镜像说明](#docker-镜像说明)
  - [📱 效果展示](#-效果展示)
    - [播客客户端显示效果](#播客客户端显示效果)
  - [📦 目录结构规范](#-目录结构规范)
  - [⚙️ 配置说明](#️-配置说明)
    - [环境变量](#环境变量)
    - [podcast.json 配置](#podcastjson-配置)
  - [🎨 高级特性](#-高级特性)
    - [📱 Web 界面](#-web-界面)
    - [🎯 其他特性](#-其他特性)
  - [📱 客户端支持](#-客户端支持)
  - [故障排查](#故障排查)
  - [📋 支持与反馈](#-支持与反馈)
  - [更新日志](#更新日志)

## 项目背景

播客 RSS 是一个强大的音频分发标准，它不仅仅是一个简单的音频列表，更提供了：

- 🔖 完整的播放进度记录
- 🎯 精确的断点续播功能
- 🔄 跨设备的收听历史同步
- 📱 多平台收听支持
- 🎨 丰富的媒体信息展示

Folder2Podcast RSS 让您可以轻松地把本地音频文件夹转换为私人播客 RSS 源，享受专业播客客户端的所有高级特性：

- 🎧 使用您最喜欢的播客应用收听（如 Apple Podcasts、Pocket Casts）
- 📱 在任何设备上继续上次的收听进度
- 🔄 自动同步多设备间的收听历史
- 📚 系统化管理您的有声内容库
- 🎯 智能记住每个音频的播放位置

只需一个命令部署，让您的本地音频秒变私人播客订阅源。

## ✨ 核心功能

- 🎯 **标准 RSS 实现** - 完整支持播客 RSS 2.0 规范和 iTunes 专有标签
- 📱 **完美客户端兼容** - 适配所有主流播客客户端
- 🔄 **智能序列化** - 自动分析文件名构建剧集顺序，生成发布时间
- 🌐 **灵活访问** - 支持中文路径和英文别名双向访问
- 🎨 **个性化配置** - 支持播客元数据自定义（标题、作者、封面等）
- 🚀 **容器化部署** - 提供 Docker 一键部署方案

## 🚀 快速开始

### Docker 一键部署（推荐）

1. **准备工作**
   - 安装 Docker
   - 准备音频文件目录（按播客内容分文件夹）
   - 规范文件命名（如：01-第一章.mp3、第02集.mp3）

⚠️ **重要：BASE_URL 配置说明**

在部署到服务器时，必须正确配置 BASE_URL 环境变量，这直接影响到：
- RSS feed 中的音频文件链接
- 封面图片链接
- 所有静态资源的访问路径

正确配置示例：
```bash
# 本地测试时
BASE_URL=http://localhost:3000

# 部署到服务器时（请替换为实际的服务器IP或域名）
BASE_URL=http://192.168.55.222:3000
# 或者
BASE_URL=http://your-domain.com
```

注意事项：
- BASE_URL 必须包含协议前缀（http:// 或 https://）
- 如果使用了自定义端口，必须包含端口号
- 结尾不要添加斜杠 '/'
- 确保该地址可以从客户端（如播客APP）访问到

2. **启动服务**

   方式一：Docker 命令直接运行
   ```bash
   docker run -d \
     -p 3000:3000 \
     -v /path/to/audiobooks:/podcasts \
     -e PORT=3000 \
     -e BASE_URL=http://your-server-ip:3000 \
     yaotutu/folder2podcast
   ```

   方式二：使用 Docker Compose（推荐）
   ```yaml
   # docker-compose.yml
   version: '3.8'
   services:
     folder2podcast:
       image: yaotutu/folder2podcast
       ports:
         - "3000:3000"
       volumes:
         - ./audiobooks:/podcasts
       environment:
         - PORT=3000
         - AUDIO_DIR=/podcasts
         - BASE_URL=http://your-server-ip:3000
       restart: unless-stopped
       healthcheck:
         test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/podcasts"]
         interval: 30s
         timeout: 10s
         retries: 3
   ```

   运行：
   ```bash
   docker compose up -d
   ```

3. **验证部署**
   - 访问 `http://localhost:3000/podcasts` 确认服务运行
   - 检查播客列表是否正确显示
   - 测试音频文件访问

## Docker 镜像说明

- `yaotutu/folder2podcast:main` - 开发版本，与 main 分支同步更新，包含最新特性
- `yaotutu/folder2podcast:latest` - 稳定版本，经过测试后发布，建议生产环境使用
  
## 📱 效果展示

### 播客客户端显示效果

![播客客户端显示效果](docs/images/podcast-client-preview.png)

*图示：在 Apple Podcasts 中的显示效果*

要获取类似截图：
1. 使用任意播客客户端（如 Apple Podcasts）订阅您的播客
2. 等待内容同步完成
3. 截取播客详情页面的屏幕截图


## 📦 目录结构规范

标准的目录结构组织方式：

```
assets/
├── web/          # Web 界面相关文件
├── image/        # 图片资源
audio/            # 播客音频文件
├── podcast1/
│   ├── episode1.mp3
│   └── cover.jpg
└── podcast2/
    ├── episode1.mp3
    └── cover.jpg
```

## ⚙️ 配置说明

### 环境变量

| 环境变量       | 说明               | 默认值                    | 示例                         |
| -------------- | ------------------ | ------------------------- | ---------------------------- |
| `AUDIO_DIR`    | 音频文件根目录路径 | `./audio`                 | `/path/to/audiobooks`        |
| `PORT`         | 服务器监听端口     | `3000`                    | `8080`                       |
| `BASE_URL`     | 服务器基础URL      | `http://localhost:端口号` | `http://192.168.55.222:3000` |
| `TITLE_FORMAT` | 剧集标题显示格式   | `full`                    | `clean` 或 `full`            |

### podcast.json 配置

```json
{
  "title": "播客标题",
  "description": "播客描述",
  "author": "作者名称",
  "alias": "podcast-name",
  "language": "zh-cn",
  "category": "科技",
  "explicit": false,
  "email": "contact@example.com",
  "websiteUrl": "https://example.com"
}
```

## 🎨 高级特性

### 📱 Web 界面
项目提供了一个友好的 Web 界面，方便用户：
- 查看所有可用的播客源
- 一键复制订阅地址
- 支持多个主流播客客户端的一键订阅
  - Apple Podcasts
  - Overcast
  - Pocket Casts
  - Castro
  - Moon FM
  - 更多客户端持续添加中...

![Web 界面预览](docs/images/web-interface.png)

### 🎯 其他特性
- 智能文件名处理
- 自动序列化
- 别名路由
- 封面图片管理
- 多设备同步

详细说明请参考[详细使用指南](docs/advanced-guide.md)。

## 📱 客户端支持

支持所有标准播客客户端：
- Apple Podcasts
- Pocket Casts
- Overcast
- Castro
- Google Podcasts
- AntennaPod

## 故障排查

常见问题和解决方案请参考[故障排查指南](docs/troubleshooting.md)。

## 📋 支持与反馈

- 发现 bug？[提交 Issue](https://github.com/your-repo/folder2podcast/issues)
- 有建议？[参与讨论](https://github.com/your-repo/folder2podcast/discussions)
- 想贡献代码？[提交 PR](https://github.com/your-repo/folder2podcast/pulls)

## 更新日志

查看完整的更新历史请访问 [CHANGELOG.md](CHANGELOG.md)

<div align="center">

<table>
  <tr>
    <td align="center">
      <img src="docs/images/wechat.jpg" width="280" alt="微信群">
      <br>
      👆 欢迎扫码加好友进群，参与内测！
    </td>
    <td align="center">
      <a href="https://www.producthunt.com/posts/folder2podcast-rss?embed=true">
        <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=826261&theme=light" 
          alt="Folder2Podcast RSS - Local folders to RSS podcast feeds" 
          width="250" height="54">
      </a>
      <br>
      <a href="https://starchart.cc/yaotutu/folder2podcast">
        <img src="https://starchart.cc/yaotutu/folder2podcast.svg" alt="Stargazers over time" width="500">
      </a>
    </td>
  </tr>
</table>

</div>