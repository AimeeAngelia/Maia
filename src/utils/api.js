// API 基础配置
const API_BASE_URL = import.meta.env.DEV
    ? 'http://localhost:3001/api'
    : 'https://your-api-domain.com/api';

// API 请求工具类
export class ForumAPI {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // 帖子相关 API
    static async getPosts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/posts?${queryString}` : '/posts';
        return this.request(endpoint);
    }

    static async getPost(id) {
        return this.request(`/posts/${id}`);
    }

    static async createPost(postData) {
        return this.request('/posts', {
            method: 'POST',
            body: postData,
        });
    }

    static async updatePost(id, postData) {
        return this.request(`/posts/${id}`, {
            method: 'PUT',
            body: postData,
        });
    }

    static async deletePost(id) {
        return this.request(`/posts/${id}`, {
            method: 'DELETE',
        });
    }

    static async likePost(id) {
        return this.request(`/posts/${id}/like`, {
            method: 'POST',
        });
    }

    static async getForumStats() {
        return this.request('/posts/stats/overview');
    }

    // 评论相关 API
    static async getComments(postId, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString
            ? `/comments/post/${postId}?${queryString}`
            : `/comments/post/${postId}`;
        return this.request(endpoint);
    }

    static async getComment(id) {
        return this.request(`/comments/${id}`);
    }

    static async createComment(commentData) {
        return this.request('/comments', {
            method: 'POST',
            body: commentData,
        });
    }

    static async updateComment(id, commentData) {
        return this.request(`/comments/${id}`, {
            method: 'PUT',
            body: commentData,
        });
    }

    static async deleteComment(id) {
        return this.request(`/comments/${id}`, {
            method: 'DELETE',
        });
    }

    static async likeComment(id) {
        return this.request(`/comments/${id}/like`, {
            method: 'POST',
        });
    }

    // 健康检查
    static async healthCheck() {
        return this.request('/health');
    }
}

// 错误处理工具
export function handleAPIError(error) {
    console.error('API Error:', error);

    // 根据不同错误类型返回用户友好的错误信息
    if (error.message.includes('网络')) {
        return '网络连接失败，请检查网络连接';
    } else if (error.message.includes('404')) {
        return '请求的资源不存在';
    } else if (error.message.includes('500')) {
        return '服务器内部错误，请稍后重试';
    } else {
        return error.message || '未知错误';
    }
}

// 格式化时间工具
export function formatTime(timeStr) {
    const time = new Date(timeStr);
    const now = new Date();
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} 分钟前`;
    if (hours < 24) return `${hours} 小时前`;
    if (days < 7) return `${days} 天前`;
    return time.toLocaleDateString('zh-CN');
}

// 内容格式化工具（简单的 markdown 支持）
export function formatContent(content) {
    return content
        .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
}

export default ForumAPI;
