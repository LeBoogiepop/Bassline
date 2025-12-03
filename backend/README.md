# Bassline Backend

Production-grade audio processing backend for Bassline.
Handles bass isolation (Demucs), transcription (Basic Pitch), and fretboard mapping.

## Architecture

- **Framework**: Flask
- **Audio Processing**: Native `demucs` and `basic-pitch` integration
- **Task Queue**: In-memory `ThreadPoolExecutor` (Async processing)
- **Storage**: Temporary file management with auto-cleanup

## Setup

1. **Install Dependencies**

   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` and configure:

   ```
   FLASK_ENV=development
   SECRET_KEY=your-secret-key
   ```

3. **Run Locally**
   From the project root (`c:/dev/bassline`):
   ```bash
   python -m backend.app
   ```

## API Documentation

### `POST /transcribe`

Upload an audio file for processing.

**Request:**

- `multipart/form-data`
- `audio`: File (mp3, wav, etc.)

**Response:**

```json
{
  "job_id": "uuid",
  "status": "pending",
  "message": "Transcription started"
}
```

### `GET /jobs/<job_id>`

Check the status of a transcription job.

**Response:**

```json
{
  "status": "completed",
  "progress": 100,
  "result": {
    "notes": [
      {
        "time": 0.5,
        "string": 0,
        "fret": 5,
        "duration": 0.2,
        "velocity": 0.8,
        "pitch": 45
      }
    ]
  }
}
```

### `GET /health`

Health check endpoint.

## Docker

Build and run with Docker:

```bash
docker build -t bassline-backend ./backend
docker run -p 5000:5000 bassline-backend
```
