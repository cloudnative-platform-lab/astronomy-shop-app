# Copyright The OpenTelemetry Authors
# SPDX-License-Identifier: Apache-2.0

# =========================
# 1. Dependencies
# =========================
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app/src/frontend

COPY ./src/frontend/package*.json ./

# Prevent Cypress from downloading its binary during image builds.
ENV CYPRESS_INSTALL_BINARY=0

RUN npm ci --no-audit --no-fund

# =========================
# 2. Builder
# =========================
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat protobuf-dev protoc

WORKDIR /app/src/frontend

COPY --from=deps /app/src/frontend/node_modules ./node_modules
COPY ./pb /app/pb
COPY ./src/frontend ./

RUN npm run grpc:generate
RUN npm run build

# =========================
# 3. Runner
# =========================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs \
    && adduser -S nextjs -u 1001

COPY --from=builder /app/src/frontend/next.config.js ./
COPY --from=builder /app/src/frontend/utils/telemetry/Instrumentation.js ./
COPY --from=builder /app/src/frontend/public ./public
COPY --from=builder /app/src/frontend/package.json ./package.json
COPY --from=deps /app/src/frontend/node_modules ./node_modules

COPY --from=builder --chown=nextjs:nodejs /app/src/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/src/frontend/.next/static ./.next/static

USER 1001:1001

EXPOSE 8080

CMD ["node", "--require", "./Instrumentation.js", "server.js"]
