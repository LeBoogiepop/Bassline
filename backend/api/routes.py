"""HTTP API: enqueue uploaded audio and expose RQ job state without blocking."""
import os
import uuid

from flask import Blueprint, request, jsonify, current_app
from redis.exceptions import RedisError
from werkzeug.utils import secure_filename

from backend.core.file_manager import FileManager
from backend.core.job_manager import job_manager
from backend.utils.logger import logger

api_bp = Blueprint("api", __name__)
DIFFICULTIES = {"beginner", "intermediate", "pro"}


def allowed_file(filename):
    return "." in filename and (
        filename.rsplit(".", 1)[1].lower() in current_app.config["ALLOWED_EXTENSIONS"]
    )


@api_bp.route("/health", methods=["GET"])
def health_check():
    try:
        if job_manager.is_available():
            return jsonify({"status": "healthy", "queue": "redis"}), 200
    except RedisError:
        logger.exception("Redis health check failed")
    return jsonify({"status": "unavailable", "queue": "redis"}), 503


@api_bp.route("/transcribe", methods=["POST"])
def transcribe():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    file = request.files["audio"]
    difficulty = request.form.get("difficulty", "beginner")
    if difficulty not in DIFFICULTIES:
        return jsonify({"error": "Invalid difficulty"}), 400
    if not file.filename or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    # Unique filenames prevent two simultaneous uploads of song.mp3 colliding.
    filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
    upload_folder = current_app.config["UPLOAD_FOLDER"]
    FileManager.ensure_dir(upload_folder)
    file_path = os.path.join(upload_folder, filename)
    file.save(file_path)

    try:
        job_id = job_manager.enqueue_transcription(file_path, difficulty)
    except RedisError:
        logger.exception("Failed to enqueue audio transcription")
        os.remove(file_path)
        return jsonify({"error": "Transcription service temporarily unavailable"}), 503

    return jsonify({
        "job_id": job_id,
        "status": "pending",
        "message": "Transcription queued",
    }), 202


@api_bp.route("/jobs/<job_id>", methods=["GET"])
def get_job_status(job_id):
    try:
        job = job_manager.get_job(job_id)
    except RedisError:
        logger.exception("Failed to read transcription job status")
        return jsonify({"error": "Transcription service temporarily unavailable"}), 503
    if job is None:
        return jsonify({"error": "Job not found"}), 404
    return jsonify(job), 200
