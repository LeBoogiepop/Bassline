"""Lightweight tests for Redis queue and Flask upload API (no torch models loaded)."""
import io
import tempfile
import unittest
from unittest.mock import patch

import fakeredis
from redis.exceptions import RedisError
from rq.job import Job

from backend.app import create_app
from backend.core.job_manager import RedisJobManager
from backend.api import routes


class RedisQueueTests(unittest.TestCase):
    def setUp(self):
        self.redis = fakeredis.FakeRedis()
        self.manager = RedisJobManager(connection=self.redis)

    def test_enqueued_job_can_be_fetched_from_a_new_manager(self):
        job_id = self.manager.enqueue_transcription("/shared/song.wav", "beginner")
        restarted_api = RedisJobManager(connection=self.redis)
        status = restarted_api.get_job(job_id)
        self.assertEqual(status["status"], "pending")
        self.assertEqual(status["progress"], 0)
        self.assertIsNone(status["result"])

    def test_progress_is_read_from_redis(self):
        job_id = self.manager.enqueue_transcription("/shared/song.wav", "pro")
        job = Job.fetch(job_id, connection=self.redis)
        job.set_status("started")
        job.meta["progress"] = 40
        job.save_meta()
        status = self.manager.get_job(job_id)
        self.assertEqual(status["status"], "processing")
        self.assertEqual(status["progress"], 40)

    def test_unknown_job_is_not_found(self):
        self.assertIsNone(self.manager.get_job("missing-job"))


class TranscriptionRouteTests(unittest.TestCase):
    def setUp(self):
        self.tempdir = tempfile.TemporaryDirectory()
        self.manager = RedisJobManager(connection=fakeredis.FakeRedis())
        self.app = create_app()
        self.app.config["TESTING"] = True
        self.app.config["UPLOAD_FOLDER"] = self.tempdir.name
        self.client = self.app.test_client()

    def tearDown(self):
        self.tempdir.cleanup()

    def test_upload_returns_pending_job_and_polling_finds_it(self):
        with patch.object(routes, "job_manager", self.manager):
            response = self.client.post(
                "/transcribe",
                data={"audio": (io.BytesIO(b"RIFF demo"), "song.wav"),
                      "difficulty": "beginner"},
                content_type="multipart/form-data",
            )
            self.assertEqual(response.status_code, 202)
            job_id = response.get_json()["job_id"]
            poll = self.client.get(f"/jobs/{job_id}")
            self.assertEqual(poll.status_code, 200)
            self.assertEqual(poll.get_json()["status"], "pending")

    def test_invalid_difficulty_is_rejected(self):
        with patch.object(routes, "job_manager", self.manager):
            response = self.client.post(
                "/transcribe",
                data={"audio": (io.BytesIO(b"RIFF demo"), "song.wav"),
                      "difficulty": "unknown"},
                content_type="multipart/form-data",
            )
            self.assertEqual(response.status_code, 400)

    def test_redis_failure_returns_503_and_removes_upload(self):
        from pathlib import Path
        with patch.object(routes, "job_manager", self.manager):
            with patch.object(self.manager, "enqueue_transcription",
                              side_effect=RedisError("offline")):
                response = self.client.post(
                    "/transcribe",
                    data={"audio": (io.BytesIO(b"RIFF demo"), "song.wav"),
                          "difficulty": "beginner"},
                    content_type="multipart/form-data",
                )
        self.assertEqual(response.status_code, 503)
        self.assertEqual(list(Path(self.tempdir.name).iterdir()), [])


if __name__ == "__main__":
    unittest.main()
