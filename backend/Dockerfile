FROM python:3.11-slim
RUN apt-get update && apt-get install -y dos2unix && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN dos2unix docker-entrypoint.sh && chmod +x docker-entrypoint.sh
EXPOSE 8000
ENTRYPOINT ["/bin/bash", "/app/docker-entrypoint.sh"]
