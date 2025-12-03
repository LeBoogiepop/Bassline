from typing import Dict, List, Optional, TypedDict

class FretPosition(TypedDict):
    string: int
    fret: int

class NoteEvent(TypedDict):
    time: float
    string: int
    fret: int
    duration: float
    velocity: float
    pitch: int

class FretboardMapper:
    """
    Maps MIDI notes to bass guitar fretboard positions.
    Standard tuning: E1(28), A1(33), D2(38), G2(43)
    """
    
    BASS_STRINGS = {
        'E': 28,  # E1
        'A': 33,  # A1
        'D': 38,  # D2
        'G': 43   # G2
    }
    
    STRING_INDEX_MAP = {'E': 0, 'A': 1, 'D': 2, 'G': 3}

    @staticmethod
    def calculate_cost(fret: int, string_idx: int, prev_fret: Optional[int], difficulty: str) -> float:
        cost = 0.0
        
        # 1. Base Fret Penalty (Vertical position)
        if difficulty == 'beginner':
            cost += fret * 5.0  # Heavily penalize high frets
        elif difficulty == 'intermediate':
            cost += fret * 0.5  # Low penalty
        # Pro: 0 base penalty
        
        # 2. Open String Bias
        if fret == 0:
            if difficulty == 'beginner':
                cost -= 20.0  # Bonus for open strings
            elif difficulty == 'pro':
                cost += 10.0  # Pro prefers fretted notes for tone control
        
        # 3. Movement Penalty (Horizontal distance)
        if prev_fret is not None:
            dist = abs(fret - prev_fret)
            if difficulty == 'intermediate':
                cost += dist * 10.0  # Strict economy of motion
            elif difficulty == 'pro':
                cost += dist * 2.0   # Allow larger jumps
            else: # Beginner
                cost += dist * 1.0   # Low priority
        
        # 4. String Bias (Tone)
        if difficulty == 'pro':
            # Prefer lower strings (E=0, A=1) for fatter tone
            # String indices: E=0, A=1, D=2, G=3
            cost += string_idx * 5.0
            
        return cost

    @classmethod
    def midi_to_fret(cls, midi_note: int, difficulty: str = 'beginner', prev_fret: Optional[int] = None) -> Optional[FretPosition]:
        """
        Convert MIDI note to (string, fret) position using weighted cost function.
        """
        positions = []
        
        for string_name, open_string_midi in cls.BASS_STRINGS.items():
            fret = midi_note - open_string_midi
            if 0 <= fret <= 24:  # Valid fret range
                string_idx = cls.STRING_INDEX_MAP[string_name]
                cost = cls.calculate_cost(fret, string_idx, prev_fret, difficulty)
                
                positions.append({
                    'string': string_name,
                    'fret': fret,
                    'score': cost
                })
        
        if not positions:
            return None
        
        # Return the position with lowest cost
        best = min(positions, key=lambda p: p['score'])
        
        return {
            'string': cls.STRING_INDEX_MAP[best['string']],
            'fret': best['fret']
        }

    @classmethod
    def map_notes(cls, note_events: List, difficulty: str = 'beginner') -> List[NoteEvent]:
        """
        Maps a list of note events to fretboard positions based on difficulty.
        """
        mapped_notes = []
        prev_fret = None
        
        for note in note_events:
            # Handle both dict and object access
            if isinstance(note, dict):
                pitch = int(note['pitch_midi'])
                start = float(note['start_time_s'])
                end = float(note['end_time_s'])
                amp = float(note['amplitude'])
            else:
                pitch = int(note.pitch_midi)
                start = float(note.start_time_s)
                end = float(note.end_time_s)
                amp = float(note.amplitude)

            position = cls.midi_to_fret(pitch, difficulty, prev_fret)
            
            if position:
                mapped_notes.append({
                    'time': start,
                    'string': position['string'],
                    'fret': position['fret'],
                    'duration': end - start,
                    'velocity': amp,
                    'pitch': pitch
                })
                prev_fret = position['fret']
                
        return mapped_notes
