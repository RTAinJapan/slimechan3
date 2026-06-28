# syntax=docker/dockerfile:1

# Next.js (output: "standalone") をマルチステージでビルドして最小イメージにする。

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Next.js standalone サーバ内部の url.parse() による DEP0169 警告のみ抑止する
# （アプリ動作には影響しない Next.js 側の既知警告）。
ENV NODE_OPTIONS=--disable-warning=DEP0169
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# 投票〆トグルの永続先（compose で volume をマウントする）。
ENV VOTE_OVERRIDE_FILE=/app/data/vote-overrides.json
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# standalone 出力（server.js と最小 node_modules）＋静的アセット＋public をコピー。
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
