import logging
import sys
import os
from logging.handlers import RotatingFileHandler

def setup_logger(name='bassline_backend', log_file='backend.log', level=logging.INFO):
    """
    Sets up a structured logger with both file and console handlers.
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Create formatters
    file_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(module)s:%(lineno)d - %(message)s'
    )
    console_formatter = logging.Formatter(
        '%(levelname)s - %(message)s'
    )
    
    # File Handler
    file_handler = RotatingFileHandler(
        log_file, maxBytes=10*1024*1024, backupCount=5
    )
    file_handler.setFormatter(file_formatter)
    file_handler.setLevel(level)
    
    # Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(console_formatter)
    console_handler.setLevel(level)
    
    # Add handlers if not already added
    if not logger.handlers:
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)
        
    return logger

# Create a default logger instance
logger = setup_logger()
