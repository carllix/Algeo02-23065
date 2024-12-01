from typing import List, Dict
import os
import time
import numpy as np
from .audio_types import Note

class AudioUtils:
    def get_midi_note_number(self, note: Note) -> int:
        """
        I.S.: Note object yang valid dengan informasi pitch
        F.S.: Mengembalikan MIDI note number (0-127) dari note tersebut
        """
    
    def normalize_vector(self, vector: List[float]) -> List[float]:
        """
        I.S.: Vector belum dinormalisasi
        F.S.: Mengembalikan vector yang sudah dinormalisasi (sum = 1)
        """

class TimeUtils:
    def get_execution_time(self, start_time: float) -> float:
        """
        I.S.: start_time dalam timestamp
        F.S.: Mengembalikan durasi eksekusi dalam ms
        """

class FileUtils:
    def validate_file_format(self, file_path: str) -> bool:
        """
        I.S.: Path file ada
        F.S.: True jika file adalah MIDI (.mid), False jika bukan
        """

    def read_mapping_file(self, file_path: str) -> Dict:
        """
        I.S.: Path ke file mapping (.txt atau .json)
        F.S.: Mengembalikan dictionary mapping:
                {
                "audio_file.mid": {
                    "title": "Judul Lagu",
                    "image": "album.png"
                }
                }
        """