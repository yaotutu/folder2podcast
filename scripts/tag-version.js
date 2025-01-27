#!/usr/bin/env node

const { execSync } = require('child_process');

function getLatestTag() {
    try {
        // 获取所有标签并按版本排序
        const tags = execSync('git tag -l "v*"')
            .toString()
            .trim()
            .split('\n')
            .filter(tag => /^v\d+\.\d+\.\d+$/.test(tag))
            .sort((a, b) => {
                const partsA = a.slice(1).split('.').map(Number);
                const partsB = b.slice(1).split('.').map(Number);
                for (let i = 0; i < 3; i++) {
                    if (partsA[i] !== partsB[i]) {
                        return partsB[i] - partsA[i];
                    }
                }
                return 0;
            });

        return tags[0]; // 返回最新的标签
    } catch (error) {
        console.error('获取标签失败:', error.message);
        process.exit(1);
    }
}

function incrementTag(tag) {
    const parts = tag.slice(1).split('.').map(Number);
    parts[2] += 1; // 增加最后一个数字
    return `v${parts.join('.')}`;
}

function createAndPushTag(newTag) {
    try {
        // 创建新标签
        execSync(`git tag ${newTag}`);
        console.log(`创建标签: ${newTag}`);

        // 推送到远程
        execSync(`git push origin ${newTag}`);
        console.log(`推送标签: ${newTag}`);
    } catch (error) {
        console.error('创建或推送标签失败:', error.message);
        process.exit(1);
    }
}

// 主函数
function main() {
    const latestTag = getLatestTag();
    console.log('当前最新标签:', latestTag);

    const newTag = incrementTag(latestTag);
    console.log('将创建新标签:', newTag);

    createAndPushTag(newTag);
    console.log('完成!');
}

main();