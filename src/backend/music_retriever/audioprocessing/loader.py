import pretty_midi
from typing import List
from audiotypes import Note
import os

class AudioLoader:
    def load_midi_file(file_path: str) -> List[Note]:
        """
        I.S.: File Path ada
        F.S.: Mengembalikan list of Note 
        """
        try:
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found: {file_path}")
                
            if not file_path.endswith('.mid'):
                raise ValueError(f"Invalid file format")
            data = pretty_midi.PrettyMIDI(file_path)                
            notes = []
            for instrument in data.instruments:
                for note in instrument.notes:
                    if not (0 <= note.pitch <= 127):
                        continue                       
                    if note.start < 0 or note.end < note.start:
                        continue                        
                    notes.append(Note(
                        pitch=note.pitch,
                        duration=note.end - note.start,
                        start_time=note.start
                    ))
            if not notes: # kosong 
                raise ValueError("No valid notes found in MIDI file")
            return notes  

        except (FileNotFoundError, ValueError) as e:
            raise e
        except Exception as e:
            raise RuntimeError(f"Error loading MIDI file: {str(e)}")




# file_path = "C:/Users/ASUS/Algeo02-23065/tests/anonim/test1.mid"
# file_path = "C:/Users/ASUS/Algeo02-23065/doc/doc.txt"

# print(AudioLoader.load_midi_file(file_path))


# print("==============================================================")
# midi_data = pretty_midi.PrettyMIDI(file_path)
# print("test " , midi_data)