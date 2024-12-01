import pretty_midi
from typing import List
from ..audio_types import Note

class AudioLoader:
    def load_midi_file(file_path: str) -> List[Note]:
        """
        I.S.: File MIDI tersedia di file_path
        F.S.: Mengembalikan list of Note
        """

    def validate_audio_file(file_path: str) -> bool:
        """
        I.S.: File audio tersedia di file_path 
        F.S.: True jika valid (format & struktur)
        """