from typing import List
import numpy as np
from ..audio_types import Note

class FTBExtractor:
    def calculate_first_tone_differents(notes: List[Note]) -> List[int]:
        """
        I.S.: List notes yang akan dihitung perbedaannya dengan nada pertama
        F.S.: Mengembalikan list perbedaan setiap nada dengan nada pertama
        """
    
    def create_ftb_histogram(differences: List[int]) -> List[float]:
        """
        I.S.: List perbedaan dengan nada pertama
        F.S.: Mengembalikan histogram FTB 255-bin yang sudah dinormalisasi
        """
    
    def extract_ftb(notes: List[Note]) -> List[float]:
        """
        I.S.: List notes yang akan diekstrak fitur FTB-nya
        F.S.: Mengembalikan fitur FTB dari notes dalam bentuk vektor 255 dimensi
        """