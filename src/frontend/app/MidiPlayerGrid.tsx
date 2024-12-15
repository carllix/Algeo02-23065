import React from 'react';
import MidiPlayer from './MidiPlayer';

interface AudioData {
  audioName: string;
  albumImage?: string; // Tambahkan opsional jika gambar tidak selalu ada
  title: string;
}

interface MidiPlayerGridProps {
  items: AudioData[];
}

const MidiPlayerGrid: React.FC<MidiPlayerGridProps> = ({ items }) => {
  return (
    <div className="audio-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ width: "100%", height: "100%", overflow: "auto" }}>
      {items.map((item, index) => (
        <div
          key={index}
          className="audio-item bg-white rounded-lg shadow p-4 flex flex-col items-center"
        >
          {item.albumImage && (
            <div className="image-container w-full mb-2">
              <img
                src={`/assets/image/${item.albumImage}`}
                alt={item.title}
                className="album-image w-full h-40 object-cover rounded"
              />
            </div>
          )}
          <div className="song-title font-medium mb-2 text-center">{item.title}</div>
          <div className="player-container w-full">
            <MidiPlayer audioUrl={`/assets/audio/${item.audioName}`} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MidiPlayerGrid;
