const PODCAST_CLIENTS = {
    'apple': {
        name: 'Apple Podcasts',
        scheme: (feedUrl) => {
            // 移除 URL 中的 http:// 或 https:// 前缀
            const cleanUrl = feedUrl.replace(/^https?:\/\//, '');
            return `podcast://${cleanUrl}`;
        }
    },
    'overcast': {
        name: 'Overcast',
        scheme: (feedUrl) => `overcast://x-callback-url/add?url=${encodeURIComponent(feedUrl)}`
    },
    'pocketcasts': {
        name: 'Pocket Casts',
        scheme: (feedUrl) => `pktc://subscribe/${encodeURIComponent(feedUrl)}`
    },
    'castro': {
        name: 'Castro',
        scheme: (feedUrl) => `castro://subscribe/${encodeURIComponent(feedUrl)}`
    },
    'spotify': {
        name: 'Spotify',
        scheme: (feedUrl) => null
    },
    'moonfm': {
        name: 'Moon FM',
        scheme: (feedUrl) => `moonfm://add-feed?url=${encodeURIComponent(feedUrl)}`
    },
    // 'breaker': {
    //     name: 'Breaker',
    //     scheme: (feedUrl) => `breaker://podcast/add?feed=${encodeURIComponent(feedUrl)}`
    // },
    // 'googlepodcasts': {
    //     name: 'Google Podcasts',
    //     scheme: (feedUrl) => `https://podcasts.google.com/?feed=${encodeURIComponent(feedUrl)}`
    // },
    // 'podcastaddict': {
    //     name: 'Podcast Addict',
    //     scheme: (feedUrl) => `podcastaddict://subscribe/?url=${encodeURIComponent(feedUrl)}`
    // },
    // 'xiaoyuzhoufm': {
    //     name: '小宇宙',
    //     scheme: (feedUrl) => `xyzfm://feed?url=${encodeURIComponent(feedUrl)}`
    // },
    // 'himalaya': {
    //     name: '喜马拉雅',
    //     scheme: (feedUrl) => `himalaya://podcast/feed?url=${encodeURIComponent(feedUrl)}`
    // },
    // 'lizhi': {
    //     name: '荔枝',
    //     scheme: (feedUrl) => `lizhi://podcast/subscribe?url=${encodeURIComponent(feedUrl)}`
    // },
    // 'qingting': {
    //     name: '蜻蜓FM',
    //     scheme: (feedUrl) => `qtfm://podcast/subscribe?url=${encodeURIComponent(feedUrl)}`
    // },
    // 'ximalaya': {
    //     name: '喜马拉雅国际版',
    //     scheme: (feedUrl) => `ximalaya://podcast/subscribe?url=${encodeURIComponent(feedUrl)}`
    // }
};

// 获取完整的 URL
function getFullUrl(path) {
    // 获取当前页面的 origin（包含协议、域名和端口）
    const origin = window.location.origin;
    // 确保 path 以 / 开头
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${origin}${normalizedPath}`;
}

async function loadPodcasts() {
    try {
        const response = await fetch('/podcasts');
        const data = await response.json();
        renderPodcasts(data.podcasts);
    } catch (error) {
        console.error('加载播客列表失败:', error);
        document.getElementById('podcast-list').innerHTML = `
            <div class="error">
                加载失败，请稍后重试
            </div>
        `;
    }
}

function renderPodcasts(podcasts) {
    const podcastList = document.getElementById('podcast-list');
    podcastList.innerHTML = podcasts.map(podcast => {
        const fullFeedUrl = getFullUrl(podcast.feedUrl);
        return `
            <div class="podcast-card">
                <div class="podcast-header">
                    <img class="podcast-cover" src="${podcast.coverUrl}" alt="${podcast.title} 封面">
                    <div class="podcast-info">
                        <div class="podcast-title">${podcast.title}</div>
                        <div class="podcast-description">${podcast.description}</div>
                        <div class="podcast-meta">
                            剧集数量: ${podcast.episodeCount}
                            ${podcast.latestEpisodeDate ? `· 最新更新: ${new Date(podcast.latestEpisodeDate).toLocaleDateString()}` : ''}
                        </div>
                    </div>
                </div>
                <div class="subscribe-section">
                    <div class="feed-url-section">
                        <input type="text" 
                               class="feed-url" 
                               value="${fullFeedUrl}" 
                               readonly
                               onclick="this.select()"
                        >
                        <button class="subscribe-button copy-button" onclick="copyFeedUrl(this, '${fullFeedUrl}')">
                            复制订阅地址
                        </button>
                    </div>
                    <div class="subscribe-buttons">
                        ${renderSubscribeButtons(fullFeedUrl)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderSubscribeButtons(feedUrl) {
    return Object.entries(PODCAST_CLIENTS)
        .filter(([_, client]) => client.scheme(feedUrl) !== null)
        .map(([key, client]) => `
            <a href="${client.scheme(feedUrl)}" 
               class="subscribe-button" 
               target="_blank"
               rel="noopener noreferrer">
                ${client.name}
            </a>
        `).join('');
}

function copyFeedUrl(button, url) {
    // 创建一个临时的文本输入框
    const tempInput = document.createElement('input');
    tempInput.value = url;
    document.body.appendChild(tempInput);

    try {
        // 选择文本
        tempInput.select();
        tempInput.setSelectionRange(0, 99999); // 对于移动设备

        // 尝试使用新API
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(url).then(() => {
                updateCopyButton(button, '复制成功');
            }).catch(() => {
                // 如果新API失败，回退到传统方法
                document.execCommand('copy');
                updateCopyButton(button, '复制成功');
            });
        } else {
            // 在不支持新API的环境中使用传统方法
            document.execCommand('copy');
            updateCopyButton(button, '复制成功');
        }
    } catch (err) {
        console.error('复制失败:', err);
        updateCopyButton(button, '复制失败');
    } finally {
        // 移除临时输入框
        document.body.removeChild(tempInput);
    }
}

function updateCopyButton(button, text) {
    const originalText = '复制订阅地址';
    button.textContent = text;
    button.disabled = true;

    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
    }, 2000);
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', loadPodcasts); 