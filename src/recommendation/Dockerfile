FROM python:3.12-slim-bookworm

WORKDIR /usr/src/app

COPY src/recommendation/requirements.txt ./

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

RUN groupadd --gid 10001 recommendation \
    && useradd --uid 10001 --gid 10001 --create-home --home-dir /home/recommendation --shell /usr/sbin/nologin recommendation

COPY --chown=10001:10001 src/recommendation/ .

ENV RECOMMENDATION_PORT=1010

USER 10001:10001
ENTRYPOINT ["python", "recommendation_server.py"]
