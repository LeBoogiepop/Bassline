"""Worker-only audio pipeline. RQ runs this in a separate, long-lived worker."""
import os
from rq import get_current_job

from backend.core.audio_processor import DemucsProcessor
from backend.core.transcriber import BasicPitchTranscriber
from backend.core.fretboard_mapper import FretboardMapper
from backend.core.file_manager import FileManager
from backend.utils.logger import logger


def _set_progress(value: int) -> None:
    job = get_current_job()
    if job is not None:
        job.meta["progress"] = value
        job.save_meta()


def process_transcription_job(file_path: str, difficulty: str = "beginner"):
    # Construct the Flask application in the worker, not in the HTTP process.
    from backend.app import create_app

    app = create_app()
    with app.app_context():
        try:
            with FileManager.temp_directory() as temp_dir:
                _set_progress(10)
                logger.info("Starting bass isolation")
                demucs = DemucsProcessor(model_name=app.config["DEMUCS_MODEL"])
                bass_path = demucs.separate_bass(file_path, temp_dir)

                _set_progress(40)
                logger.info("Starting note estimation")
                note_events = BasicPitchTranscriber().transcribe(bass_path)

                _set_progress(70)
                logger.info("Mapping notes to bass tablature")
                mapped_notes = FretboardMapper.map_notes(
                    note_events, difficulty=difficulty
                )
                _set_progress(90)

            result = {"notes": mapped_notes}
            # Keep uploads on failure so RQ retries can use the original file.
            # See README for retention/cleanup of files after permanent failures.
            os.remove(file_path)
            return result
        except Exception:
            logger.exception("Audio transcription failed; RQ will handle retries")
            raise
