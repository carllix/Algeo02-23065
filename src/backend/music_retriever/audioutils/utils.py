from typing import List, Dict
import os
import json
import zipfile


class AudioUtils:    
    @staticmethod
    def load_mapping(self, mapping_file: str) -> Dict:
        """
        I.S.: Path ke file mapping (.txt atau .json)
        F.S.: Mengembalikan dictionary mapping
        """
        if mapping_file.endswith('.json'):
            with open(mapping_file) as f:
                self.mapping = json.load(f)
        elif mapping_file.endswith('.txt'):
            # Handle txt format
            with open(mapping_file) as f:
                for line in f:
                    audio_file, title, pic_name = line.strip().split()
                    self.mapping[audio_file] = {
                        "title": title,
                        "pic_name": pic_name
                    }
    
class FileUtils:
    @staticmethod
    def extract_dataset_zip( zip_path:str ,extract_path: str) -> List[str]:
        """
        I.S.: Path ke file zip dan path untuk extract
        F.S.: List path file MIDI yang diekstrak
        """
        midi_files = []
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(extract_path) 
                
                for root, dirs, files in os.walk(extract_path):
                    for file in files:
                        if file.endswith('.mid'):
                            full_path = os.path.join(root, file)
                            midi_files.append(full_path)
            return midi_files
        except Exception as e:
            raise RuntimeError(f"Failed to extract zip: {str(e)}")

    @staticmethod
    def cleanup_temp_files(files: List[str], temp_dir: str):
        """
        I.S.: List file dan directory yang akan dihapus
        F.S.: File dan directory temporary dibersihkan
        """
        for file in files:
            if os.path.exists(file):
                os.remove(file)
        if os.path.exists(temp_dir):
            os.rmdir(temp_dir)
