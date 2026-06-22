# Copyright The OpenTelemetry Authorss
# SPDX-License-Identifier: Apache-2.0

FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY ./src/frontend/package*.json ./
RUN npm ci


FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat protobuf-dev protoc

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY ./pb ./pb
COPY ./src/frontend ./

RUN npm run grpc:generate
RUN npm run build


FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat protobuf-dev protoc

ENV NODE_ENV=production
ENV PORT=8080

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy standalone Next.js build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# IMPORTANT: runtime entry server is inside standalone output
USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]
