from typing import List
from ..audiotypes import Note
# import numpy as np


class AudioNormalizer:  
    def apply_windowing(self, notes: List[Note], window_size: int = 40, slide_size: int = 8) -> List[List[Note]]:
        """
        I.S.: List of notes ada blm di windowing
        F.S.: Mengembalikan list of list of notes (dibagi per window)
        """
        windows = [] 
        idx_window = 0   
        while idx_window + window_size <= len(notes):
            window = notes[idx_window:idx_window + window_size]         
            windows.append(window)
            idx_window += slide_size  
        if not windows and notes:  
            windows.append(notes)   
        return windows
    
    def normalize_tempo(self, notes: List[Note]) -> List[Note]:  
        """
        I.S.: List of notes (temponya yang mungkin bervariasi)  
        F.S.: List of notes telah di normalisasi (temponya)
        """
        if not notes:
            return []
        try:
            durations = [note.duration for note in notes]
            avg = sum(durations) / len(durations)
            std = (sum((duration - avg) ** 2 for duration in durations) / len(durations)) ** 0.5
            if std == 0:
                std = 1  

            time = 0.0
            output = []
            for note in notes:
                normalized_duration = (note.duration - avg) / std
                normalized_note = Note(
                    pitch=note.pitch,
                    duration=normalized_duration,  
                    start_time=time
                )
                output.append(normalized_note)
                time += normalized_duration

            return output
        except Exception as e:
            print(f"Error di normalisasi tempo: {e}")
            return notes
    # def normalize_pitch(self, notes: List[Note]) -> List[Note]:
    #     if not notes:
    #         return []
        
    #     pitches = [note.pitch for note in notes]
    #     mean = np.mean(pitches)
    #     std = np.std(pitches)
        
    #     if std == 0:
    #         std = 1  
        
    #     normalized_notes = [
    #         Note(
    #             pitch=int((note.pitch - mean) / std),
    #             duration=note.duration,
    #             start_time=note.start_time
    #         ) for note in notes
    #     ]
        
    #     return normalized_notes