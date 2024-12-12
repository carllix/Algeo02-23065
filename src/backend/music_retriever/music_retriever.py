from typing import List, Dict, Any
import os
from .audiotypes import Note, AudioFeatures, SearchResult
from .audioprocessing import AudioLoader, AudioNormalizer,ATBExtractor,FTBExtractor,RTBExtractor,SimilarityCalculator, WavConverter
from .audioutils import FileUtils
import numpy as np

class MusicRetriever:
    def __init__(self):
        """
        Inisialisasi music retriever untuk pencarian lagu
        I.S : -
        F.S : Melody matcher terbentuk dengan dataset dan mapping kosong
        """
        self.dataset_features: Dict[str, AudioFeatures] = {}
        self.mapping: Dict[str, Dict[str, str]] = {}

        # Inisialisasi  components
        self.loader = AudioLoader()
        self.normalizer = AudioNormalizer()
        self.atb_extractor = ATBExtractor()
        self.rtb_extractor = RTBExtractor()
        self.ftb_extractor = FTBExtractor()
        self.similarity_calculator = SimilarityCalculator()


# FITUR WAJIB
    def _extract_features(self, windows: List[List[Note]]) -> AudioFeatures:
        if not windows:
            return AudioFeatures(atb=[], rtb=[], ftb=[])

        # print(f"\nWindows info:")
        # print(f"Number of windows: {len(windows)}")
        # print(f"Sample window sizes: {[len(w) for w in windows[:3]]}")
        # print(f"Sample pitches from first window: {[n.pitch for n in windows[0][:5]]}")
        features_list = [
            AudioFeatures(
                atb=self.atb_extractor.extract_atb(window),
                rtb=self.rtb_extractor.extract_rtb(window),
                ftb=self.ftb_extractor.extract_ftb(window)      
            ) for window in windows
        ]
        combined_atb = np.mean([f.atb for f in features_list], axis=0)
        combined_rtb = np.mean([f.rtb for f in features_list], axis=0)
        combined_ftb = np.mean([f.ftb for f in features_list], axis=0)


        # print("\nFeature sample:")
        # print(f"ATB (first 5): {combined_atb[:20]}")
        # print(f"RTB (first 5): {combined_rtb[:20]}")
        # print(f"FTB (first 5): {combined_ftb[:20]}")
        return AudioFeatures(       
            atb=combined_atb.tolist(),
            rtb=combined_rtb.tolist(),
            ftb=combined_ftb.tolist()
        )

    # def load_audio_files(self, root_dir :str) -> List[str]:
    #     """
    #     I.S : List root dir valid
    #     F.S : File audio terproses dan tersimpan di dataset_features, 
    #             mengembalikan list path file yang berhasil diproses
    #     """
    #     processed_files = []
    #     for file in os.listdir(root_dir):
    #         if file.endswith('.mid'):
    #             try:    
    #                 file_path = os.path.join(root_dir, file)
    #                 notes = self.loader.load_midi_file(file_path)
    #                 if notes:  
    #                     notes = self.normalizer.normalize_pitch(notes)
    #                     notes = self.normalizer.normalize_tempo(notes)
    #                     windows = self.normalizer.apply_windowing(notes, 40, 8) 
    #                     features = self._extract_features(windows)
    #                     self.dataset_features[file] = features
    #                     processed_files.append(file_path)
    #             except Exception as e:
    #                 continue 
    #     return processed_files
    
    def load_audio_files(self, root_dir: str) -> List[str]:
        processed_files = []
        for file in os.listdir(root_dir):
            if file.endswith('.mid'):
                try:    
                    file_path = os.path.join(root_dir, file)
                    # print(f"\nProcessing {file}:")

                    notes = self.loader.load_midi_file(file_path)
                    # print(f"Raw notes: {len(notes)} notes")
                    # print(f"Sample raw pitches: {[n.pitch for n in notes[:5]]}")
                    
                    if notes:  
                        # notes = self.normalizer.normalize_pitch(notes)
                        # print(f"After pitch norm: {[n.pitch for n in notes[:5]]}")
                        
                        # notes = self.normalizer.normalize_tempo(notes)
                        # print(f"After tempo norm: {[n.pitch for n in notes[:5]]}")
                        
                        windows = self.normalizer.apply_windowing(notes, 20, 4)
                        # print(f"Number of windows: {len(windows)}")
                        
                        features = self._extract_features(windows)
                        self.dataset_features[file] = features
                        processed_files.append(file_path)
                except Exception as e:
                    print(f"Error processing {file}: {str(e)}")
                    continue 
        return processed_files
    def process_query_file(self, root_dir : str, file_name : str) -> AudioFeatures:
        """
        I.S : root dir valid 
        F.S : Menghasilkan AudioFeatures dari file query
        """
        file_path = os.path.join(root_dir, file_name)       
        try:
            notes = self.loader.load_midi_file(file_path)    
            # notes = self.normalizer.normalize_pitch(notes)
            # notes = self.normalizer.normalize_tempo(notes)   
            windows = self.normalizer.apply_windowing(notes, 40, 8)
            return self._extract_features(windows)
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
                similarity = self.similarity_calculator.calculate_weighted_similarity(
                    query_features, features)
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

    # FITUR SUNNAH
    def process_query_recording(self, recording_data: bytes) -> AudioFeatures:
        """
        I.S : Recording data valid dan tersedia
        F.S : Menghasilkan AudioFeatures dari recording
        """
        try:
            
            notes = WavConverter.convert_to_midi_notes(recording_data)
            return self._extract_features(notes)
        except Exception as e:
            raise RuntimeError(f"Recording processing failed: {str(e)}")

    def load_zipped_dataset(self, root_dir:str, compressed_folder_name: str) -> List[str]:
        """
        I.S : File ZIP valid dan tersedia di root_dir/compressed_folder_name
        F.S : File terextract dan terproses, mengembalikan list file yang berhasil diproses
        """
        zip_path = os.path.join(root_dir, compressed_folder_name)
        temp_dir = os.path.join(root_dir, "audio_extracted_temp")  
        os.makedirs(temp_dir, exist_ok=True)
        try:
            midi_files = FileUtils.extract_dataset_zip(zip_path, temp_dir)
            
            if not midi_files:
                raise ValueError(f"Tidak ada file MIDI ditemukan dalam {compressed_folder_name}")
            processed_files = self.load_audio_files(temp_dir)
            return processed_files
        finally:
            FileUtils.cleanup_temp_files(midi_files, temp_dir)


