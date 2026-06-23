# =========================
# 1. Builder Stage
# =========================
FROM golang:1.22-alpine AS builder

WORKDIR /app

# copy go mod files first (better caching)
COPY go.mod go.sum ./

RUN go mod download

# copy source code
COPY . .

# build binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags "-s -w" -o checkout .

# =========================
# 2. Distroless Runtime Stage
# =========================
FROM gcr.io/distroless/static:nonroot

WORKDIR /app

# copy binary from builders
COPY --from=builder /app/checkout /app/checkout

EXPOSE 8080

USER nonroot:nonroot

ENTRYPOINT ["/app/checkout"]