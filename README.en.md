[![SVG Banners](https://svg-banners.vercel.app/api?type=rainbow&text1=Folder2Podcast📻&width=800&height=400)](https://github.com/Akshay090/svg-banners)

# 🎙️ Folder2Podcast RSS

> Instantly convert local audio folders into private podcast RSS feeds

## Background

Podcast RSS is a powerful audio distribution standard that provides:

- 🔖 Complete playback progress tracking
- 🎯 Precise resume playback functionality
- 🔄 Cross-device listening history sync
- 📱 Multi-platform listening support
- 🎨 Rich media information display

Folder2Podcast RSS lets you easily convert local audio folders into private podcast RSS feeds, enjoying all the advanced features of professional podcast clients:

- 🎧 Listen using your favorite podcast apps (like Apple Podcasts, Pocket Casts)
- 📱 Continue from where you left off on any device
- 🔄 Automatically sync listening history across devices
- 📚 Systematically manage your audiobook library
- 🎯 Smart bookmarking for every audio file

Just one command to deploy, transforming your local audio into private podcast feeds instantly.

## ✨ Core Features

- 🎯 **Standard RSS Implementation** - Full support for podcast RSS 2.0 spec and iTunes tags
- 📱 **Perfect Client Compatibility** - Works with all mainstream podcast clients
- 🔄 **Smart Serialization** - Auto-analyze filenames to build episode order and publish dates
- 🌐 **Flexible Access** - Support both Chinese paths and English alias dual access
- 🎨 **Customizable Settings** - Support podcast-level metadata customization (title, author, cover, etc.)
- 🚀 **Container Deployment** - Provides Docker one-click deployment solution

## 🚀 Quick Start

### Docker Deployment (Recommended)

1. **Preparation**
   - Install Docker
   - Prepare audio directories (organized by podcast content)
   - Standardize filename format (e.g., 01-Chapter1.mp3, Episode02.mp3)

⚠️ **Important: BASE_URL Configuration**

When deploying to a server, you must properly configure the BASE_URL environment variable, which affects:
- Audio file links in RSS feed
- Cover image links
- All static resource access paths

Configuration examples:
```bash
# For local testing
BASE_URL=http://localhost:3000

# For server deployment (replace with your actual server IP or domain)
BASE_URL=http://192.168.55.222:3000
# or
BASE_URL=http://your-domain.com
```

Important notes:
- BASE_URL must include protocol prefix (http:// or https://)
- Include port number if using custom port
- Don't add trailing slash '/'
- Ensure the address is accessible from client devices (like podcast apps)

2. **Launch Service**

   Option 1: Direct Docker command
   ```bash
   docker run -d \
     -p 3000:3000 \
     -v /path/to/audiobooks:/podcasts \
     -e PORT=3000 \
     -e BASE_URL=http://your-server-ip:3000 \
     yaotutu/folder2podcast
   ```

   Option 2: Using Docker Compose (Recommended)
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

   Run:
   ```bash
   docker compose up -d
   ```

3. **Verify Deployment**
   - Visit `http://localhost:3000/podcasts` to confirm service is running
   - Check if podcast list displays correctly
   - Test audio file access

### NPM Deployment

1. **Requirements**
   - Node.js 14.0 or higher
   - NPM 6.0 or higher
   - Prepared audio directory

2. **Installation**
   ```bash
   # Clone repository
   git clone https://github.com/your-repo/folder2podcast.git
   cd folder2podcast

   # Install dependencies
   npm install

   # Configure environment variables (optional)
   export AUDIO_DIR=/path/to/audiobooks
   export PORT=3000
   ```

3. **Start Service**
   ```bash
   # Development mode
   npm run start:dev

   # Or start with specific config
   AUDIO_DIR=/path/to/audiobooks PORT=3000 npm run start:dev
   ```

4. **Verify Service**
   - Access dashboard: `http://localhost:3000/podcasts`
   - Verify audio files are accessible
   - Test podcast subscription functionality

## 📱 Client Support and Usage Guide

### Supported Podcast Clients

Almost all podcast clients that support custom RSS feeds work:

- Apple Podcasts (iOS, Mac)
- Pocket Casts (All platforms)
- Overcast (iOS)
- Castro (iOS)
- Google Podcasts (Android, Web)
- AntennaPod (Android)

### Usage Flow

1. **Get Subscription Link**
   - Visit `http://your-server:3000/podcasts`
   - Find the podcast series you want to subscribe to
   - Copy the corresponding RSS Feed URL

2. **Add to Podcast Client**
   - Open your preferred podcast client
   - Find "Add Podcast" or "Add RSS Feed"
   - Paste your Feed URL
   - Wait for content to sync

3. **Start Using**
   - All episodes will automatically sync to the client
   - Listening progress syncs across devices
   - Supports background download and offline playback
   - Can add chapter notes (supported by some clients)

### RSS Best Practices

1. **Content Organization**
   - Use clear folder structure
   - Maintain consistent file naming
   - Add high-quality cover images (recommended 1400x1400px)

2. **Performance Optimization**
   - Control the number of audio files per folder
   - Use mp3 format for best compatibility
   - Configure correct BASE_URL to ensure accessibility

## ⚙️ Environment Variables Configuration

The system supports multiple environment variables for customization. Here's the complete list:

| Variable | Description | Default | Example |
|---------|-------------|---------|---------|
| `AUDIO_DIR` | Audio files root directory | `./audio` | `/path/to/audiobooks` |
| `PORT` | Server listening port | `3000` | `8080` |
| `BASE_URL` | Server base URL for RSS feed links | `http://localhost:PORT` | `http://192.168.55.222:3000` |
| `TITLE_FORMAT` | Episode title display format | `full` | `clean` or `full` |

Detailed description:

1. **AUDIO_DIR**
   - Purpose: Specify root directory for audio files
   - Default: audio folder in current directory
   - Note: Directory must have read permissions

2. **PORT**
   - Purpose: Specify server listening port
   - Default: 3000
   - Note: Service won't start if port is occupied

3. **BASE_URL**
   - Purpose: Generate URLs in RSS feed
   - Default: `http://localhost:port`
   - Importance: Must be set correctly to ensure audio files are accessible
   - Format: Must include protocol (http/https)

4. **TITLE_FORMAT**
   - Purpose: Control episode title display format
   - Default: `full` (keep complete filename)
   - Options:
     * `full`: Keep complete filename (without extension)
     * `clean`: Remove number prefix and separators

Usage example:

```bash
# Docker run example
docker run -d \
  -p 3000:3000 \
  -v /audiobooks:/podcasts \
  -e AUDIO_DIR=/podcasts \
  -e PORT=3000 \
  -e BASE_URL=http://192.168.55.222:3000 \
  -e TITLE_FORMAT=full \
  yaotutu/folder2podcast
```

Configuration priority:
- Environment variables > Default values
- podcast.json config > Environment variables (for specific podcasts)

## ⚙️ Podcast Configuration File

Each podcast folder can contain its own `podcast.json` configuration file to customize that podcast's presentation and behavior. This design allows different settings for each podcast series.

### Configuration File Location
```
audiobooks/
├── podcast-series-1/
│   ├── 01-chapter1.mp3
│   └── podcast.json    # Independent config for series 1
└── podcast-series-2/
    ├── 01.intro.mp3
    └── podcast.json    # Independent config for series 2
```

### Configuration Parameters
```json
{
  "title": "Podcast Title",         // Title shown in podcast clients
  "description": "Description",     // Podcast description
  "author": "Author Name",          // Author information
  "alias": "podcast-name",         // English identifier for URL access (optional)
  "language": "en-us",             // Language code (RFC 5646)
  "category": "Technology",        // Podcast category
  "explicit": false,               // Content rating flag
  "email": "contact@example.com",  // Contact email (optional)
  "websiteUrl": "https://example.com", // Related website (optional)
  "titleFormat": "full"            // Title format: clean or full
}
```

### Important Notes
- Each podcast can have its own independent configuration
- Configuration file is optional, defaults used if not configured
- Folder-level config takes precedence over global environment variables
- Supports hot reload: changes take effect automatically

### Configuration Details
- **title/description**: Basic podcast display information
- **alias**: Creates memorable URL path, must be lowercase letters, numbers, and hyphens
- **language**: RFC 5646 standard language code (e.g., en-us, zh-cn)
- **category**: Podcast category, affects categorization in clients
- **explicit**: Content rating flag, indicates presence of sensitive content
- **titleFormat**: Controls file name display for this podcast, can override global setting

## 🌐 URL Access Standard

The system provides two standard URL access methods:

1. Original path access:
```
http://[server-address]/audio/[podcast-folder-name]/feed.xml
```

2. Alias path access:
```
http://[server-address]/audio/[english-alias]/feed.xml
```

Access rule explanation:
- Original path: Uses podcast folder name, supports Chinese encoding
- Alias path: Uses alias value from podcast.json, English and hyphens only
- Both paths point to the same resource, providing different access convenience

---