# Bassline

### AI-assisted bass transcription & 3D visualization

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![React Three Fiber](https://img.shields.io/badge/React_Three_Fiber-black?style=for-the-badge&logo=react&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![Demucs](https://img.shields.io/badge/Demucs-Meta-blue?style=for-the-badge)

![Demo Screenshot](./public/demo.png)

## Overview

Bassline transforms an audio file into an interactive bass lesson. The pipeline isolates the bass stem with Demucs, estimates notes with Basic Pitch, generates a playable tablature using graph-based pathfinding, and synchronizes the result with a React Three Fiber visualization.

## Key features

- **Source separation:** bass stem isolation with Demucs.
- **Pitch extraction:** note estimation with Basic Pitch.
- **Smart tablature:** difficulty-aware fingering generated with graph-based pathfinding.
- **Interactive 3D:** WebGL / React Three Fiber visualization synchronized with audio.
- **Pipeline explorer:** visual explanation of the backend data flow.
- **Internationalization:** French and English UI.

## Tech stack

### Frontend
- Next.js
- React Three Fiber / Three.js
- Tailwind CSS
- Framer Motion
- Zustand

### Backend
- Python
- Flask
- Demucs
- Basic Pitch
- Redis
- Docker

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/LeBoogiepop/Bassline.git
cd Bassline
```

### 2. Frontend

```bash
npm install
npm run dev
```

### 3. Backend

```bash
cd backend
python -m venv venv
```

Windows:

```bash
.\venv\Scripts\activate
```

macOS / Linux:

```bash
source venv/bin/activate
```

Then:

```bash
pip install -r requirements.txt
python app.py
```

## License

Distributed under the MIT License.
