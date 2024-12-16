"use client";

import React, { useState, useRef } from "react";
import Card from "./Card";
import { FaMusic } from "react-icons/fa";

interface SongData {
  title: string;
  albumImage: string;
  albumName: string;
  similarity?: number;
  audioName: string;
}

export default function Page() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentMode, setCurrentMode] = useState<"Album" | "Music">("Album");
  const [timeexecution, setTimeExecution] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [datasets, setDatasets] = useState<SongData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [audioFileName, setAudioFileName] = useState<string>("-");
  const [imageFileName, setImageFileName] = useState<string>("-");
  const [mapperFileName, setMapperFileName] = useState<string>("-");
  const [queryImageFileName, setQueryImageFileName] = useState<string | null>(
    null
  );
  const [queryAudioFileName, setQueryAudioFileName] = useState<string | null>(
    null
  );
  const [searchResults, setSearchResults] = useState<SongData[]>([]);
  const [isDatasetLoaded, setIsDatasetLoaded] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const displayItems: SongData[] =
    searchResults.length > 0 ? searchResults : datasets;
  const itemsPerPage = 8;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const itemsToDisplay = displayItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const totalPages = Math.ceil(displayItems.length / itemsPerPage);

  const checkDatasetStatus = () => {
    const isComplete =
      audioFileName !== "-" && imageFileName !== "-" && mapperFileName !== "-";
    setIsDatasetLoaded(isComplete);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleTabChange = (mode: "Album" | "Music") => {
    setCurrentMode(mode);
    setCurrentPage(1);
    setSearchResults([]);
  };

  const handleReset = async() => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:5000/reset`,
        {
          method: "POST",
        }
      );
      const result = await response.json();
      
      // Reset all state variables
      setSearchResults([]);
      setQueryImageFileName(null);
      setQueryAudioFileName(null);
      setCurrentPage(1);
      setErrorMessage("");
      setTimeExecution(null);
      setMessage(null);
      setDatasets([]); 
      setAudioFileName("-");
      setImageFileName("-");
      setMapperFileName("-");
      
      // Important: Reset file input refs
      if (audioFileInputRef.current) audioFileInputRef.current.value = "";
      if (imageFileInputRef.current) imageFileInputRef.current.value = "";
      if (mapperFileInputRef.current) mapperFileInputRef.current.value = "";
      if (queryAudioFileInputRef.current) queryAudioFileInputRef.current.value = "";
      if (queryImageFileInputRef.current) queryImageFileInputRef.current.value = "";
      
      // Update dataset status
      setIsDatasetLoaded(false);
      
      setMessage(result.message);
    } catch (error) {
      setErrorMessage("Error resetting data");
    } finally {
      setIsLoading(false);
    }
  };
  // const handleReset = async() => {
  //   try {
  //     setIsLoading(true); // Tambahkan loading state
  //     const response = await fetch(
  //       `http://localhost:5000/reset`,
  //       {
  //         method: "POST",
  //       }
  //     );
  //     const result = await response.json();
      
  //     // Reset semua state ke nilai awal
  //     setSearchResults([]);
  //     setQueryImageFileName(null);
  //     setQueryAudioFileName(null);
  //     setCurrentPage(1);
  //     setErrorMessage("");
  //     setTimeExecution(null); // Reset execution time
  //     setMessage(null); // Reset message
  //     setDatasets([]); // Reset datasets
  //     setAudioFileName("-");  // Reset file names
  //     setImageFileName("-");
  //     setMapperFileName("-");
  //     setIsDatasetLoaded(false);
  
  //     // Tampilkan pesan sukses
  //     setMessage(result.message);
  //   } catch (error) {
  //     setErrorMessage("Error resetting data");
  //   } finally {
  //     setIsLoading(false); // Matikan loading state
  //   }
  // };

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "audio" | "image" | "mapper" | "query_audio" | "query_image"
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;

    if (
      (type === "audio" || type === "image") &&
      !e.target.files[0].name.endsWith(".zip")
    ) {
      setErrorMessage(`Please upload a .zip file for ${type} dataset!`);
      return;
    }

    if (type === "mapper" && !e.target.files[0].name.endsWith(".json")) {
      setErrorMessage("Please upload a .json file for mapper!");
      return;
    }

    if (type === "query_audio" && !e.target.files[0].name.endsWith(".mid")) {
      setErrorMessage("Please upload a .mid file for query audio!");
      return;
    }

    if (
      type === "query_image" &&
      !e.target.files[0].name.endsWith(".jpg") &&
      !e.target.files[0].name.endsWith(".png") &&
      !e.target.files[0].name.endsWith(".jpeg")
    ) {
      setErrorMessage("Please upload a .jpg/.png/.jpeg file for query image!");
      return;
    }

    const file = e.target.files[0];
    setErrorMessage("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

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
          const initialData: SongData[] = Object.entries(result).map(
            ([key, value]: [string, any]) => ({
              audioName: key,
              title: value.song_title,
              albumImage: value.image_name,
              albumName: value.album_name,
            })
          );
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
      setErrorMessage("Upload failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindSimilarImage = async () => {
    if (!queryImageFileName) {
      setErrorMessage("Please upload a query image first");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/find_similar_images`,
        {
          method: "POST",
        }
      );
      const result = await response.json();
      const formattedResults: SongData[] = result.similar_images.map(
        (item: any) => ({
          title: item.song_title,
          albumImage: item.image_name,
          albumName: item.album_name,
          similarity: item.similarity,
          audioName: item.audio_name,
        })
      );
      setTimeExecution(result.execution_time_ms);
      setSearchResults(formattedResults);
    } catch (error) {
      console.error(error);
      setErrorMessage("Error searching similar images");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindSimilarMusic = async () => {
    if (!queryAudioFileName) {
      setErrorMessage("Please upload a query audio first");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/find_similar_audios`,
        {
          method: "POST",
        }
      );
      const result = await response.json();
      const formattedResults: SongData[] = result.similar_audios.map(
        (item: any) => ({
          audioName: item.audio_name,
          title: item.song_title,
          albumImage: item.image_name,
          albumName: item.album_name,
          similarity: item.similarity,
        })
      );
      setTimeExecution(result.execution_time_ms);
      setSearchResults(formattedResults);
    } catch (error) {
      console.error(error);
      setErrorMessage("Error searching similar music");
    } finally {
      setIsLoading(false);
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

  return (
    <div className="h-screen flex">
      {/* Side Bar */}
      <div className="w-1/4 bg-zinc-900 p-8">
        <div className="justify-center items-center flex gap-x-4">
          <h1 className="text-2xl font-bold text-center text-slate-200 mb-5">
            Sound The Sheep
          </h1>
        </div>

        {/* Upload Query */}
        <div className="flex flex-col justify-center items-center gap-4">
          <div className="bg-zinc-300 w-full h-36 rounded-md p-3 relative flex flex-col items-center justify-center">
            {currentMode === "Album" ? (
              queryImageFileName ? (
                <>
                  <img
                    src={`http://localhost:5000/test/query_image/${queryImageFileName}`}
                    alt="Preview"
                    className="max-w-44 h-24 object-cover rounded-md"
                  />
                  <h1 className="mt-1">{queryImageFileName}</h1>
                </>
              ) : (
                <h1>Upload Your Album Picture</h1>
              )
            ) : queryAudioFileName ? (
              <>
                <FaMusic className="size-8" />
                <h1 className="mt-3">{queryAudioFileName}</h1>
              </>
            ) : (
              <h1>Upload Your MIDI Audio</h1>
            )}
          </div>

          {/* Upload Button */}
          <button
            className="max-w-max bg-[#1DB954] text-black border-none py-2 px-4 rounded-lg cursor-pointer font-medium transition-all duration-300 hover:bg-[#1ed760] hover:shadow-[0_4px_15px_rgba(29,185,84,0.5)]"
            onClick={() =>
              handleButtonClick(
                currentMode === "Album" ? "query_image" : "query_audio"
              )
            }
          >
            Upload {currentMode === "Album" ? "Image" : "Midi"}
          </button>
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
            className="hidden"
          />
        </div>

        {/* Upload dataset */}
        <div className="mt-7 flex flex-col justify-center items-center gap-4">
          <button
            className="w-full bg-[#1DB954] text-black border-none py-2 px-4 rounded-lg cursor-pointer font-medium transition-all duration-300 hover:bg-[#1ed760] hover:shadow-[0_4px_15px_rgba(29,185,84,0.5)]"
            onClick={() => handleButtonClick("audio")}
          >
            Audios
          </button>
          <input
            type="file"
            ref={audioFileInputRef}
            onChange={(e) => handleUpload(e, "audio")}
            className="hidden"
          />

          <button
            className="w-full bg-[#1DB954] text-black border-none py-2 px-4 rounded-lg cursor-pointer font-medium transition-all duration-300 hover:bg-[#1ed760] hover:shadow-[0_4px_15px_rgba(29,185,84,0.5)]"
            onClick={() => handleButtonClick("image")}
          >
            Pictures
          </button>
          <input
            type="file"
            ref={imageFileInputRef}
            onChange={(e) => handleUpload(e, "image")}
            className="hidden"
          />

          <button
            className="w-full bg-[#1DB954] text-black border-none py-2 px-4 rounded-lg cursor-pointer font-medium transition-all duration-300 hover:bg-[#1ed760] hover:shadow-[0_4px_15px_rgba(29,185,84,0.5)]"
            onClick={() => handleButtonClick("mapper")}
          >
            Mapper
          </button>
          <input
            type="file"
            ref={mapperFileInputRef}
            onChange={(e) => handleUpload(e, "mapper")}
            className="hidden"
          />
        </div>

        {/* Error Message */}
        <div
          className={`flex flex-col justify-center p-3 mt-8 h-[75px] rounded-lg text-red-600 text-center ${
            errorMessage ? "border-2 border-red-600" : "border-0"
          }`}
        >
          {errorMessage}
        </div>

        {/* Info */}
        <div className="mt-4 flex flex-col text-white gap-4">
          <h1>Audios: {audioFileName}</h1>
          <h1>Pictures: {imageFileName}</h1>
          <h1>Mapper: {mapperFileName}</h1>
        </div>
      </div>

      <div className="w-3/4 bg-zinc-800 flex flex-col gap-10 px-12 py-8">
        {/* Buttons */}
        <div className="flex justify-between">
          <div className="flex gap-7 text-sm font-semibold">
            <button
              className="w-full bg-[#1DB954] text-black border-none py-2 px-4 rounded-lg cursor-pointer font-medium transition-all duration-300 hover:bg-[#1ed760] hover:shadow-[0_4px_15px_rgba(29,185,84,0.5)]"
              onClick={
                currentMode === "Album"
                  ? handleFindSimilarImage
                  : handleFindSimilarMusic
              }
            >
              Search
            </button>
            <button
              onClick={handleReset}
              className="w-full bg-[#1DB954] text-black border-none py-2 px-4 rounded-lg cursor-pointer font-medium transition-all duration-300 hover:bg-[#1ed760] hover:shadow-[0_4px_15px_rgba(29,185,84,0.5)]"
            >
              Reset
            </button>
          </div>
          {timeexecution && (
            <div className="bg-[#1DB954] flex items-center px-3 py-1 rounded-lg">
              <h1>Execution Time: {timeexecution.toFixed(4)} ms</h1>
            </div>
          )}
          <div className="flex gap-7 text-sm font-semibold">
            <button
              className="w-full bg-[#1DB954] text-black border-none py-1 px-3 rounded-lg cursor-pointer font-medium transition-all duration-300 hover:bg-[#1ed760] hover:shadow-[0_4px_15px_rgba(29,185,84,0.5)]"
              onClick={() => handleTabChange("Album")}
            >
              Album
            </button>
            <button
              className="w-full bg-[#1DB954] text-black border-none py-1 px-3 rounded-lg cursor-pointer font-medium transition-all duration-300 hover:bg-[#1ed760] hover:shadow-[0_4px_15px_rgba(29,185,84,0.5)]"
              onClick={() => handleTabChange("Music")}
            >
              Music
            </button>
          </div>
        </div>
        {isLoading ? (
          <div className="text-white text-center">Loading...</div>
        ) : itemsToDisplay.length === 0 ? (
          <div className="text-white text-center">No results found</div>
        ) : (
          <div className="grid grid-cols-4 gap-x-8 gap-y-4">
            {itemsToDisplay.map((item, index) => (
              <Card
                key={index}
                title={item.title}
                albumName={item.albumName}
                albumImage={item.albumImage}
                similarity={item.similarity ? item.similarity : 0}
                rank={startIndex + index + 1}
                audioName={item.audioName}
              />
            ))}
          </div>
        )}
        <div className="flex justify-center items-center gap-4 mt-0 text-sm">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1 || itemsToDisplay.length === 0}
            className="bg-[#1DB954] text-black border-none py-2 px-4 rounded-lg cursor-pointer font-medium transition-all duration-300 hover:bg-[#1ed760] hover:shadow-[0_4px_15px_rgba(29,185,84,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-white">
            Page {itemsToDisplay.length === 0 ? 0 : currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || itemsToDisplay.length === 0}
            className="bg-[#1DB954] text-black border-none py-2 px-4 rounded-lg cursor-pointer font-medium transition-all duration-300 hover:bg-[#1ed760] hover:shadow-[0_4px_15px_rgba(29,185,84,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
