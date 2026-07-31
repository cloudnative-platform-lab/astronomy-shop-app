# Copyright The OpenTelemetry Authors
# SPDX-License-Identifier: Apache-2.0

FROM envoyproxy/envoy:v1.32-latest
RUN apt-get update \
    && apt-get install -y --no-install-recommends gettext-base \
    && groupadd --gid 10001 envoy-runtime \
    && useradd --uid 10001 --gid 10001 --create-home --home-dir /home/envoy-runtime --shell /usr/sbin/nologin envoy-runtime \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /home/envoy-runtime
COPY --chown=10001:10001 ./src/frontend-proxy/envoy.tmpl.yaml ./envoy.tmpl.yaml

USER 10001:10001

ENTRYPOINT ["/bin/sh", "-c", "envsubst < /home/envoy-runtime/envoy.tmpl.yaml > /tmp/envoy.yaml && exec envoy -c /tmp/envoy.yaml"]
