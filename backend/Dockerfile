FROM python:3.10-slim

# Building basic-pitch from GitHub requires git; ffmpeg/libsndfile are used by audio IO.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg libsndfile1 git build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
# Build with repository root as Docker context (see docker-compose.yml).
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt
COPY backend/ /app/backend/
RUN mkdir -p /app/uploads

ENV PYTHONPATH=/app \
    FLASK_ENV=production \
    UPLOAD_FOLDER=/app/uploads \
    REDIS_URL=redis://redis:6379/0

EXPOSE 5000
CMD ["python", "-m", "backend.app"]
