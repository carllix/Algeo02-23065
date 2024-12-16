from typing import List, Dict, Any
import os
from .audiotypes import Note, AudioFeatures, SearchResult
from .audioprocessing import AudioLoader, AudioNormalizer,Extractor,SimilarityCalculator
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

    def set_mapping(self, mapping: Dict[str, Dict[str, Any]]) -> None:
        self.mapping = mapping

    def get_file_info(self, audio_name: str) -> Dict[str, Any]:
        if audio_name in self.mapping:
            return {
                "song_title": self.mapping[audio_name].get("song_title", "Unknown"),
                "image_name": self.mapping[audio_name].get("image_name", "default.jpeg"),
                "album_name": self.mapping[audio_name].get("album_name", "Unknown"),
                "artist": self.mapping[audio_name].get("artist","Unknown")
            }
        return {
            "song_title": "Unknown",
            "image_name": "default.jpg",
            "album_name": "Unknown",
            "artist": "Unknown"
        }
    
    def load_audio_files(self, root_dir: str) -> List[str]:
        processed_files = []
        for audio_name in os.listdir(root_dir):
            try:    
                file_path = os.path.join(root_dir, audio_name)
                notes = self.loader.load_audio_file(file_path)
                if notes:  
                    notes = self.normalizer.normalize_tempo(notes)
                    windows = self.normalizer.apply_windowing(notes, 40, 8)
                    features = self._extract_features(windows)
                    self.dataset_features[audio_name] = features
                    processed_files.append(file_path)
            except  Exception as e :
                print(f"Skipping {audio_name}: {str(e)}")
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
            for audio_name, features in self.dataset_features.items():
                similarity = self.similarity_calculator.calculate_weighted_similarity(
                    query_features, features
                )
                if similarity >  0.55:
                    info = self.get_file_info(audio_name)
                    similarities[audio_name] = {
                        "similarity": similarity,
                        "song_title": info["song_title"],
                        "image_name": info["image_name"],
                        "album_name": info["album_name"],
                        "artist": info["artist"]
                    }
            output = self.similarity_calculator.rank_results(similarities)
        return output