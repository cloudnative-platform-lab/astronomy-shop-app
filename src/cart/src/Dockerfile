# Build
FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:8.0 AS builder

ARG TARGETARCH

WORKDIR /usr/src/app

COPY ./src/cart/ ./
COPY ./pb/ ./pb/

RUN dotnet restore ./src/cart.csproj

RUN dotnet publish ./src/cart.csproj \
    -c Release \
    -o /cart

# Runtime (Distroless)
FROM mcr.microsoft.com/dotnet/runtime-deps:8.0-jammy-chiseled

WORKDIR /usr/src/app

COPY --from=builder /cart/ .

ENV DOTNET_HOSTBUILDER__RELOADCONFIGONCHANGE=false

ENTRYPOINT ["./cart"]