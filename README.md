# Bassline

Audio-ML bass transcription turned into an interactive learning tool.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React Three Fiber](https://img.shields.io/badge/React_Three_Fiber-black?style=for-the-badge&logo=react&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)

![Demo Screenshot](./public/demo.png)

## What it does

Bassline takes an audio file and turns it into an interactive bass lesson:

1. **Demucs** isolates the bass stem.
2. **Basic Pitch** estimates note events.
3. A difficulty-aware fretboard mapper chooses playable string/fret positions.
4. The browser renders a synchronized tablature and 3D bass interface.

The ML models are existing models; the engineering work is in the pipeline, backend/API, mapping logic and interactive product built around their output.

## Architecture

```text
Audio upload
    |
    v
Flask API ---> Redis/RQ job state
                  |
                  v
              RQ worker
                  |
          Demucs -> Basic Pitch
                  |
          fretboard mapping
                  |
                  v
React/Vite UI <--- polling /jobs/<id>
    |
React Three Fiber + synchronized audio
```

The API and worker are intentionally separated because audio processing is long-running. Redis/RQ keeps queue metadata and job status outside the Flask process, so an API restart does not erase queued jobs. See [backend/README.md](./backend/README.md) for the deployment model and its current limitations.

## Features

- Bass source separation with Demucs
- Note estimation with Basic Pitch
- Beginner/intermediate/pro fretboard mapping
- Background jobs with progress polling
- React Three Fiber / Three.js visualization synchronized with audio
- Pipeline explorer explaining the processing steps
- French and English UI

## Stack

**Frontend:** React 19, TypeScript, Vite, React Three Fiber / Three.js, Framer Motion, Zustand

**Backend:** Python, Flask, Demucs, Basic Pitch

**Async / infra:** Redis, RQ, Docker, Docker Compose

## Run locally

The easiest way to start the backend stack is:

```bash
docker compose up --build
```

Then run the frontend:

```bash
npm install
npm run dev
```

For worker details, persistence behavior, tests and operational limitations, see [backend/README.md](./backend/README.md).

## Tests

Queue/API tests run in GitHub Actions. Audio-processing unit tests are under `backend/tests/`.

## Current limits

This is a portfolio project, not a production-scale music service. The current deployment model is a durable single-worker setup; multi-host deployment would require shared object storage, stronger observability, authentication/rate limiting and an explicit retention policy for failed uploads.

## License

MIT
