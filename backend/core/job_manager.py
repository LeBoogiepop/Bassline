import uuid
import threading
from concurrent.futures import ThreadPoolExecutor
from enum import Enum
from typing import Dict, Any, Optional
from backend.utils.logger import logger

class JobStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class JobManager:
    """
    Simple in-memory job manager for background tasks.
    """
    def __init__(self, max_workers=4):
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        self.jobs: Dict[str, Dict[str, Any]] = {}
        self.lock = threading.Lock()

    def create_job(self) -> str:
        """Creates a new job and returns its ID."""
        job_id = str(uuid.uuid4())
        with self.lock:
            self.jobs[job_id] = {
                "status": JobStatus.PENDING.value,
                "progress": 0,
                "result": None,
                "error": None
            }
        return job_id

    def update_job(self, job_id: str, status: JobStatus, progress: int = 0, result: Any = None, error: str = None):
        """Updates the status of a job."""
        with self.lock:
            if job_id in self.jobs:
                self.jobs[job_id]["status"] = status.value
                self.jobs[job_id]["progress"] = progress
                if result is not None:
                    self.jobs[job_id]["result"] = result
                if error is not None:
                    self.jobs[job_id]["error"] = error
                logger.debug(f"Job {job_id} updated: {status.value} ({progress}%)")

    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves job status."""
        with self.lock:
            return self.jobs.get(job_id)

    def submit_task(self, task_func, job_id: str, *args, **kwargs):
        """Submits a task to the executor."""
        def wrapper():
            try:
                self.update_job(job_id, JobStatus.PROCESSING, 0)
                result = task_func(job_id, *args, **kwargs)
                self.update_job(job_id, JobStatus.COMPLETED, 100, result)
            except Exception as e:
                logger.error(f"Job {job_id} failed: {e}", exc_info=True)
                self.update_job(job_id, JobStatus.FAILED, error=str(e))

        self.executor.submit(wrapper)

# Global instance
job_manager = JobManager()
