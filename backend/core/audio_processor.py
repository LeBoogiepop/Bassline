import os
import torch
import torchaudio
import concurrent.futures
import time
from demucs.pretrained import get_model
from demucs.apply import apply_model
from backend.utils.logger import logger
from backend.utils.exceptions import AudioProcessingError

class DemucsProcessor:
    """
    Handles audio separation using Demucs.
    Uses native Demucs libraries instead of subprocess calls.
    """
    
    def __init__(self, model_name='htdemucs'):
        self.model_name = model_name
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = None
        logger.info(f"DemucsProcessor initialized. Device: {self.device}, Model: {model_name}")

    def load_model(self):
        """Lazy loads the Demucs model."""
        if self.model is None:
            try:
                logger.info(f"Loading Demucs model: {self.model_name}")
                logger.info("First run: Downloading Demucs model (this will take 5-10 minutes) if not cached...")
                self.model = get_model(self.model_name)
                self.model.to(self.device)
                logger.info("Demucs model loaded successfully")
            except Exception as e:
                raise AudioProcessingError(f"Failed to load Demucs model: {e}")

    def separate_bass(self, audio_path: str, output_dir: str) -> str:
        """
        Separates the bass track from the given audio file.
        Returns the path to the isolated bass file.
        """
        self.load_model()
        
        try:
            logger.info(f"Loading audio file: {audio_path}")
            # Load audio using torchaudio with explicit soundfile backend
            wav, sr = torchaudio.load(audio_path, backend="soundfile")
            
            logger.info("Starting Demucs separation...")
            logger.info(f"Using model: {self.model_name}")
            
            # Define the separation task
            def run_separation():
                # apply_model returns a tensor of shape (sources, channels, time)
                # sources order depends on model, usually: drums, bass, other, vocals
                return apply_model(self.model, wav[None], shifts=1, split=True, overlap=0.25, progress=True, device=self.device)[0]

            # Run with timeout
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(run_separation)
                try:
                    # 5 minute timeout (300 seconds)
                    sources = future.result(timeout=300)
                except concurrent.futures.TimeoutError:
                    raise AudioProcessingError("Demucs separation timed out after 5 minutes")
            
            # Identify bass source index
            bass_index = self.model.sources.index('bass')
            bass_source = sources[bass_index]
            
            # Save bass track
            filename = os.path.basename(audio_path)
            bass_filename = f"bass_{filename}"
            # Ensure output filename ends with .wav
            if not bass_filename.lower().endswith('.wav'):
                bass_filename = os.path.splitext(bass_filename)[0] + ".wav"
                
            output_path = os.path.join(output_dir, bass_filename)
            
            logger.info(f"Saving bass track to: {output_path}")
            # Save using torchaudio with explicit soundfile backend
            torchaudio.save(output_path, bass_source, self.model.samplerate, backend="soundfile")
            
            logger.info("Demucs complete")
            return output_path
            
        except Exception as e:
            logger.error(f"Demucs separation failed: {e}", exc_info=True)
            raise AudioProcessingError(f"Demucs separation failed: {e}")
