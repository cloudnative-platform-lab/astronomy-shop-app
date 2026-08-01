FROM golang:1.24-alpine AS builder

WORKDIR /workspace

COPY src/checkout ./src/checkout
COPY src/email ./src/email

RUN cd src/email && \
    go mod tidy && \
    CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags='-s -w' -o /out/email .

FROM gcr.io/distroless/static:nonroot

COPY --from=builder /out/email /app/email

USER 65532:65532
EXPOSE 8080
ENTRYPOINT ["/app/email"]
