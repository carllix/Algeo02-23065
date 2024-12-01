from typing import List
import numpy as np
from ..audio_types import Note

class RTBExtractor:
    def calculate_intervals(notes: List[Note]) -> List[int]:
        """ 
        I.S.: List notes yang akan dihitung intervalnya
        F.S.: Mengembalikan list interval antar nada berurutan
        """
    
    def create_rtb_histogram(intervals: List[int]) -> List[float]:
        """
        I.S.: List interval antar nada
        F.S.: Mengembalikan histogram RTB 255-bin yang sudah dinormalisasi
        """
    
    def extract_rtb(notes: List[Note]) -> List[float]:
        """
        I.S.: List notes yang akan diekstrak fitur RTB-nya
        F.S.: Mengembalikan fitur RTB dari notes dalam bentuk vektor 255 dimensi
        """