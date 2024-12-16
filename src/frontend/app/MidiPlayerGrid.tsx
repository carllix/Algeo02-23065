import React from 'react';
import MidiPlayer from './MidiPlayer';

interface AudioData {
  audioName: string;
  albumImage?: string;
  title: string;
  albumName?: string;
  similarity?: number;
}

interface MidiPlayerGridProps {
  items: AudioData[];
}

const MidiPlayerGrid: React.FC<MidiPlayerGridProps> = ({ items }) => {
  return (
    <div className="audio-grid">
      {items.map((item, index) => (
        <div
          key={index}
          className="audio-item"
        >
          {item.albumImage && (
            <div className="image-container">
              <img
                src={`http://localhost:5000/test/images/${item.albumImage}`}
                alt={item.title}
                className="album-image"
              />
            </div>
          )}
          <div className="song-title">{item.title}</div>
          {item.albumName && (
            <div className="album-name">{item.albumName}</div>
          )}
          {item.similarity !== undefined && (
            <div className="similarity">
              Similarity: {(item.similarity * 100).toFixed(2)}%
            </div>
          )}
          <div className="player-container">
            <MidiPlayer audioUrl={`http://localhost:5000/test/audio/${item.audioName}`} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MidiPlayerGrid;