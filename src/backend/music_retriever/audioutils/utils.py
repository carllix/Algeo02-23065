from typing import List, Dict
import os
import time
import json
import zipfile


class AudioUtils:
    @staticmethod
    def normalize_histogram(histogram: List[float]) -> List[float]:
        """
        I.S.: Histogram belum dinormalisasi
        F.S.: Histogram yang sudah dinormalisasi (sum = 1)
        """
        total = sum(histogram)
        return [count/total for count in histogram] if total else histogram

    @staticmethod
    def get_execution_time(self, start_time: float) -> float:
        """
        I.S.: start_time dalam timestamp
        F.S.: Mengembalikan durasi eksekusi dalam ms
        """
        return (time.time() - start_time) * 1000  
    
    @staticmethod
    def read_mapping_file(self, file_path: str) -> Dict:
        """
        I.S.: Path ke file mapping (.txt atau .json)
        F.S.: Mengembalikan dictionary mapping
        """
        if file_path.endswith('.json'):
            with open(file_path) as f:
                return json.load(f)
        return {}
    
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
