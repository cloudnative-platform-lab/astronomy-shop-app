FROM python:3.12-slim-bookworm

WORKDIR /usr/src/app

COPY src/recommendation/requirements.txt ./

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY src/recommendation/ .

ENV RECOMMENDATION_PORT=1010

ENTRYPOINT ["python", "recommendation_server.py"]
