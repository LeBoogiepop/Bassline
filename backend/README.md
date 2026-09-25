# Bassline backend — Redis-backed transcription jobs

Flask accepts the upload, RQ queues a background task in Redis, and a separate worker runs Demucs, Basic Pitch, and fretboard mapping. The existing `POST /transcribe` and `GET /jobs/<id>` response contract remains compatible with the frontend.

## Run the stack (recommended)

From the **repository root**:

```bash
docker compose up --build
```

This launches:
- `api` — Flask on http://localhost:5000
- `worker` — RQ worker processing the `bassline` queue
- `redis` — AOF-enabled Redis storing job queue, status, and results

API and worker share a Docker `uploads` volume. Redis has a separate `redis-data` volume. Do not expose Redis on a public port. Audio files are removed on successful completion; files from permanently failed jobs remain in the shared volume for diagnosis and **must be pruned** according to your data-retention policy.

## Running without Compose

Install backend dependencies (`pip install -r backend/requirements.txt`), start Redis locally on port 6379, then run these in separate terminals from the project root:

```bash
python -m backend.app
rq worker --url redis://localhost:6379/0 bassline
```

Set `REDIS_URL` and `UPLOAD_FOLDER` identically for API and worker. Both processes must see the **same filesystem path**, even when run in separate containers. Configure `JOB_TIMEOUT_SECONDS` (default 3600) for very long audio files.

## Endpoints

- `POST /transcribe` — multipart form data: `audio` (.mp3/.wav/.ogg/.m4a, max 16 MiB), `difficulty` (`beginner`, `intermediate` or `pro`). Returns HTTP 202 and `{"job_id": "...", "status": "pending"}`.
- `GET /jobs/<id>` — returns `status` (`pending`, `processing`, `completed`, `failed`), `progress` (0–100), `result` on success, `error` on failure.
- `GET /health` — returns 200 if Redis responds; 503 otherwise. This does **not** check whether an RQ worker is online.

Progress is saved to Redis from the worker, not kept in the API process. Queued jobs and uploaded files survive API restarts. RQ is configured with up to two automatic retries for worker exceptions. Abrupt worker termination and machine failure still require operational monitoring; use RQ's failed job registry for diagnosis and manual requeue if necessary.

**Limitations:** This is a single-worker local deployment with persistent queue metadata, not evidence of millions-of-users scalability. The upload volume must be shared storage for multi-host deployment. Failed audio must be deleted after a retention period, and public deployment requires auth, rate limiting, upload scanning, and HTTPS.

## Lightweight queue/API tests

Install Flask, Flask-CORS, python-dotenv, Redis, RQ and fakeredis, then run:

```bash
python -m unittest discover -s backend/tests -p 'test_queue.py' -v
```

The queue tests do not load Demucs/PyTorch. Run an end-to-end transcription against real Redis and a worker separately before deploying.
