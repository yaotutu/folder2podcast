# 📘 Advanced Usage Guide

## Table of Contents
- [File Naming Convention](#file-naming-convention)
- [Configuration Details](#configuration-details)
- [Advanced Features](#advanced-features)
- [Deployment Methods](#deployment-methods)
- [API Usage](#api-usage)
- [Best Practices](#best-practices)

## File Naming Convention

### Smart Filename Processing

The system supports two filename formats and processes them intelligently:

#### 1. Numbered Format (Recommended)
- Format 1: `Number + Title.extension` (e.g., `01-Chapter1.mp3`)
- Format 2: `Title + Number.extension` (e.g., `Chapter01.mp3`)
- System prioritizes numbers at the start of filenames for episode numbering

#### 2. Non-numbered Format
- Use descriptive filenames (e.g., `Introduction.mp3`)
- System generates unique sorting values based on creation time and file size
- Preserves complete filename as title (without extension)

### Title Display Strategy

Control title display through global environment variables or per-podcast configuration:

- **Full Mode** (Default): Preserves original filename (without extension)
  ```bash
  01-Intro.mp3    → "01-Intro"
  Episode01.mp3   → "Episode01"
  Intro01.mp3     → "Intro01"
  ```

- **Clean Mode**: Removes numbers and separators (only for numbered files)
  ```bash
  01-Intro.mp3    → "Intro"
  Episode01.mp3   → "Episode"
  Intro01.mp3     → "Intro"
  ```

## Configuration Details

### Complete podcast.json Configuration

```json
{
  "title": "Podcast Title",         // Title shown in podcast clients
  "description": "Description",     // Podcast description
  "author": "Author Name",          // Author information
  "alias": "podcast-name",         // URL identifier (optional)
  "language": "en-us",             // Language code (RFC 5646)
  "category": "Technology",        // Podcast category
  "explicit": false,               // Content rating flag
  "email": "contact@example.com",  // Contact email (optional)
  "websiteUrl": "https://example.com", // Related website (optional)
  "titleFormat": "full"            // Title format: clean or full
}
```

### Configuration Item Details
- **title/description**: Basic podcast display information
- **alias**: Creates URL-friendly path, must use lowercase letters, numbers, and hyphens
- **language**: RFC 5646 standard language code (e.g., en-us, zh-cn)
- **category**: Affects categorization in podcast clients
- **explicit**: Indicates presence of sensitive content
- **titleFormat**: Controls filename display, can override global setting



### Episode Time Management

System uses two different time management strategies based on filename format:

1. **Numbered Files**:
   - Uses base date plus episode number to generate publish time
   - Lower numbers get earlier publish dates
   - Example: `01-Intro.mp3` publishes before `02-Main.mp3`

2. **Non-numbered Files**:
   - Uses actual file creation time as publish date
   - Generates unique sorting value from creation time and file size
   - Maintains natural time order

### URL Access Standards

System provides two standard URL access methods:

1. Original Path Access:
```
http://[server-address]/audio/[podcast-folder-name]/feed.xml
```

2. Alias Path Access:
```
http://[server-address]/audio/[english-alias]/feed.xml
```

## Deployment Methods

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

## API Usage

### 1. Podcast List API
- Access `/podcasts` to get all available podcasts
- Returns detailed information including title, description, subscription URLs
- Supports both Chinese path and English alias access
- Feed URLs include complete access addresses ready for subscription

### 2. Resource Access
- Podcast cover: `/audio/podcast-name/cover.jpg`
- Audio files: `/audio/podcast-name/episode.mp3`
- Default resources: `/image/default-cover.jpg`

### Static Resource Directory Structure
```
assets/
├── web/          # Web interface files
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── image/        # Image resources
│   └── default-cover.jpg
```

## Best Practices

### 1. Directory Organization
- Separate folder for each podcast series
- Use number prefixes for correct ordering
- Add clear file descriptions
- Configure appropriate podcast information

### 2. Performance Optimization
- Control number of files per folder
- Use English aliases for better compatibility
- Add appropriately sized cover images (square recommended)

### 3. Security
- Use read-only mounts to protect audio files
- Avoid special characters in filenames
