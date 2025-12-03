import os
from basic_pitch.inference import predict
from basic_pitch import ICASSP_2022_MODEL_PATH
from backend.utils.logger import logger
from backend.utils.exceptions import AudioProcessingError

class BasicPitchTranscriber:
    """
    Handles audio-to-MIDI transcription using Basic Pitch.
    """
    
    def __init__(self):
        self.model_path = ICASSP_2022_MODEL_PATH
        logger.info("BasicPitchTranscriber initialized")
    
    def transcribe(self, audio_path: str):
        """
        Transcribes audio to MIDI note events.
        Returns a list of note events.
        """
        try:
            logger.info(f"Starting Basic Pitch transcription for: {audio_path}")
            
            # ✅ STRICT BASS CONFIGURATION
            model_output, midi_data, note_events = predict(
                audio_path, 
                self.model_path,
                onset_threshold=0.6,       # Default is 0.5. Higher = Less sensitive to noise.
                frame_threshold=0.4,       # Default is 0.3. Higher = Notes must be sustained clearer.
                minimum_note_length=100,   # Minimum 100ms (prevents tiny glitches).
                minimum_frequency=40.0,    # 40Hz (Low E is 41Hz). Ignore rumble.
                maximum_frequency=400.0    # 400Hz (approx G4). Ignore high harmonics/squeaks.
            )
            
            logger.info(f"Transcription complete. Raw events type: {type(note_events)}")  
            if len(note_events) > 0:
                logger.info(f"First event type: {type(note_events[0])}")
                logger.info(f"First event: {note_events[0]}")
            
            notes = []
            for note in note_events:
                try:
                    # Try object access (if it's an object)
                    notes.append({
                        'pitch_midi': int(note.pitch_midi),
                        'start_time_s': float(note.start_time_s),
                        'end_time_s': float(note.end_time_s),
                        'amplitude': float(getattr(note, 'amplitude', 1.0))
                    })
                except AttributeError:
                    # Fallback: try tuple unpacking
                    try:
                        start, end, pitch, amp, *rest = note
                        notes.append({
                            'pitch_midi': int(pitch),
                            'start_time_s': float(start),
                            'end_time_s': float(end),
                            'amplitude': float(amp)
                        })
                    except Exception as parse_err:
                        logger.warning(f"Failed to parse note event: {note} - {parse_err}")
            
            logger.info(f"Parsed {len(notes)} notes.")
            return notes
            
        except Exception as e:
            logger.error(f"Basic Pitch transcription failed: {e}", exc_info=True)
            raise AudioProcessingError(f"Transcription failed: {e}")