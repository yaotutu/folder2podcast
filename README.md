[![SVG Banners](https://svg-banners.vercel.app/api?type=rainbow&text1=Folder2Podcast📻&width=800&height=400)](https://github.com/Akshay090/svg-banners)

# 🎙️ Folder2Cast

> 将本地音频文件夹转换为标准播客订阅源

## 项目背景

在数字音频内容日益丰富的今天，我们经常会收藏各类优质音频内容：有声小说、教育课程、经典播客节目等。然而，传统音频播放器在处理长音频内容时存在一些固有的局限性：

- 难以追踪收听进度
- 无法记住上次播放位置
- 缺乏跨设备的播放记录同步
- 不支持系统化的内容管理

Folder2Cast 正是为解决这些问题而诞生。通过将本地音频文件夹转换为标准的播客 RSS 订阅源，让您可以：

- 使用专业播客客户端管理和收听内容
- 自动记录和同步播放进度
- 支持断点续听
- 跨设备同步收听历史
- 系统化管理音频内容

只需简单的配置，您就能享受到专业播客客户端提供的所有高级功能。

## ✨ 核心功能

- 📱 **专业播放体验** - 支持断点续听、收听进度同步等高级功能
- 🎯 **智能序列化** - 自动识别剧集顺序，轻松管理系列内容
- 🌐 **双路径访问** - 支持原生中文路径和英文别名的灵活访问
- 🔄 **实时同步** - 自动检测并更新音频内容变更
- 🎨 **个性化配置** - 支持全局和目录级别的精细化设置
- 🚀 **快速部署** - 提供 Docker 容器化和本地部署两种方式

## 🚀 快速部署指南

### 使用 Docker 部署（推荐）

1. **环境准备**
   - 安装 Docker
   - 准备音频文件目录
   - 确保文件命名规范（如：01-序章.mp3）

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

### 使用 NPM 部署

1. **环境要求**
   - Node.js 14.0 或更高版本
   - NPM 6.0 或更高版本
   - 准备音频文件目录

2. **安装配置**
   ```bash
   # 克隆项目
   git clone https://github.com/your-repo/folder2podcast.git
   cd folder2podcast

   # 安装依赖
   npm install

   # 配置环境变量（可选）
   export AUDIO_DIR=/path/to/audiobooks
   export PORT=3000
   ```

3. **启动服务**
   ```bash
   # 开发模式
   npm run start:dev

   # 或指定配置启动
   AUDIO_DIR=/path/to/audiobooks PORT=3000 npm run start:dev
   ```

4. **验证服务**
   - 访问管理面板：`http://localhost:3000/podcasts`
   - 确认音频文件可访问
   - 测试播客订阅功能

### 后续配置

无论选择哪种部署方式，您都可以：
- 在各播客目录下添加 podcast.json 自定义配置
- 添加 cover.jpg 设置播客封面（推荐使用正方形图片以获得最佳显示效果）
- 通过环境变量调整全局配置

## 📱 效果展示

### 播客客户端显示效果

![播客客户端显示效果](docs/images/podcast-client-preview.png)

*图示：在 Apple Podcasts 中的显示效果*

要获取类似截图：
1. 使用任意播客客户端（如 Apple Podcasts）订阅您的播客
2. 等待内容同步完成
3. 截取播客详情页面的屏幕截图

### RSS Feed 结构

![RSS Feed 结构](docs/images/rss-feed-structure.png)

*图示：生成的标准 RSS Feed 结构*

要获取 Feed 截图：
1. 访问您的播客 Feed URL（例如：`http://localhost:3000/audio/your-podcast/feed.xml`）
2. 使用浏览器的开发者工具格式化 XML
3. 截取包含完整结构的屏幕截图

## 📦 目录结构规范

标准的目录结构组织方式：

```
audiobooks/
├── podcast-series-1/
│   ├── 01-第一章.mp3     # 数字前缀用于排序
│   ├── 02-第二章.mp3     # 支持多种分隔符
│   ├── cover.jpg        # 可选：播客封面图片
│   └── podcast.json     # 可选：配置文件
│
└── podcast-series-2/
    ├── 01.序章.mp3      # 标准命名格式
    ├── 02.正文.mp3      # 保持命名一致性
    └── 03.尾声.mp3      # 便于维护管理
```

## ⚙️ 配置文件说明

播客配置文件 `podcast.json` 参数说明：

```json
{
  "title": "播客标题",
  "description": "播客描述",
  "author": "作者名称",
  "alias": "podcast-name",         // 用于URL访问的英文标识符
  "language": "zh-cn",             // 语言代码
  "category": "科技",              // 播客分类
  "explicit": false,               // 内容分级
  "email": "contact@example.com",  // 联系邮箱
  "websiteUrl": "https://example.com", // 相关网站
  "titleFormat": "full"           // 标题格式：clean(清理前缀) 或 full(完整文件名)
}
```

配置说明：
- title/description: 在播客客户端中显示的基本信息
- alias: 必须为小写字母、数字和连字符的组合
- language: 遵循 RFC 5646 标准的语言代码
- explicit: 用于内容分级，标记是否包含敏感内容

## 🎯 一键部署

使用Docker Compose更优雅：

```yaml
version: '3.8'
services:
  folder2podcast:
    image: yaotutu/folder2podcast
    ports:
      - "3000:3000"
    volumes:
      - ./audiobooks:/podcasts:ro
    environment:
      - BASE_URL=http://your-server-ip:3000
    restart: unless-stopped
    # 可选：健康检查
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/podcasts"]
      interval: 1m
      timeout: 10s
```

## 🌐 URL访问规范

系统提供两种标准的URL访问方式：

1. 原始路径访问：
```
http://[服务器地址]/audio/[播客目录名]/feed.xml
```

2. 别名路径访问：
```
http://[服务器地址]/audio/[英文别名]/feed.xml
```

访问规则说明：
- 原始路径：直接使用播客目录名，支持中文编码
- 别名路径：使用podcast.json中配置的alias值，仅支持英文和连字符
- 两种路径均指向相同的资源，提供不同的访问便利性

## 🎨 高级技巧

### 智能文件名处理

支持多种命名风格，自动提取剧集号（优先匹配数字开头格式）。可通过全局环境变量或每个播客的配置文件来控制标题显示方式：

#### 标题显示策略

- **完整模式**（默认）：保留原始文件名（不含扩展名）
  ```bash
  01-简介.mp3    → "01-简介"
  第01期.mp3     → "第01期"
  简介01.mp3     → "简介01"
  ```

- **清理模式**：移除数字前缀，保留描述性内容
- **清理模式**：保留描述性内容，移除数字前缀和分隔符
  ```bash
  01-简介.mp3    → "简介"
  第01期.mp3     → "第期"
  简介01.mp3     → "简介"
  ```

可以通过以下方式修改标题显示策略：
1. 环境变量：`TITLE_FORMAT=clean` (默认是 full)
2. 播客配置：在 `podcast.json` 中设置 `"titleFormat": "clean"`
（文件夹配置优先级高于环境变量）
  ```bash
  01-简介.mp3    → "01-简介"
  第01期.mp3     → "第01期"
  简介01.mp3     → "简介01"
  ```
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
   - `BASE_URL`: 服务器基础URL（例如：http://192.168.55.222:3000），默认为 http://localhost:端口号

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
   - 添加合适大小的封面图片（推荐使用正方形图片）

4. **安全性**
   - 使用只读挂载保护音频文件
   - 避免在文件名中使用特殊字符
   - 定期备份配置文件

### 故障排查

1. **系统诊断**
   - 目录权限验证
      * 确认音频文件的读取权限
      * 验证配置文件的访问权限
   - BASE_URL 配置验证
      * 检查 BASE_URL 是否正确设置（必须包含协议和端口）
      * 确认 BASE_URL 可以从外部访问
      * 验证生成的 RSS feed 中的链接是否正确
      * 测试音频文件和封面图片是否可访问
   - 资源完整性检查
     * 确认封面图片格式(cover.jpg，建议使用正方形图片)
     * 验证音频文件的有效性
     * 检查配置文件的格式规范
   - 序列化检查
     * 验证文件命名的规范性
     * 检查序号格式的一致性

2. **运行监控**
   - 日志分析
     * 定期检查运行日志
     * 分析系统错误信息
     * 监控性能指标
   - 系统状态
     * 执行定时健康检查
     * 监控服务响应时间
     * 追踪资源占用情况

3. **系统维护**
   - 定期维护计划
     * 更新系统组件
     * 清理临时数据
     * 优化存储空间
   - 性能优化
     * 监控系统负载
     * 优化目录结构
     * 执行数据备份

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

## 📋 支持与反馈

### 问题报告
- 发现问题请提交Issue，并提供以下信息：
  * 详细的问题描述
  * 相关的配置文件
  * 运行环境信息
  * 操作复现步骤

### 版本发布流程

项目提供了自动化版本标签管理功能：

1. **自动递增版本号**
   ```bash
   # 自动获取最新标签，将其patch版本号+1，并推送到远程仓库
   npm run tag
   ```
   例如：
   - 当前最新标签是 v0.1.1
   - 运行命令后会自动创建 v0.1.2 并推送

2. **手动创建标签**
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

当新的标签被推送到 GitHub 后，会自动触发：
1. GitHub Actions 工作流
2. 构建 Docker 镜像
3. 推送到 Docker Hub

### 建议提交
- 改进建议请提供：
  * 具体的使用场景
  * 预期的功能效果
  * 可行的实现方案

---