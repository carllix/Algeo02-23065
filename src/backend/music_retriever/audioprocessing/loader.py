import pretty_midi
from typing import List
from audiotypes import Note
import os
import numpy as np
import librosa

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






class WavConverter:
    @staticmethod
    def convert_to_midi_notes(wav_data: bytes) -> List[Note]:
        """
        I.S.: Audio data dalam bytes (WAV)
        F.S.: List[Note] yang berisi pitch, duration, start_time
        """
        try:
            audio_signal, sr = librosa.load(wav_data)
            pitches, magnitudes = librosa.piptrack(y=audio_signal, sr=sr)
            pitches_mean = np.mean(pitches, axis=0)
            midi_notes = librosa.hz_to_midi(pitches_mean)
            notes = []
            current_pitch = None
            start_time = 0
            
            for i, pitch in enumerate(midi_notes):
                if 0 <= pitch <= 127:  
                    if current_pitch != pitch:
                        if current_pitch is not None:
                            duration = i/sr - start_time
                            notes.append(Note(
                                pitch=int(current_pitch),
                                duration=duration,
                                start_time=start_time
                            ))
                        current_pitch = pitch
                        start_time = i/sr
            
            return notes
            
        except Exception as e:
            raise RuntimeError(f"WAV conversion failed: {str(e)}")

# file_path = "C:/Users/ASUS/Algeo02-23065/tests/anonim/test1.mid"
# file_path = "C:/Users/ASUS/Algeo02-23065/doc/doc.txt"

# print(AudioLoader.load_midi_file(file_path))


# print("==============================================================")
# midi_data = pretty_midi.PrettyMIDI(file_path)
# print("test " , midi_data)

