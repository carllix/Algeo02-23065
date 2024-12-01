# Expose main classes
from .main import MusicRetriever
from .audio_types import Note, AudioFeatures, SearchResult
from .utils import AudioUtils, TimeUtils, FileUtils

__all__ = [
    'MusicRetriever',
    'Note',
    'AudioFeatures',
    'SearchResult',
    'AudioUtils',
    'TimeUtils',
    'FileUtils'
]

