import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface ChangelogEntry {
    version: string;
    date: string;
    changes: {
        [category: string]: string[];
    };
}

const CATEGORIES = {
    '✨ 新特性 | New Features': ['feat', 'feature', '新增', '添加'],
    '🐛 问题修复 | Bug Fixes': ['fix', 'bug', '修复', '解决'],
    '⚡️ 性能优化 | Performance Improvements': ['perf', 'performance', '优化', '提升'],
    '📝 文档更新 | Documentation': ['docs', 'doc', '文档', 'README'],
    '🔧 其他改动 | Other Changes': ['chore', 'refactor', 'style', 'test', 'ci', 'build']
};

function getAllTags(): string[] {
    const tags = execSync('git tag -l', { encoding: 'utf-8' })
        .trim()
        .split('\n')
        .sort((a, b) => {
            // 版本号排序逻辑
            return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
        });
    return tags;
}

function getChangesForTag(prevTag: string, currentTag: string): string[] {
    try {
        const cmd = prevTag
            ? `git log ${prevTag}..${currentTag} --pretty=format:"%s" --no-merges`
            : `git log ${currentTag} --pretty=format:"%s" --no-merges`;
        return execSync(cmd, { encoding: 'utf-8' }).trim().split('\n');
    } catch (error) {
        return [];
    }
}

function categorizeChange(message: string): string {
    for (const [category, keywords] of Object.entries(CATEGORIES)) {
        if (keywords.some(keyword => message.toLowerCase().includes(keyword))) {
            return category;
        }
    }
    return '🔧 其他改动 | Other Changes';
}

function generateMarkdown(entries: ChangelogEntry[]): string {
    let markdown = '# Changelog\n\n';

    entries.reverse().forEach(entry => {
        markdown += `## [${entry.version}] - ${entry.date}\n\n`;

        Object.entries(entry.changes).forEach(([category, changes]) => {
            if (changes.length > 0) {
                markdown += `### ${category}\n\n`;
                changes.forEach(change => {
                    markdown += `- ${change}\n`;
                });
                markdown += '\n';
            }
        });
    });

    return markdown;
}

function main() {
    const tags = getAllTags();
    const entries: ChangelogEntry[] = [];

    tags.forEach((tag, index) => {
        const prevTag = index > 0 ? tags[index - 1] : '';
        const changes = getChangesForTag(prevTag, tag);

        const categorizedChanges: { [key: string]: string[] } = {};
        Object.keys(CATEGORIES).forEach(category => {
            categorizedChanges[category] = [];
        });

        changes.forEach(change => {
            const category = categorizeChange(change);
            categorizedChanges[category].push(change);
        });

        entries.push({
            version: tag,
            date: new Date().toISOString().split('T')[0], // 使用当前日期，您可以修改为实际发布日期
            changes: categorizedChanges
        });
    });

    const markdown = generateMarkdown(entries);
    fs.writeFileSync(path.join(process.cwd(), 'CHANGELOG.md'), markdown);
}

main(); 