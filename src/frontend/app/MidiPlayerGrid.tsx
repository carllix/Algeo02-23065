import React from 'react';
import MidiPlayer from './MidiPlayer';

interface AudioData {
  audioName: string;
  albumImage: string;
  title: string;
}

interface MidiPlayerGridProps {
  items: AudioData[];
}



const MidiPlayerGrid: React.FC<MidiPlayerGridProps> =({items})=> {
    return (
      <div className="audio-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <div key={index} className="audio-item bg-white rounded-lg shadow p-4">
            <img
              src={`/assets/images/${item.albumImage}`}
              alt={item.title}
              className="album-image w-full h-48 object-cover rounded mb-2"
            />
            <div className="song-title font-medium mb-2">{item.title}</div>
            <MidiPlayer audioUrl={`/assets/audio/${item.audioName}`} />
          </div>
        ))}
      </div>
    );
  };
  
  export default MidiPlayerGrid;