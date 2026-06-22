# ===================== DEPENDENCIES =====================
FROM node:20-alpine AS deps

WORKDIR /app

COPY ./src/frontend/package*.json ./
RUN npm ci


# ===================== BUILDER =====================
FROM node:20-alpine AS builder

RUN apk add --no-cache curl unzip libc6-compat

WORKDIR /app

# install protoc
RUN curl -LO https://github.com/protocolbuffers/protobuf/releases/download/v25.3/protoc-25.3-linux-x86_64.zip && \
    unzip protoc-25.3-linux-x86_64.zip -d /usr/local

ENV PATH="/usr/local/bin:$PATH"

# copy deps
COPY --from=deps /app/node_modules ./node_modules

# copy full repo context needed for grpc
COPY ./pb ./pb
COPY ./src/frontend ./src/frontend

WORKDIR /app/src/frontend

# run grpc generation (now pb is reachable via ../../pb)
RUN npm run grpc:generate

# build next.js
RUN npm run build


# ===================== RUNTIME (DISTROLESS) =====================
FROM gcr.io/distroless/nodejs20-debian12 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY --from=builder /app/src/frontend/.next/standalone ./
COPY --from=builder /app/src/frontend/.next/static ./.next/static
COPY --from=builder /app/src/frontend/public ./public

EXPOSE 8080

CMD ["server.js"]