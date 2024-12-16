"use client";

import React, { useState, useRef } from "react";
import MidiPlayerGrid from "./MidiPlayerGrid";
import { FaMusic } from "react-icons/fa";

export default function Page() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentMode, setCurrentMode] = useState<"Album" | "Music">("Album");
  const [message, setMessage] = useState<string | null>(null);

  const [audioFileName, setAudioFileName] = useState<string>("-");
  const [imageFileName, setImageFileName] = useState<string>("-");
  const [mapperFileName, setMapperFileName] = useState<string>("-");
  const [queryImageFileName, setQueryImageFileName] = useState<string | null>(null);
  const [queryAudioFileName, setQueryAudioFileName] = useState<string | null>(null);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isDatasetLoaded, setIsDatasetLoaded] = useState<boolean>(false);

  const checkDatasetStatus = () => {
    const isComplete = audioFileName !== "-" && 
                      imageFileName !== "-" && 
                      mapperFileName !== "-";
    setIsDatasetLoaded(isComplete);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    const maxPage = Math.ceil((searchResults.length > 0 ? searchResults.length : datasets.length) / 10);
    if (currentPage < maxPage) setCurrentPage(currentPage + 1);
  };

  const handleTabChange = (mode: "Album" | "Music") => {
    setCurrentMode(mode);
    setCurrentPage(1);
    setSearchResults([]);
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

      if (type === "audio") {
        setAudioFileName(file.name);
      } else if (type === "image") {
        setImageFileName(file.name);
      } else if (type === "mapper") {
        setMapperFileName(file.name);

        if (result) {
          const initialData = Object.entries(result).map(([key, value]: [string, any]) => ({
            audioName: key,
            title: value.song_title,
            albumImage: value.image_name,
            albumName: value.album_name
          }));
          setDatasets(initialData);
        }
      } else if (type === "query_audio") {
        setQueryAudioFileName(file.name);
      } else if (type === "query_image") {
        setQueryImageFileName(file.name);
      }
      
      checkDatasetStatus();
    } catch (error) {
      setMessage("Error uploading file");
    }
  };

  const audioFileInputRef = useRef<HTMLInputElement | null>(null);
  const imageFileInputRef = useRef<HTMLInputElement | null>(null);
  const mapperFileInputRef = useRef<HTMLInputElement | null>(null);
  const queryAudioFileInputRef = useRef<HTMLInputElement | null>(null);
  const queryImageFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleButtonClick = (type: string) => {
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

  const handleFindSimilarImage = async () => {
    if (!queryImageFileName) {
      setErrorMessage("Please upload a query image first");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/find_similar_images`,
        {
          method: "POST",
        }
      );
      const result = await response.json();
      const formattedResults = result.similar_images.map((item: any) => ({
        audioName: item.audio_file,
        title: item.song_title,
        albumImage: item.image_name,
        albumName: item.album_name,
        similarity: item.similarity
      }));
      console.log(formattedResults);
      setSearchResults(formattedResults);
    } catch (error) {
      console.error(error);
      setErrorMessage("Error searching similar images");
    }
  };

  const handleFindSimilarMusic = async () => {
    if (!queryAudioFileName) {
      setErrorMessage("Please upload a query audio first");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/find_similar_audios`,
        {
          method: "POST",
        }
      );
      const result = await response.json();
      const formattedResults = result.similar_audios.map((item: any) => ({
        audioName: item.audio_name,
        title: item.song_title,
        albumImage: item.image_name,
        albumName: item.album_name,
        similarity: item.similarity
      }));
      console.log(formattedResults)
      setSearchResults(formattedResults);
    } catch (error) {
      console.error(error);
      setErrorMessage("Error searching similar music");
    }
  };

  const displayItems = searchResults.length > 0 ? searchResults : datasets;
  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const itemsToDisplay = displayItems.slice(startIndex, startIndex + itemsPerPage);

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
                    src={`http://localhost:5000/test/query_image/${queryImageFileName}`}
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
            Page {currentPage} of {Math.ceil(displayItems.length / itemsPerPage)}
          </span>
          <button
            className="nav-btn"
            onClick={handleNextPage}
            disabled={currentPage === Math.ceil(displayItems.length / itemsPerPage)}
          >
            →
          </button>
        </div>
      </div>
      <div className="main-content">
        <div className="tabs">
          <div className="search-bar">
            <button
              className="tab-btn"
              onClick={
                currentMode === "Album"
                  ? handleFindSimilarImage
                  : handleFindSimilarMusic
              }
            >
              Search
            </button>
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
          {!isDatasetLoaded ? (
            <div className="no-data-message">
              Please upload audio dataset, image dataset, and mapper file first
            </div>
          ) : (
            <MidiPlayerGrid items={itemsToDisplay} />
          )}
        </div>
      </div>
    </div>
  );
}