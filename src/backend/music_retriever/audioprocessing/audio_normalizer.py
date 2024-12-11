from typing import List
from ..audiotypes import Note
import numpy as np


class AudioNormalizer:  
    def normalize_tempo(self, notes: List[Note]) -> List[Note]:   #ini ga perlu ga sih
        """
        I.S.: List of notes (temponya yang mungkin bervariasi)  
        F.S.: List of notes telah di normalisasi (temponya)
        """
        output = []
        if notes :
            total_duration = sum(note.duration for note in notes)
            avg_tempo = total_duration/len(notes)
            time = 0.0
            for note in notes:
                normalized_duration = note.duration / avg_tempo
                normalized_note = Note(
                    pitch=note.pitch,
                    duration=normalized_duration,
                    start_time=time
                )
                output.append(normalized_note)
                time += normalized_duration

        return output

    def apply_windowing(self, notes: List[Note], window_size: int = 40, slide_size: int = 8) -> List[List[Note]]:
        """
        I.S.: List of notes ada
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

    def normalize_pitch(self, notes: List[Note]) -> List[Note]:
        """
        I.S.: List of notes (pitch nya mungkin bervariasi)
        F.S.: List of notes telah di stardisasi (pitchnya)
        """
        output = []
        if notes:
            pitches = [note.pitch for note in notes]
            miu = sum(pitches)/len(pitches)  #rata-rata
            std_pitches = (sum((p - miu) ** 2 for p in pitches) / len(pitches)) ** 0.5
            if std_pitches  == 0 :
                return notes
            
            output = []
            for note in notes:
                standardized_pitch = min(0,max(127,int((note.pitch - miu) / std_pitches)))
                standardized_note = Note(
                    pitch=standardized_pitch,
                    duration=note.duration,
                    start_time=note.start_time
                )
                output.append(standardized_note)
        return output
