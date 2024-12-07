from typing import List, Dict
import numpy as np
from audiotypes import SearchResult, AudioFeatures

class SimilarityCalculator:
    def cosine_similarity(self,v1: List[float], v2: List[float]) -> float:
        """
        I.S.: Dua vektor fitur yang akan dibandingkan
        F.S.: Mengembalikan nilai similarity (0-1) antara kedua vektor
        """
        # dot_product = sum(x*y for x,y in zip(v1,v2))
        # norm1 = sum(x*x for x in v1) ** 0.5
        # norm2 = sum(x*x for x in v2) ** 0.5
        # return dot_product / (norm1 * norm2) if norm1 * norm2 else 0
        norm1 = np.linalg.norm(v1)
        norm2 = np.linalg.norm(v2)
        if norm1 == 0 or norm2 == 0:
            return 0
        return np.dot(v1, v2) / (norm1 * norm2)
    def calculate_weighted_similarity(self,query: AudioFeatures, dataset: AudioFeatures) -> float:
        """
        I.S.: Features query dan dataset yang akan dibandingkan
        F.S.: Mengembalikan nilai similarity dengan bobot untuk tiap fitur
        """
        weights = {'atb': 0.4, 'rtb': 0.3, 'ftb': 0.3}
        atb_sim = self.cosine_similarity(query.atb, dataset.atb)
        rtb_sim = self.cosine_similarity(query.rtb, dataset.rtb)
        ftb_sim = self.cosine_similarity(query.ftb, dataset.ftb)
        return weights['atb']*atb_sim + weights['rtb']*rtb_sim + weights['ftb']*ftb_sim

    def rank_results(self,similarities: List[float]) -> List[SearchResult]:
        """
        I.S.: List nilai similarity dari setiap perbandingan
        F.S.: Mengembalikan list SearchResult yang sudah diurutkan berdasarkan similarity
        """
        output = []
        for file_name, similarity in similarities.items():
            output.append(SearchResult(
                file_name=file_name,
                similarity=similarity,
                title=self.mapping.get(file_name, {}).get('title')
            ))
        return sorted(output, key=lambda x: x.similarity, reverse=True)
