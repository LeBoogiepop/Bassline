import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).parent / '.env'
load_dotenv(env_path)

class Config:
    """Base configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
    DEBUG = False
    TESTING = False
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', os.path.join(os.getcwd(), 'temp_uploads'))
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload size
    ALLOWED_EXTENSIONS = {'mp3', 'wav', 'ogg', 'm4a'}
    
    # Audio Processing Config
    DEMUCS_MODEL = os.environ.get('DEMUCS_MODEL', 'mdx_extra')
    BASIC_PITCH_MODEL = os.environ.get('BASIC_PITCH_MODEL', 'ICASSP_2022_MODEL_PATH')

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    # In production, ensure SECRET_KEY is set in env
    
class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'test_uploads')

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config():
    env = os.environ.get('FLASK_ENV', 'default')
    return config[env]
