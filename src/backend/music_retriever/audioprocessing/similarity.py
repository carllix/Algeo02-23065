from typing import List, Dict
import numpy as np
from ..audiotypes import SearchResult, AudioFeatures

class SimilarityCalculator:
    def cosine_similarity(self,v1: List[float], v2: List[float]) -> float:
        """
        I.S.: Dua vektor fitur yang akan dibandingkan
        F.S.: Mengembalikan nilai similarity (0-1) antara kedua vektor
        """
        v1_array = np.array(v1)
        v2_array = np.array(v2)
        if np.all(v1_array == 0) or np.all(v2_array == 0):
            return 0.0   
        return np.dot(v1_array, v2_array) / (np.linalg.norm(v1_array) * np.linalg.norm(v2_array))
    
    def calculate_weighted_similarity(self,query: AudioFeatures, dataset: AudioFeatures) -> float:
        """
        I.S.: Features query dan dataset yang akan dibandingkan
        F.S.: Mengembalikan nilai similarity dengan bobot untuk tiap fitur
        """ 
        weights = {'atb': 0.30, 'rtb': 0.40, 'ftb': 0.30} 
        atb_sim = self.cosine_similarity(query.atb, dataset.atb)
        rtb_sim = self.cosine_similarity(query.rtb, dataset.rtb)
        ftb_sim = self.cosine_similarity(query.ftb, dataset.ftb)
        return weights['atb']*atb_sim + weights['rtb']*rtb_sim + weights['ftb']*ftb_sim

    def rank_results(self,similarities: List[float]) -> List[SearchResult]:
        """
        I.S.: List nilai similarity dari setiap perbandingan
        F.S.: Mengembalikan list SearchResult yang sudah diurutkan berdasarkan similarity
        """
        # output = []
        # for audio_name, info in similarities.items():
        #     output.append(SearchResult(
        #         audio_name=audio_name,
        #         similarity=info["similarity"],
        #         title_song=info["song_title"],
        #         album_image=info["album_image"],
        #         album_title=info["album_title"]
        #     ))
        # return sorted(output, key=lambda x: x.similarity, reverse=True)

        output = [
            SearchResult(audio_name=audio_name, **info)
            for audio_name, info in similarities.items()
        ]
        return sorted(output, key=lambda x: x.similarity, reverse=True)