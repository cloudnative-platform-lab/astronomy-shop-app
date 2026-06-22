# ===================== DEPENDENCIES =====================
FROM node:20-alpine AS deps

WORKDIR /app

COPY ./src/frontend/package*.json ./
RUN npm ci


# ===================== BUILDER =====================
FROM node:20-alpine AS builder

RUN apk add --no-cache curl unzip libc6-compat

WORKDIR /app

# install protoc (only if grpc:generate needs it)
RUN curl -LO https://github.com/protocolbuffers/protobuf/releases/download/v25.3/protoc-25.3-linux-x86_64.zip && \
    unzip protoc-25.3-linux-x86_64.zip -d /usr/local

ENV PATH="/usr/local/bin:$PATH"

# copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# copy source + proto files
COPY ./pb ./pb
COPY ./src/frontend ./src/frontend

WORKDIR /app/src/frontend

# ===================== IMPORTANT =====================
# grpc generation is already inside "npm run build"
# so we only call build
RUN npm run build


# ===================== RUNTIME (DISTROLESS) =====================
FROM gcr.io/distroless/nodejs20-debian12 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# copy standalone output
COPY --from=builder /app/src/frontend/.next/standalone ./
COPY --from=builder /app/src/frontend/.next/static ./.next/static
COPY --from=builder /app/src/frontend/public ./public

EXPOSE 8080

# distroless requires entry file
CMD ["server.js"]