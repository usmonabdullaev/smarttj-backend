# syntax = docker/dockerfile:1

# -------------------------
# Base image
# -------------------------
ARG NODE_VERSION=22.21.1
FROM node:${NODE_VERSION}-slim AS base

WORKDIR /app
ENV NODE_ENV=production

# -------------------------
# Build stage
# -------------------------
FROM base AS build

# Устанавливаем зависимости для сборки
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    build-essential node-gyp openssl pkg-config python-is-python3

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем все зависимости (dev + prod)
RUN npm ci

# Копируем весь проект
COPY . .

# Генерируем Prisma Client
RUN npx prisma generate

# Компилируем NestJS через TypeScript
RUN npx tsc -p tsconfig.build.json

# -------------------------
# Production stage
# -------------------------
FROM base

# Устанавливаем минимально нужные пакеты
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y openssl && \
    rm -rf /var/lib/apt/lists/*

# Копируем полностью билд из build stage
COPY --from=build /app /app

# Убираем dev зависимости
RUN npm prune --omit=dev

# Указываем порт, который слушает Fly
EXPOSE 8080

# Стартуем приложение напрямую через Node (не через npm)
CMD ["node", "dist/main.js"]
