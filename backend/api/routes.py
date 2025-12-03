import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename

from backend.core.audio_processor import DemucsProcessor
from backend.core.transcriber import BasicPitchTranscriber
from backend.core.fretboard_mapper import FretboardMapper
from backend.core.file_manager import FileManager
from backend.core.job_manager import job_manager, JobStatus
from backend.utils.logger import logger
from backend.utils.exceptions import FileValidationError

api_bp = Blueprint('api', __name__)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

def process_transcription(job_id: str, file_path: str, difficulty: str = 'beginner'):
    """
    Background task to process audio:
    1. Isolate bass (Demucs)
    2. Transcribe (Basic Pitch)
    3. Map to Fretboard (with difficulty)
    """
    demucs = DemucsProcessor(model_name=current_app.config['DEMUCS_MODEL'])
    transcriber = BasicPitchTranscriber()
    
    # We use a temp directory for intermediate files
    with FileManager.temp_directory() as temp_dir:
        job_manager.update_job(job_id, JobStatus.PROCESSING, 10)
        
        # 1. Isolate Bass
        logger.info(f"Job {job_id}: Starting bass isolation")
        bass_path = demucs.separate_bass(file_path, temp_dir)
        job_manager.update_job(job_id, JobStatus.PROCESSING, 40)
        
        # 2. Transcribe
        logger.info(f"Job {job_id}: Starting transcription")
        note_events = transcriber.transcribe(bass_path)
        job_manager.update_job(job_id, JobStatus.PROCESSING, 70)
        
        # 3. Map to Fretboard
        logger.info(f"Job {job_id}: Mapping to fretboard (Difficulty: {difficulty})")
        mapped_notes = FretboardMapper.map_notes(note_events, difficulty=difficulty)
        job_manager.update_job(job_id, JobStatus.PROCESSING, 90)
        
        # Cleanup the original uploaded file now that we are done with it
        if os.path.exists(file_path):
            os.remove(file_path)
            
        return {'notes': mapped_notes}

@api_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

@api_bp.route('/transcribe', methods=['POST'])
def transcribe():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
        
    file = request.files['audio']
    difficulty = request.form.get('difficulty', 'beginner')
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        
        # Ensure upload folder exists
        upload_folder = current_app.config['UPLOAD_FOLDER']
        FileManager.ensure_dir(upload_folder)
        
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)
        
        # Create job
        job_id = job_manager.create_job()
        
        app = current_app._get_current_object()
        
        def task_wrapper(jid, fpath, diff):
            with app.app_context():
                return process_transcription(jid, fpath, diff)
        
        job_manager.submit_task(task_wrapper, job_id, file_path, difficulty)
        
        return jsonify({
            'job_id': job_id,
            'status': 'pending',
            'message': 'Transcription started'
        }), 202
        
    return jsonify({'error': 'Invalid file type'}), 400

@api_bp.route('/jobs/<job_id>', methods=['GET'])
def get_job_status(job_id):
    job = job_manager.get_job(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
        
    return jsonify(job)
