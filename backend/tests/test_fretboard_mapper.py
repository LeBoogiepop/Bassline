import unittest
from backend.core.fretboard_mapper import FretboardMapper

class TestFretboardMapper(unittest.TestCase):
    
    def test_midi_to_fret_open_e(self):
        # E1 is MIDI 28
        pos = FretboardMapper.midi_to_fret(28)
        self.assertEqual(pos['string'], 0) # E string
        self.assertEqual(pos['fret'], 0)   # Open
        
    def test_midi_to_fret_g_on_e(self):
        # G1 is MIDI 31 (28 + 3)
        pos = FretboardMapper.midi_to_fret(31)
        self.assertEqual(pos['string'], 0)
        self.assertEqual(pos['fret'], 3)
        
    def test_midi_to_fret_preference(self):
        # A1 is MIDI 33. Could be Open A (string 1, fret 0) or E string fret 5.
        # Our logic prefers lower frets. So it should be Open A.
        pos = FretboardMapper.midi_to_fret(33)
        self.assertEqual(pos['string'], 1)
        self.assertEqual(pos['fret'], 0)
        
    def test_invalid_note(self):
        # Too low
        pos = FretboardMapper.midi_to_fret(0)
        self.assertIsNone(pos)

if __name__ == '__main__':
    unittest.main()
