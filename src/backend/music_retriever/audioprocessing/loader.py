from typing import List
from ..audiotypes import Note
import os
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
            calon_main_melody = []
            for instrument in data.instruments:
                if instrument.is_drum:
                    continue

                track_notes = []
                for note in instrument.notes:
                    if 0 <= note.pitch <= 127 and note.start >= 0 and note.end > note.start:
                        track_notes.append(Note(
                            pitch=note.pitch,
                            duration=note.end - note.start,
                            start_time=note.start
                        ))
                
                if track_notes:  #scoring , berdasarkan karakteristik melody utama
                    track_notes.sort(key=lambda x: x.start_time)
                    avg_pitch = sum(note.pitch for note in track_notes) / len(track_notes)
                    duration = track_notes[-1].start_time - track_notes[0].start_time
                    density = len(track_notes) / duration if duration > 0 else 0
                    score = 0 
                    if hasattr(instrument, 'channel') and instrument.channel == 0:  #channel 0 biasanya melodi utama
                        score += 2
                    if instrument.program in [0, 40, 41, 42, 56, 57, 58, 73, 74, 75]: #alat musik yg biasanya jdi melody utama
                        score += 1
                    if 40 <= avg_pitch <= 90:
                        score += 1
                    if 0.2 <= density <= 10:
                        score += 1

                    calon_main_melody.append((track_notes, score))

            if calon_main_melody:
                main_melody = max(calon_main_melody, key=lambda x: x[1])[0]
                return main_melody
            else:
                for instrument in data.instruments:
                    if not instrument.is_drum and instrument.notes:
                        return [Note(
                            pitch=note.pitch,
                            duration=note.end - note.start,
                            start_time=note.start
                        ) for note in sorted(instrument.notes, key=lambda x: x.start)]
                
                raise ValueError("No valid melody notes found.")
            
        except Exception as e:
            raise RuntimeError(f"Error loading MIDI: {str(e)}")