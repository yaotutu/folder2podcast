# Folder2Cast

将音频文件夹转换为播客源，方便通过播客客户端进行收听和进度管理。只需将音频文件放入指定文件夹，即可自动生成播客RSS源。

## 最简单的使用方法

1. 创建音频文件夹：
```bash
mkdir -p audio/我的播客
# 将MP3文件复制到这个文件夹
cp *.mp3 audio/我的播客/
```

2. 启动服务：
```bash
docker-compose up -d
```

3. 访问播客列表：
```
http://localhost:3000/podcasts
```

就是这么简单！现在你可以在任何播客客户端中添加生成的RSS地址了。

## 文件夹组织方式

### 基础结构
```
audio/                    # 根目录（可以在docker-compose.yml中修改）
├── 播客节目一/           # 第一个播客的文件夹
│   ├── 01.第一集.mp3    # 音频文件（必须以数字开头）
│   ├── 02.第二集.mp3    
│   ├── cover.jpg       # 封面图片（可选）
│   └── podcast.json    # 配置文件（可选）
│
└── 播客节目二/          # 第二个播客的文件夹
    ├── 1-章节1.mp3     
    ├── 2-章节2.mp3
    └── ...
```

### 音频文件命名规则

- **必须以数字开头**，用于确定剧集顺序
- 支持的格式：
  ```
  01.文件名.mp3
  1-文件名.mp3
  1_文件名.mp3
  001文件名.mp3
  ```
- 实际案例：
  ```
  01.开篇介绍.mp3
  02-核心概念.mp3
  03_实战案例.mp3
  ```
- 数字后可以使用任意分隔符（空格、横杠、下划线、点）
- 剩余部分会自动作为剧集标题

### podcast.json 配置文件（可选）

如果不创建此文件，系统会：
- 使用文件夹名作为播客标题和描述
- 使用默认封面图片
- 生成安全的URL访问路径

如果需要自定义，创建 podcast.json：
```json
{
  "title": "我的播客",           // 播客标题
  "description": "节目简介",     // 播客描述
  "author": "作者名称",         // 作者名称
  "alias": "my-podcast",       // 英文访问路径（可选，建议设置）
  "language": "zh-cn",         // 语言代码
  "category": "教育",          // 播客分类
  "explicit": false,          // 是否包含限制级内容
  "email": "me@example.com",  // 联系邮箱（可选）
  "websiteUrl": ""           // 网站地址（可选）
}
```

### cover.jpg 封面图片（可选）

- 文件名必须是：cover.jpg
- 建议尺寸：1400x1400 像素
- 如果不提供，将使用默认封面图片

## 访问地址说明

系统为每个播客文件夹生成两个访问地址：

1. 默认地址（支持中文）：
```
http://localhost:3000/audio/播客节目一/feed.xml
```

2. 别名地址（如果在podcast.json中配置了alias）：
```
http://localhost:3000/audio/my-podcast/feed.xml
```

建议：
- 在podcast.json中配置alias，使用别名地址
- 别名只能包含小写字母、数字和连字符
- 使用别名地址可以确保最佳兼容性

## 部署说明

### 使用Docker（推荐）

1. 下载配置文件：
```bash
wget https://raw.githubusercontent.com/username/folder2podcast/main/docker-compose.yml
```

2. 创建音频文件夹：
```bash
mkdir -p audio/我的播客
```

3. 复制音频文件：
```bash
cp *.mp3 audio/我的播客/
```

4. 启动服务：
```bash
docker-compose up -d
```

### 查看运行状态

1. 检查服务状态：
```bash
docker-compose ps
```

2. 查看日志：
```bash
docker-compose logs -f
```

3. 访问播客列表以验证：
```
http://localhost:3000/podcasts
```

### 修改配置

1. 更改端口（默认3000）：
编辑 docker-compose.yml：
```yaml
services:
  folder2podcast:
    ports:
      - "8080:3000"  # 改为8080端口
```

2. 更改音频目录位置：
```yaml
services:
  folder2podcast:
    volumes:
      - /path/to/my/audiobooks:/podcasts:ro  # 改为你的音频目录
```

## 播客客户端订阅步骤

以苹果播客为例：

1. 打开播客应用
2. 点击"资料库" → "添加节目"
3. 选择"添加节目URL"
4. 粘贴RSS地址（建议使用别名地址）
5. 点击"关注"即可

## 常见问题

1. 文件不显示？
   - 检查文件名是否以数字开头
   - 确认是支持的音频格式（mp3/m4a/wav）

2. 中文路径无法访问？
   - 在podcast.json中配置alias
   - 使用别名访问地址

3. 如何批量重命名文件？
   - 在Mac/Linux上：
     ```bash
     # 将所有mp3文件重命名为01.mp3, 02.mp3...
     ls -1 *.mp3 | cat -n | while read n f; do mv "$f" "$(printf '%02d.%s' $n "${f#*.}")"; done
     ```

4. 如何更新播客内容？
   - 直接在音频文件夹中添加/删除文件
   - 无需重启服务，系统会自动检测

## 安全性说明

1. 音频文件以只读方式挂载，确保数据安全
2. 建议在配置文件中添加别名，避免中文路径问题
3. 可以配置反向代理（如Nginx）添加SSL支持

完整源码和更多信息请访问：[GitHub仓库地址]