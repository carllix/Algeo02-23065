from typing import List, Dict, Any
import os
from .audiotypes import Note, AudioFeatures, SearchResult
from .audioprocessing import AudioLoader, AudioNormalizer,Extractor,SimilarityCalculator
from .audioutils import FileUtils
import numpy as np

class MusicRetriever:
    def __init__(self):
        self.dataset_features: Dict[str, AudioFeatures] = {}
        self.mapping: Dict[str, Dict[str, str]] = {}
        self.loader = AudioLoader()
        self.normalizer = AudioNormalizer()
        self.extractor = Extractor()
        self.similarity_calculator = SimilarityCalculator()

    def _extract_features(self, windows: List[List[Note]]) -> AudioFeatures:
        if not windows:
            return AudioFeatures(atb=[], rtb=[], ftb=[])
        features_list = [
            AudioFeatures(
                atb=self.extractor.extract_atb(window),
                rtb=self.extractor.extract_rtb(window),
                ftb=self.extractor.extract_ftb(window)      
            ) for window in windows
        ]
        combined_atb = np.mean([f.atb for f in features_list], axis=0)
        combined_rtb = np.mean([f.rtb for f in features_list], axis=0)
        combined_ftb = np.mean([f.ftb for f in features_list], axis=0)
        return AudioFeatures(       
            atb=combined_atb,
            rtb=combined_rtb,
            ftb=combined_ftb,
        )

    def load_audio_files(self, root_dir: str) -> List[str]:
        processed_files = []
        for file in os.listdir(root_dir):
            try:    
                file_path = os.path.join(root_dir, file)
                notes = self.loader.load_audio_file(file_path)
                if notes:  
                    notes = self.normalizer.normalize_tempo(notes)
                    windows = self.normalizer.apply_windowing(notes, 40, 8)
                    features = self._extract_features(windows)
                    self.dataset_features[file] = features
                    processed_files.append(file_path)
            except  Exception as e :
                print(f"Skipping {file}: {str(e)}")
                continue 
        return processed_files
    
    def process_query_file(self, root_dir : str, file_name : str) -> AudioFeatures:
        file_path = os.path.join(root_dir, file_name)   
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Query file not found: {file_path}")    
        try:
            notes = self.loader.load_audio_file(file_path)   
            if notes :  
                notes = self.normalizer.normalize_tempo(notes)   
                windows = self.normalizer.apply_windowing(notes, 40, 8)
                return self._extract_features(windows)  
            else:
                raise ValueError("Tidak ada notes valid pada query file")
        except Exception as e:
            raise RuntimeError(f"Query processing failed: {str(e)}")    

    def find_matches(self, query_features: AudioFeatures) -> List[SearchResult]:
        """
        I.S : Query features sudah diekstrak, dataset tidak kosong
        F.S : Menghasilkan list SearchResult terurut berdasarkan similarity
        """
        output = []
        if self.dataset_features:  
            similarities = {}
            for file_name, features in self.dataset_features.items():
                similarity = self.similarity_calculator.calculate_weighted_similarity(query_features, features)
                similarities[file_name] = similarity
            output = self.similarity_calculator.rank_results(similarities)
        return output
    
    def get_paginated_results(self, results: List[SearchResult], page: int, items_per_page: int) -> Dict[str, Any]:
        """
        I.S : Hasil pencarian sudah tersedia
        F.S : Menghasilkan dictionary berisi:
                - items: List[SearchResult] untuk halaman yang diminta
                - total_pages: Total halaman
                - current_page: Halaman sekarang
        """
        total_items = len(results)
        total_pages = (total_items + items_per_page - 1) // items_per_page
        start_idx = (page - 1) * items_per_page
        end_idx = min(start_idx + items_per_page, total_items)
        
        return {
            'items': results[start_idx:end_idx],
            'total_pages': total_pages,
            'current_page': page
        }

    # def process_query_recording(self,root_dir:str, recording_data: bytes) -> AudioFeatures:
    #     try:
    #         temp_file = "temp_recording.wav"
    #         file_path = os.path.join(root_dir, temp_file)
    #         with open(file_path, "wb") as f:
    #             f.write(recording_data)
    #         notes = self.loader.load_wav_file(file_path)
    #         os.remove(file_path)
    #         notes = self.normalizer.normalize_tempo(notes)
    #         windows = self.normalizer.apply_windowing(notes, 40, 8)
    #         return self._extract_features(windows)
        
    #     except Exception as e:
    #         raise RuntimeError(f"Recording processing failed: {str(e)}")

    def load_zipped_dataset(self, root_dir:str, zipped_path: str) -> List[str]:
        """
        I.S : File path ZIP valid dan tersedia 
        F.S : File terextract dan terproses, mengembalikan list file yang berhasil diproses
        """
        temp_dir = os.path.join(root_dir, "audio_extracted_temp")  
        os.makedirs(temp_dir, exist_ok=True)
        try:
            midi_files = FileUtils.extract_dataset_zip(zipped_path, temp_dir)
            
            if not midi_files:
                raise ValueError(f"Tidak ada file MIDI ditemukan dalam {zipped_path}")
            processed_files = self.load_audio_files(temp_dir)
            return processed_files
        finally:
            FileUtils.delete_temp(midi_files, temp_dir)


