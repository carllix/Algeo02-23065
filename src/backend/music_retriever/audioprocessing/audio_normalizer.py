from typing import List
from ..audiotypes import Note
import numpy as np


class AudioNormalizer:  
    def normalize_tempo(self, notes: List[Note]) -> List[Note]:  
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
        I.S.: List of notes (pitch belum dinormalisasi)
        F.S.: List of notes dengan pitch yang sudah dinormalisasi sesuai formula NP(note) = (note-µ)/σ
        """
        if not notes:
            return []
            
        pitches = [note.pitch for note in notes]
        mean_pitch = sum(pitches) / len(pitches)
        squared_diff_sum = sum((p - mean_pitch) ** 2 for p in pitches)
        std_dev = (squared_diff_sum / len(pitches)) ** 0.5

        if std_dev == 0:
            return notes

        normalized_notes = []
        for note in notes:
            normalized_pitch = int((note.pitch - mean_pitch) / std_dev)
            normalized_pitch = max(0, min(127, normalized_pitch))
            
            normalized_notes.append(Note(
                pitch=normalized_pitch,
                duration=note.duration,
                start_time=note.start_time
            ))
            
        return normalized_notes