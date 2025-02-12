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
    audio_name: str 
    similarity: float
    song_title: str = "Unknown"
    image_name: str = "default.jpg"
    album_name: str = "Unknown"
    artist:str ="Unknown"

@dataclass
class ProcessedAudio:
    """Audio yg udh di proses"""
    original_file: str
    notes: List[Note]
    features: AudioFeatures