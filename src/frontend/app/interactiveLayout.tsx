"use client";
import React, { useState } from "react";

export default function InteractiveLayout({ children }: { children: React.ReactNode }) {
  const [audioList, setAudioList] = useState<string[]>([]);

  return (
    <div className="container" style={{ width: "100vw", height: "100vh" }}>
    <div className="main-content" style={{ flex: 1 }}>
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
