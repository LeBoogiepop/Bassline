import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS

from backend.config import get_config
from backend.utils.logger import setup_logger
from backend.utils.exceptions import BasslineError
from backend.api.routes import api_bp

def create_app(config_name='default'):
    """App factory."""
    app = Flask(__name__)
    
    # Load config
    config_class = get_config()
    app.config.from_object(config_class)
    
    # Setup logging
    setup_logger(level=logging.DEBUG if app.debug else logging.INFO)
    
    # Extensions
    CORS(app)
    
    # Blueprints
    app.register_blueprint(api_bp)
    
    # Error handlers
    @app.errorhandler(BasslineError)
    def handle_bassline_error(error):
        response = jsonify(error.to_dict())
        response.status_code = error.status_code
        return response

    @app.errorhandler(413)
    def request_entity_too_large(error):
        return jsonify({'message': 'File too large', 'error_type': 'RequestEntityTooLarge'}), 413

    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({'message': 'Internal Server Error', 'error_type': 'InternalServerError'}), 500

    return app

if __name__ == '__main__':
    app = create_app(os.getenv('FLASK_ENV', 'development'))
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
