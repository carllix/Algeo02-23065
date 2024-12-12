from dataclasses import dataclass
from typing import List, Optional

@dataclass
class Note:
    """Note MIDI"""
    pitch: int       
    duration: float  
    start_time: float  

@dataclass
class AudioFeatures:
    """Fitur-fitur Audio"""
    atb: List[float]  
    rtb: List[float]  
    ftb: List[float]  

@dataclass
class SearchResult:
    """Hasil pencarian audio"""
    file_name: str
    similarity: float
    title: Optional[str] = None


@dataclass
class ProcessedAudio:
    """Audio yg udh di proses"""
    original_file: str
    notes: List[Note]
    features: AudioFeatures