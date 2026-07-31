# Copyright The OpenTelemetry Authors
# SPDX-License-Identifier: Apache-2.0

FROM nginx:1.27.0-otel

RUN apt-get update ; apt-get install lsb-release --no-install-recommends --no-install-suggests -y

# This file is needed for nginx-module-otel to be found.
RUN echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] http://nginx.org/packages/mainline/debian `lsb_release -cs` nginx" | tee /etc/apt/sources.list.d/nginx.list

RUN apt-get update ; apt-get install nginx-module-otel --no-install-recommends --no-install-suggests -y

RUN addgroup --gid 10001 image-provider \
    && adduser --uid 10001 --gid 10001 --disabled-password --gecos "" image-provider \
    && mkdir /static \
    && chown -R 10001:10001 /static
COPY --chown=10001:10001 src/image-provider/static /static

EXPOSE ${IMAGE_PROVIDER_PORT}

STOPSIGNAL SIGQUIT

COPY src/image-provider/nginx.conf.template /nginx.conf.template

USER 10001:10001

# Start nginx
CMD ["/bin/sh" , "-c" , "envsubst '$OTEL_COLLECTOR_HOST $IMAGE_PROVIDER_PORT $OTEL_COLLECTOR_PORT_GRPC $OTEL_SERVICE_NAME' < /nginx.conf.template > /tmp/nginx.conf && exec nginx -c /tmp/nginx.conf -g 'daemon off;'"]
