# 构建阶段
FROM node:20-alpine as builder

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建项目
RUN npm run build

# 运行阶段
FROM node:20-alpine

WORKDIR /app

# 只复制必要的文件
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# 创建音频文件夹
RUN mkdir -p /podcasts

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000
ENV AUDIO_DIR=/podcasts

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "dist/index.js", "/podcasts", "3000"]