import os
import shutil
import tempfile
from contextlib import contextmanager
from pathlib import Path
from typing import Generator
from backend.utils.logger import logger

class FileManager:
    """
    Manages temporary files and directories with automatic cleanup.
    """
    
    @staticmethod
    @contextmanager
    def temp_file(suffix: str = None) -> Generator[str, None, None]:
        """
        Context manager for a temporary file.
        Yields the file path and ensures it is deleted after use.
        """
        fd, path = tempfile.mkstemp(suffix=suffix)
        os.close(fd)
        logger.debug(f"Created temp file: {path}")
        try:
            yield path
        finally:
            if os.path.exists(path):
                try:
                    os.remove(path)
                    logger.debug(f"Cleaned up temp file: {path}")
                except Exception as e:
                    logger.warning(f"Failed to cleanup temp file {path}: {e}")

    @staticmethod
    @contextmanager
    def temp_directory() -> Generator[str, None, None]:
        """
        Context manager for a temporary directory.
        Yields the directory path and ensures it is deleted after use.
        """
        path = tempfile.mkdtemp()
        logger.debug(f"Created temp directory: {path}")
        try:
            yield path
        finally:
            if os.path.exists(path):
                try:
                    shutil.rmtree(path)
                    logger.debug(f"Cleaned up temp directory: {path}")
                except Exception as e:
                    logger.warning(f"Failed to cleanup temp directory {path}: {e}")

    @staticmethod
    def ensure_dir(path: str):
        """Ensures a directory exists."""
        Path(path).mkdir(parents=True, exist_ok=True)
