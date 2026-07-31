FROM golang:1.24-alpine AS builder

WORKDIR /usr/src/app

# Copy module files first
COPY go.mod go.sum ./

RUN go mod download

# Copy full source code
COPY . .

RUN go build -o product-catalog .

####################################

FROM alpine AS release

RUN addgroup -S -g 10001 product-catalog \
    && adduser -S -D -H -u 10001 -G product-catalog product-catalog

WORKDIR /usr/src/app/

# runtime assets
COPY --chown=10001:10001 products ./products

# binary
COPY --chown=10001:10001 --from=builder /usr/src/app/product-catalog ./product-catalog

ENV PRODUCT_CATALOG_PORT=8088

USER 10001:10001
ENTRYPOINT ["./product-catalog"]
