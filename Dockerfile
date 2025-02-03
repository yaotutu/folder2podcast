# 构建阶段
FROM node:20-alpine as builder

WORKDIR /app

# 首先只复制 package 文件以利用缓存
COPY package*.json ./
RUN npm install

# 复制源代码和其他文件
COPY . .

# 构建项目
RUN npm run build

# 运行阶段
FROM node:20-alpine

WORKDIR /app

# 复制构建产物和必要文件
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/assets ./assets

# 创建音频文件夹
RUN mkdir -p /podcasts \
    && chown -R node:node /podcasts \
    && chmod 755 /podcasts

# 使用非 root 用户运行
USER node

# 设置环境变量
ENV NODE_ENV=production \
    PORT=3000 \
    AUDIO_DIR=/podcasts

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/podcasts || exit 1

# 启动命令
CMD ["node", "dist/index.js"]