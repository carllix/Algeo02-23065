from typing import List
# import numpy as np
from ..audiotypes import Note

class Extractor:
    def extract_atb(self, notes: List[Note]) -> List[float]:
        if not notes:
            return [0.0] * 128
        histogram = [0.0] * 128
        for note in notes:
            if 0 <= note.pitch < 128:
                histogram[note.pitch] += 1
        total = sum(histogram)
        return [count / total if total > 0 else 0 for count in histogram]
 

    def extract_rtb(self, notes: List[Note]) -> List[float]:
        if not notes:
            return [0.0] * 255
        histogram = [0.0] * 255
        for i in range(len(notes) - 1):
            interval = notes[i+1].pitch - notes[i].pitch
            idx = interval + 127
            if 0 <= idx < 255:
                histogram[idx] += 1
        total = sum(histogram)
        return [count / total if total > 0 else 0 for count in histogram]
 
    def extract_ftb(self, notes: List[Note]) -> List[float]:
        if not notes:
            return [0.0] * 255
        pitch_pertama = notes[0].pitch
        histogram = [0.0] * 255
        for note in notes[1:]:
            diff = note.pitch - pitch_pertama
            idx = diff + 127
            if 0 <= idx < 255:
                histogram[idx] += 1
        
        total = sum(histogram)
        return [count / total if total > 0 else 0 for count in histogram]