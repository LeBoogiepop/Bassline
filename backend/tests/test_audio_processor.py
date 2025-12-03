import unittest
from unittest.mock import MagicMock, patch
import os
from backend.core.audio_processor import DemucsProcessor

class TestDemucsProcessor(unittest.TestCase):
    
    @patch('backend.core.audio_processor.get_model')
    @patch('backend.core.audio_processor.apply_model')
    @patch('backend.core.audio_processor.torchaudio.load')
    @patch('backend.core.audio_processor.save_audio')
    def test_separate_bass(self, mock_save, mock_load, mock_apply, mock_get_model):
        # Setup mocks
        mock_model = MagicMock()
        mock_model.sources = ['drums', 'bass', 'other', 'vocals']
        mock_model.samplerate = 44100
        mock_get_model.return_value = mock_model
        
        mock_load.return_value = (MagicMock(), 44100)
        
        # apply_model returns sources tensor
        # We need to mock the return value structure
        # It expects a tensor of shape (sources, channels, time)
        # But we just need it to be indexable
        mock_sources = [MagicMock() for _ in range(4)]
        mock_apply.return_value = [mock_sources] # apply_model returns [sources]
        
        processor = DemucsProcessor()
        output = processor.separate_bass('test.wav', 'out_dir')
        
        # Check that it returns the expected path
        self.assertIn('bass_test.wav', output)
        
        # Verify calls
        mock_get_model.assert_called_with('htdemucs')
        mock_load.assert_called_with('test.wav')
        mock_apply.assert_called_once()
        mock_save.assert_called_once()

if __name__ == '__main__':
    unittest.main()
