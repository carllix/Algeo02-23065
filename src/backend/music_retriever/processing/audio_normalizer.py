from typing import List
from ..audio_types import Note
import numpy as np


class AudioNormalizer:  
    def normalize_tempo(self, notes: List[Note]) -> List[Note]:
        """
        I.S.: List of notes (temponya yang mungkin bervariasi)
        F.S.: List of notes telah di normalisasi (temponya)
        """

    def apply_windowing(self, notes: List[Note]) -> List[List[Note]]:
        """
        I.S.: List of notes ada
        F.S.: Mengembalikan list of list of notes (dibagi per window)
        """

    def standardize_pitch(self, notes: List[Note]) -> List[Note]:
        """
        I.S.: List of notes (pitch nya mungkin bervariasi)
        F.S.: List of notes telah di stardisasi (pitchnya)
        """
