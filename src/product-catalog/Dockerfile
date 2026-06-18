FROM golang:1.22-alpine AS builder

WORKDIR /usr/src/app

# Copy module files first (from correct folder)
COPY go.mod go.sum ./

RUN go mod download

# Copy full source code
COPY . .

RUN go build -o product-catalog .

####################################

FROM alpine AS release

WORKDIR /usr/src/app/

# Copy runtime assets
COPY products ./products

# Copy binary from builder
COPY --from=builder /usr/src/app/product-catalog ./product-catalog

ENV PRODUCT_CATALOG_PORT=8088

ENTRYPOINT ["./product-catalog"]
