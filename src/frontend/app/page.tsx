"use client";
import React, { useState } from "react";

const sharedData: Record<number, { audio: string; image: string }[]> = {
  1: [
    { audio: "music1.mp3", image: "/assets/image/album1.jpeg" },
  ],
  2: [
    { audio: "music5.mp3", image: "/assets/images/album5.jpg" },
  ],
};

export default function Home() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentMode, setCurrentMode] = useState<"Album" | "Music">("Album");

  const maxPage = 2;

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < maxPage) setCurrentPage(currentPage + 1);
  };

  const handleTabChange = (mode: "Album" | "Music") => {
    setCurrentMode(mode);
    setCurrentPage(1);
  };

  return (
    <div className="container">
      <div className="sidebar">
        <div className="website-name">Sound The Sheep</div>
        <div className="upload-section">
          <div className="upload-preview">
            {currentMode === "Album" ? (
              <span>Pic_Name.png</span>
            ) : (
              <span>Audio_Name.wav</span>
            )}
          </div>
          <button className="upload-btn">Upload</button>
        </div>
        {currentMode === "Music" && (
          <button className="microphone-btn">🎤 Microphone</button>
        )}
        <div className="menu">
          <button className="menu-btn">Audios</button>
          <button className="menu-btn">Pictures</button>
          <button className="menu-btn">Mapper</button>
        </div>
        <div className="files">
          <p>Audios: audios.zip</p>
          <p>Pictures: pictures.zip</p>
          <p>Mapper: mapper.txt</p>
        </div>
        <div className="pagination">
          <button
            className="nav-btn"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            ←
          </button>
          <span>
            Page {currentPage} of {maxPage}
          </span>
          <button
            className="nav-btn"
            onClick={handleNextPage}
            disabled={currentPage === maxPage}
          >
            →
          </button>
        </div>
      </div>
      <div className="main-content">
        <div className="tabs">
          <button
            className={`tab-btn ${currentMode === "Album" ? "active" : ""}`}
            onClick={() => handleTabChange("Album")}
          >
            Album
          </button>
          <button
            className={`tab-btn ${currentMode === "Music" ? "active" : ""}`}
            onClick={() => handleTabChange("Music")}
          >
            Music
          </button>
        </div>
        <div className="audio-grid">
          {sharedData[currentPage].map((item, index) => (
            <div className="audio-item" key={index}>
              <img
                src={item.image}
                alt="Album Cover"
                className="album-image"
              />
              <audio src={`/assets/audio/${item.audio}`} controls />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
