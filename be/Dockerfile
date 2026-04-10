# ===== Stage 1: Build =====
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .

RUN npm run build

# ===== Stage 2: Production =====
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Tận dụng node_modules đã build sẵn, xóa devDeps thay vì cài lại từ đầu
COPY --from=builder /app/node_modules ./node_modules
RUN npm prune --omit=dev

EXPOSE 3000
CMD ["node", "dist/main.js"]