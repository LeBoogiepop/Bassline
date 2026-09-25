"""Redis-backed transcription queue. API and worker share this state across restarts."""
import os
from redis import Redis
from rq import Queue, Retry
from rq.job import Job
from rq.exceptions import NoSuchJobError


class RedisJobManager:
    def __init__(self, redis_url=None, connection=None):
        self.connection = connection or Redis.from_url(
            redis_url or os.environ.get("REDIS_URL", "redis://localhost:6379/0"),
            socket_connect_timeout=3,
            socket_timeout=5,
        )
        self.queue = Queue("bassline", connection=self.connection)

    def enqueue_transcription(self, file_path: str, difficulty: str) -> str:
        """Only file paths and simple values enter the queue, never uploaded file bytes."""
        job = self.queue.enqueue(
            "backend.core.tasks.process_transcription_job",
            file_path,
            difficulty,
            job_timeout=int(os.environ.get("JOB_TIMEOUT_SECONDS", "3600")),
            result_ttl=86400,
            failure_ttl=86400,
            retry=Retry(max=2),
            meta={"progress": 0},
        )
        return job.id

    def get_job(self, job_id: str):
        try:
            job = Job.fetch(job_id, connection=self.connection)
        except NoSuchJobError:
            return None

        raw_status = job.get_status(refresh=True)
        status = getattr(raw_status, "value", raw_status)
        mapped_status = {
            "queued": "pending",
            "deferred": "pending",
            "scheduled": "pending",
            "started": "processing",
            "finished": "completed",
            "failed": "failed",
            "stopped": "failed",
            "canceled": "failed",
        }.get(status, "pending")
        progress = job.get_meta(refresh=True).get("progress", 0)
        if mapped_status == "completed":
            progress = 100

        return {
            "status": mapped_status,
            "progress": progress,
            "result": job.return_value() if mapped_status == "completed" else None,
            # Do not disclose worker tracebacks and local paths to an unauthenticated client.
            "error": "Transcription failed. Check worker logs." if mapped_status == "failed" else None,
        }

    def is_available(self) -> bool:
        return bool(self.connection.ping())


job_manager = RedisJobManager()
