from typing import List, Dict
import numpy as np
from ..audio_types import SearchResult, AudioFeatures

class SimilarityCalculator:
    def cosine_similarity(v1: List[float], v2: List[float]) -> float:
        """
        I.S.: Dua vektor fitur yang akan dibandingkan
        F.S.: Mengembalikan nilai similarity (0-1) antara kedua vektor
        """

    def calculate_weighted_similarity(query_features: Dict, dataset_features: Dict) -> float:
        """
        I.S.: Features query dan dataset yang akan dibandingkan
        F.S.: Mengembalikan nilai similarity dengan bobot untuk tiap fitur
        """

    def rank_results(similarities: List[float]) -> List[SearchResult]:
        """
        I.S.: List nilai similarity dari setiap perbandingan
        F.S.: Mengembalikan list SearchResult yang sudah diurutkan berdasarkan similarity
        """

