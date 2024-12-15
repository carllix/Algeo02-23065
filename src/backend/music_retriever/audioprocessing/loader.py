from typing import List
from ..audiotypes import Note
import os
import mido
import pretty_midi


class AudioLoader:
    @staticmethod
    def load_audio_file(file_path: str) -> List[Note]:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        try:
            if file_path.endswith('.mid'):
                return AudioLoader.load_midi_file(file_path)
            else :
                raise ValueError(f"Unsupported file type: {file_path}")
        except (FileNotFoundError, ValueError) as e:
            raise
        except Exception as e:
            print(f"Unexpected error loading {file_path}: {e}")
        return []
    
    @staticmethod
    def load_midi_file(file_path: str) -> List[Note]:
        try:
            data = pretty_midi.PrettyMIDI(file_path)
            melody_notes = []  
            for instrument in data.instruments:
                if instrument.is_drum:
                    continue  
                
                for note in instrument.notes:
                    if 0 <= note.pitch <= 127 and note.start >= 0 and note.end > note.start:
                        melody_notes.append(Note(
                            pitch=note.pitch,
                            duration=note.end - note.start,
                            start_time=note.start
                        ))
            
            if melody_notes:
                melody_notes.sort(key=lambda x: x.start_time)
                return melody_notes
            
            else:
                raise ValueError("No valid melody notes found.")
        
        except Exception as e:
            raise RuntimeError(f"Error loading MIDI: {str(e)}")
        