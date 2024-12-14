"use client";
import React, { useState } from "react";
import MidiPlayerGrid from "./MidiPlayerGrid";

// Buat 50 data mockup
const generateMockData = () => {
 const mockItems = [];
 for (let i = 1; i <= 50; i++) {
   mockItems.push({
     audioName: `x (${i}).mid`, 
     albumImage: "album1.jpeg",
     title: `Album ${i}`
   });
 }
 
 // Bagi data ke dalam pages dengan 10 item per page
 const data: Record<number, typeof mockItems> = {};
 const itemsPerPage = 10;
 
 for (let page = 1; page <= Math.ceil(mockItems.length / itemsPerPage); page++) {
   const start = (page - 1) * itemsPerPage;
   data[page] = mockItems.slice(start, start + itemsPerPage);
 }
 
 return data;
};

const mockData = generateMockData();

export default function Page() {
 const [currentPage, setCurrentPage] = useState<number>(1);
 const [currentMode, setCurrentMode] = useState<"Album" | "Music">("Album");

 const maxPage = Object.keys(mockData).length;

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
             <span>Audio_Name.midi</span>
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
         <div className="search-bar">
           <input type="text" placeholder="Search..." />
         </div>
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
          <MidiPlayerGrid items={mockData[currentPage]} />
         {/* {mockData[currentPage].map((item, index) => (
           <div className="audio-item" key={index}>
             <img
               src={`/assets/images/${item.albumImage}`}
               alt={item.title}
               className="album-image"
             />
             <div className="song-title">{item.title}</div>
             <audio controls>
               <source src={`/assets/audio/${item.audioName}`} type="audio/midi" />
               Your browser does not support MIDI playback.
             </audio>
           </div>
         ))} */}
       </div>
     </div>
   </div>
 );
}
