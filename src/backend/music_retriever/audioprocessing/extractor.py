from typing import List
import numpy as np
from ..audiotypes import Note
from ..audioutils import AudioUtils

class ATBExtractor:
    def extract_atb(self,notes: List[Note]) -> List[float]:
        """
        I.S.: List notes yang akan diekstrak fitur ATB-nya
        F.S.: Mengembalikan fitur ATB dari notes dalam bentuk vektor 128 dimensi
        """
        if not notes:
            return np.zeros(128)
        pitches = np.array([note.pitch for note in notes])
        histogram = np.bincount(pitches, minlength=128)
        return histogram / np.sum(histogram) if np.sum(histogram) > 0 else histogram
    
class RTBExtractor:
    def calculate_intervals(self,notes: List[Note]) -> List[int]:
        """ 
        I.S.: List notes yang akan dihitung intervalnya
        F.S.: Mengembalikan list interval antar nada berurutan
        """
        output = []
        if len(notes) > 2:  
            output = [notes[i+1].pitch - notes[i].pitch for i in range(len(notes)-1)]
        return output
    
    def create_rtb_histogram(self,intervals: List[int]) -> List[float]:
        """
        I.S.: List interval antar nada
        F.S.: Mengembalikan histogram RTB 255-bin yang sudah dinormalisasi
        """
        hist = [0 for _ in range(255)]
        for interval in intervals:
            i = interval + 127
            i = max(0,min(254,i))
            hist[i] += 1 
  
        return AudioUtils.normalize_histogram(hist)
    
    def extract_rtb(self,notes: List[Note]) -> List[float]:
        """
        I.S.: List notes yang akan diekstrak fitur RTB-nya
        F.S.: Mengembalikan fitur RTB dari notes dalam bentuk vektor 255 dimensi
        """
        intervals = self.calculate_intervals(notes)
        hist = self.create_rtb_histogram(intervals)
        return hist

class FTBExtractor:
    def calculate_first_tone_differents(self,notes: List[Note]) -> List[int]:
        """
        I.S.: List notes yang akan dihitung perbedaannya dengan nada pertama
        F.S.: Mengembalikan list perbedaan setiap nada dengan nada pertama
        """
        if not notes:
            return []
        pitches = np.array([note.pitch for note in notes[1:]])
        return pitches - notes[0].pitch


    def create_ftb_histogram(self,differences: List[int]) -> List[float]:
        """
        I.S.: List perbedaan dengan nada pertama
        F.S.: Mengembalikan histogram FTB 255-bin yang sudah dinormalisasi
        """
        histogram = [0 for _ in range(256)]
        for diff in differences:
            idx = diff + 127
            idx = max(0, min(254, idx))
            histogram[idx] += 1
        return AudioUtils.normalize_histogram(histogram)
        
    def extract_ftb(self,notes: List[Note]) -> List[float]:
        """
        I.S.: List notes yang akan diekstrak fitur FTB-nya
        F.S.: Mengembalikan fitur FTB dari notes dalam bentuk vektor 255 dimensi
        """
        diffs = self.calculate_first_tone_differents(notes)
        hist = self.create_ftb_histogram(diffs)
        return hist