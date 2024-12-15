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
    <div className="audio-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="audio-item bg-white rounded-lg shadow p-4 flex flex-col items-center"
        >
          {item.albumImage && (
            <div className="image-container w-full mb-2">
              <img
                src={`/test/images/${item.albumImage}`} // Sesuaikan dengan path baru
                alt={item.title}
                className="album-image w-full h-40 object-cover rounded"
              />
            </div>
          )}
          <div className="song-title font-medium mb-2 text-center">{item.title}</div>
          {item.albumName && (
            <div className="album-name text-sm text-gray-600 mb-2">{item.albumName}</div>
          )}
          {item.similarity !== undefined && (
            <div className="similarity text-sm text-blue-600 mb-2">
              Similarity: {(item.similarity * 100).toFixed(2)}%
            </div>
          )}
          <div className="player-container w-full">
            <MidiPlayer audioUrl={`/test/audio/${item.audioName}`} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MidiPlayerGrid;