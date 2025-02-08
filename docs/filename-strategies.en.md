# Filename Processing Strategies

## Episode Number Extraction Strategies

folder2podcast provides multiple flexible strategies for extracting episode numbers from filenames, configurable through the podcast.json configuration file.

### 1. Default Strategy

Uses 'prefix' strategy by default, which extracts numbers from the filename prefix:
- Looks for numbers at the beginning of the filename
- Requires separators after numbers (space, hyphen, etc.)
- Examples: '01-title.mp3', 'ep01_title.mp3'

### 2. Configurable Strategies

Set the episodeNumberStrategy field in podcast.json to choose a strategy:

```json
{
  "episodeNumberStrategy": "first"  // Available values: prefix, first, last, suffix
}
```

Supported strategies:

#### prefix strategy (default)
- Extracts numbers from filename prefix
- Examples:
  * '01-title.mp3' → Number: 1
  * 'ep01_title.mp3' → Number: 1

#### first strategy
- Finds the first number from left to right
- Similar to prefix but more lenient
- Examples:
  * '01-title.mp3' → Number: 1
  * 'zk001_title.mp3' → Number: 1

#### last strategy
- Extracts the last occurring number in the filename
- Examples:
  * 'title_01.mp3' → Number: 1
  * 'ep1v2.mp3' → Number: 2

#### suffix strategy
- Extracts numbers from the end of filename
- Examples:
  * 'title_01.mp3' → Number: 1
  * 'techdaily_ep01.mp3' → Number: 1

### 3. Handling Files Without Numbers

- When no number is found in filename (e.g., 'introduction.mp3'):
  * Uses file creation time as publish date
  * Sorts naturally by creation time
  * These files are placed after numbered files

### 4. Configuration Example

```json
{
  "title": "Podcast Title",
  "description": "Podcast Description",
  "episodeNumberStrategy": "first",  // Use first strategy
  "titleFormat": "clean"  // Clean numbers and separators from title
}
```

### 5. Naming Recommendations

For best results:
1. Maintain consistent naming style within each podcast directory
2. Prefer prefix numbers (e.g., '01-title.mp3')
3. Use clear separators (space, hyphen, underscore)
4. Avoid using numbers in titles that could be mistaken for episode numbers

### 6. Important Notes

1. When number extraction fails:
   - File is treated as unnumbered
   - Uses creation time as publish date
   - Sorted after numbered files

2. Number extraction rules:
   - Numbers need proper separators
   - File extensions are ignored
   - Supports multiple digits (e.g., '001', '999')

3. Sorting logic:
   - Numbered files are sorted by number and placed first
   - Unnumbered files are sorted by creation time and placed last