from typing import List, Dict, Any
import os
from .audio_types import Note, AudioFeatures, SearchResult
from .utils import AudioUtils,TimeUtils,FileUtils
from processing import AudioLoader
from processing import AudioNormalizer 
from features import ATBExtractor
from features import RTBExtractor
from features import FTBExtractor
from features import SimilarityCalculator


class MusicRetriever:
    def __init__(self):
        """
        Inisialisasi melody matcher untuk pencarian lagu
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

        # # Contoh data yang diproses:

        # # 1. Dataset Features
        # self.dataset_features = {
        # "asade_kon_uh.mid": AudioFeatures(
        #     atb=[0.1, 0.05, 0.2, 0.0, ..., 0.15],  # 128 nilai
        #     rtb=[0.0, 0.1, 0.3, 0.2, ..., 0.05],   # 255 nilai
        #     ftb=[0.2, 0.1, 0.0, 0.15, ..., 0.1]    # 255 nilai
        # ),
        # "thriller.mid": AudioFeatures(
        #     atb=[0.2, 0.1, 0.0, 0.3, ..., 0.05],   
        #     rtb=[0.15, 0.2, 0.1, 0.0, ..., 0.1],   
        #     ftb=[0.1, 0.3, 0.2, 0.05, ..., 0.15]   
        # )
        # }

        # # 2. Mapping Data
        # self.mapping = {
        # "asade_kon_uh.mid": {
        #     "title": "Asade kon uh - Sigma Male",
        #     "image": "billie_jean_album.png"
        # },
        # "thriller.mid": {
        #     "title": "Thriller - Michael Jackson", 
        #     "image": "thriller_album.png"
        # }
        # }


   # FITUR WAJIB
    def load_audio_files(self, audio_files: List[str]) -> List[str]:
        """
        I.S : List path file audio yang valid sudah terupload
        F.S : File audio terproses dan tersimpan di dataset_features, 
                mengembalikan list nama file yang berhasil diproses
        """

    def process_query_file(self, query_file: str) -> AudioFeatures:
        """
        I.S : File query valid dan tersedia
        F.S : Menghasilkan AudioFeatures dari file query
        """

    def find_matches(self, query_features: AudioFeatures) -> List[SearchResult]:
        """
        I.S : Query features sudah diekstrak, dataset tidak kosong
        F.S : Menghasilkan list SearchResult terurut berdasarkan similarity
        """

    def get_paginated_results(self, page: int, items_per_page: int) -> Dict[str, Any]:
        """
        I.S : Hasil pencarian sudah tersedia
        F.S : Menghasilkan dictionary berisi:
                - items: List[SearchResult] untuk halaman yang diminta
                - total_pages: Total halaman
                - current_page: Halaman sekarang
        """

    # FITUR BONUS
    def process_query_recording(self, recording_data: bytes) -> AudioFeatures:
        """
        I.S : Recording data valid dan tersedia
        F.S : Menghasilkan AudioFeatures dari recording
        """

    def load_compressed_dataset(self, compressed_file: str) -> List[str]:
        """
        I.S : File kompresi valid dan tersedia
        F.S : File terextract dan terproses, mengembalikan list file yang berhasil diproses
        """

    def save_mapping(self, mapping_file: str) -> bool:
        """
        Save mapping audio-title-image
        I.S : File mapping valid dan tersedia
        F.S : Mapping tersimpan, mengembalikan status keberhasilan
        """