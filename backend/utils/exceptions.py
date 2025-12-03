class BasslineError(Exception):
    """Base exception for all Bassline backend errors."""
    def __init__(self, message, status_code=500, payload=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        rv['error_type'] = self.__class__.__name__
        return rv

class AudioProcessingError(BasslineError):
    """Raised when audio processing (Demucs/BasicPitch) fails."""
    def __init__(self, message, payload=None):
        super().__init__(message, status_code=500, payload=payload)

class FileValidationError(BasslineError):
    """Raised when uploaded file is invalid."""
    def __init__(self, message, payload=None):
        super().__init__(message, status_code=400, payload=payload)

class ResourceNotFoundError(BasslineError):
    """Raised when a requested resource is not found."""
    def __init__(self, message, payload=None):
        super().__init__(message, status_code=404, payload=payload)

class ConfigurationError(BasslineError):
    """Raised when there is a configuration issue."""
    def __init__(self, message, payload=None):
        super().__init__(message, status_code=500, payload=payload)
