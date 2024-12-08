"use client";
import React, { useState } from "react";

export default function InteractiveLayout({ children }: { children: React.ReactNode }) {
  const [audioList, setAudioList] = useState<string[]>([]);

  return (
    <div className="container">
      <div className="main-content">
        {children}
        <div className="audio-grid">
          {audioList.map((audio, index) => (
            <div key={index} className="audio-item">
              <audio controls>
                <source src={audio} type="audio/midi" />
                Your browser does not support MIDI playback.
              </audio>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
