FROM python:3.10-slim

# Install system dependencies
# ffmpeg is required for audio processing
RUN apt-get update && apt-get install -y \
    ffmpeg \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first for caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p temp_uploads

# Set environment variables
ENV FLASK_APP=backend.app
ENV PYTHONPATH=/app

# Expose port
EXPOSE 5000

# Run the application
CMD ["python", "-m", "backend.app"]
