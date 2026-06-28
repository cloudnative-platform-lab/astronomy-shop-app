# =========================
# 1. Base image
# =========================
FROM node:20-alpine AS base

WORKDIR /app

# install system deps
RUN apk add --no-cache libc6-compat python3 make g++ protobuf protobuf-dev

# =========================
# 2. Dependencies stage
# =========================
FROM base AS deps

WORKDIR /app

# copy only package files first (better caches)
COPY ./src/frontend/package*.json ./

# 🚨 disable Cypress download
ENV CYPRESS_INSTALL_BINARY=0
ENV npm_config_loglevel=verbose

# npm stability for CI/network issues
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-retries 10 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 300000 && \
    npm config set fetch-timeout 600000 && \
    npm config set maxsockets 1 && \
    npm config set strict-ssl true

RUN npm ci --no-audit --no-fund

# =========================
# 3. Builder stage
# =========================
FROM base AS builder

WORKDIR /app

# copy source + proto
COPY ./src/frontend ./src/frontend
COPY ./pb ./pb

# bring deps
COPY --from=deps /app/node_modules ./node_modules

# install ts-proto plugin (THIS IS THE FIX)
RUN npm install -g ts-proto

WORKDIR /app/src/frontend

# generate protobuf
RUN mkdir -p ./protos && \
    protoc -I /app/pb \
    --plugin=protoc-gen-ts_proto=$(which protoc-gen-ts_proto) \
    --ts_proto_out=./protos \
    --ts_proto_opt=esModuleInterop=true \
    --ts_proto_opt=outputServices=grpc-js \
    /app/pb/demo.proto

# build app
RUN npm run build

# =========================
# 4. Runner stage
# =========================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# copy only built output + deps
COPY --from=builder /app/src/frontend ./
COPY --from=builder /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]