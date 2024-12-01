from typing import List
import numpy as np
from ..audio_types import Note

class ATBExtractor:
    def create_atb_histogram(notes: List[Note]) -> List[float]:
        """
        I.S.: List notes yang akan dibuat histogramnya
        F.S.: Mengembalikan histogram ATB 128-bin untuk distribusi nada
        """

    def normalize_histogram(histogram: List[float]) -> List[float]:
        """
        I.S.: Histogram ATB belum dinormalisasi
        F.S.: histogram ATB dinormalisasi
        """

    def extract_atb(notes: List[Note]) -> List[float]:
        """
        I.S.: List notes yang akan diekstrak fitur ATB-nya
        F.S.: Mengembalikan fitur ATB dari notes dalam bentuk vektor 128 dimensi
        """