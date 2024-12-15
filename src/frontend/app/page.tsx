"use client";
import React, { useState, useRef } from "react";
import MidiPlayerGrid from "./MidiPlayerGrid";
import { FaMusic } from "react-icons/fa";

// Buat 50 data mockup
const generateMockData = () => {
  const mockItems = [];
  for (let i = 1; i <= 50; i++) {
    mockItems.push({
      audioName: `x (${i}).mid`,
      albumImage: "album1.jpeg",
      title: `Album ${i}`,
    });
  }

  // Bagi data ke dalam pages dengan 10 item per page
  const data: Record<number, typeof mockItems> = {};
  const itemsPerPage = 10;

  for (
    let page = 1;
    page <= Math.ceil(mockItems.length / itemsPerPage);
    page++
  ) {
    const start = (page - 1) * itemsPerPage;
    data[page] = mockItems.slice(start, start + itemsPerPage);
  }

  return data;
};

const mockData = generateMockData();

export default function Page() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentMode, setCurrentMode] = useState<"Album" | "Music">("Album");
  const [message, setMessage] = useState<string | null>(null);

  const [audioFileName, setAudioFileName] = useState<string>("-");
  const [imageFileName, setImageFileName] = useState<string>("-");
  const [mapperFileName, setMapperFileName] = useState<string>("-");
  const [queryImageFileName, setQueryImageFileName] = useState<string | null>(
    null
  );
  const [queryAudioFileName, setQueryAudioFileName] = useState<string | null>(
    null
  );
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

  const [errorMessage, setErrorMessage] = useState<string>("");
  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;

    if (
      (type === "audio" || type === "image") &&
      !e.target.files[0].name.endsWith(".zip")
    ) {
      setErrorMessage(`Please upload a .zip file for ${type} dataset.`);
      return;
    }

    if (type === "mapper" && !e.target.files[0].name.endsWith(".json")) {
      setErrorMessage("Please upload a .json file for mapper.");
      return;
    }

    if (type === "query_audio" && !e.target.files[0].name.endsWith(".mid")) {
      setErrorMessage("Please upload a .mid file for query audio.");
      return;
    }

    if (
      type === "query_image" &&
      !e.target.files[0].name.endsWith(".jpg") &&
      !e.target.files[0].name.endsWith(".png") &&
      !e.target.files[0].name.endsWith(".jpeg")
    ) {
      setErrorMessage("Please upload a .jpg/.png/.jpeg file for query image.");
      return;
    }

    const file = e.target.files[0];
    setErrorMessage("");
    console.log(`${type} file selected:`, file);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`http://localhost:5000/upload/${type}`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      setMessage(result.message || result.error);

      console.log(result);
      if (type === "audio") {
        setAudioFileName(file.name);
      } else if (type === "image") {
        setImageFileName(file.name);
      } else if (type === "mapper") {
        setMapperFileName(file.name);
      } else if (type === "query_audio") {
        setQueryAudioFileName(file.name);
      } else if (type === "query_image") {
        setQueryImageFileName(file.name);
      }
    } catch (error) {
      setMessage("Error uploading file");
    }
  };

  const audioFileInputRef = useRef<HTMLInputElement | null>(null);
  const imageFileInputRef = useRef<HTMLInputElement | null>(null);
  // const queryFileInputRef = useRef<HTMLInputElement | null>(null);
  const mapperFileInputRef = useRef<HTMLInputElement | null>(null);
  const queryAudioFileInputRef = useRef<HTMLInputElement | null>(null);
  const queryImageFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleButtonClick = (type: string) => {
    // Ketika tombol diklik, buka dialog file sesuai dengan tipe
    if (type === "audio" && audioFileInputRef.current) {
      audioFileInputRef.current.click();
    } else if (type === "image" && imageFileInputRef.current) {
      imageFileInputRef.current.click();
    } else if (type === "mapper" && mapperFileInputRef.current) {
      mapperFileInputRef.current.click();
    } else if (type === "query_audio" && queryAudioFileInputRef.current) {
      queryAudioFileInputRef.current.click();
    } else if (type === "query_image" && queryImageFileInputRef.current) {
      queryImageFileInputRef.current.click();
    }
  };

  const handleFindSimilar = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/find_similar_images`,
        {
          method: "POST",
        }
      );
      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container">
      <div className="sidebar">
        <div className="website-name">Sound The Sheep</div>
        <div className="upload-section">
          <div className="upload-preview">
            {currentMode === "Album" ? (
              queryImageFileName ? (
                <>
                  <img
                    src={`/test/query_image/${queryImageFileName}`}
                    alt="Preview"
                    className="preview-img"
                  />
                  <span className="image-name">{queryImageFileName}</span>
                </>
              ) : (
                <span>Upload Your Album Picture</span>
              )
            ) : queryAudioFileName ? (
              <>
                <FaMusic size={15} color="black" />
                <span className="audio-name">{queryAudioFileName}</span>
              </>
            ) : (
              <span>Upload Your MIDI Audio</span>
            )}
          </div>

          <button
            className="upload-btn"
            onClick={() =>
              handleButtonClick(
                currentMode === "Album" ? "query_image" : "query_audio"
              )
            }
          >
            Upload {currentMode === "Album" ? "Album" : "Audio"}
            <input
              type="file"
              ref={
                currentMode === "Album"
                  ? queryImageFileInputRef
                  : queryAudioFileInputRef
              }
              onChange={(e) => {
                handleUpload(
                  e,
                  currentMode === "Album" ? "query_image" : "query_audio"
                );
              }}
              style={{ display: "none" }}
            />
          </button>
        </div>
        {currentMode === "Music" && (
          <button className="microphone-btn">🎤 Microphone</button>
        )}
        <div className="menu">
          <button
            className="menu-btn"
            onClick={() => handleButtonClick("audio")}
          >
            Audios
            <input
              type="file"
              ref={audioFileInputRef}
              onChange={(e) => handleUpload(e, "audio")}
              style={{ display: "none" }}
            />
          </button>

          <button
            className="menu-btn"
            onClick={() => handleButtonClick("image")}
          >
            Pictures
            <input
              type="file"
              ref={imageFileInputRef}
              onChange={(e) => handleUpload(e, "image")}
              style={{ display: "none" }}
            />
          </button>

          <button
            className="menu-btn"
            onClick={() => handleButtonClick("mapper")}
          >
            Mapper
            <input
              type="file"
              ref={mapperFileInputRef}
              onChange={(e) => handleUpload(e, "mapper")}
              style={{ display: "none" }}
            />
          </button>

          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        </div>
        <div className="files">
          <p>Audios: {audioFileName}</p>
          <p>Pictures: {imageFileName}</p>
          <p>Mapper: {mapperFileName}</p>
          <button className="menu-btn" onClick={handleFindSimilar}>
            Find simmilar images
          </button>
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
        </div>
      </div>
    </div>
  );
}
