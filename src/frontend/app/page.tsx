"use client";

import React, { useState, useRef } from "react";
import Card from "./Card";
// import MidiPlayerGrid from "./MidiPlayerGrid";
import { FaMusic, FaVolumeUp } from "react-icons/fa";

const MOCKUP_DATA = [
  {
    title: "Bohemian Rhapsody",
    albumName: "A Night at the Opera",
    albumImage: "/album1.jpg",
    similarity: 0.95,
  },
  {
    title: "Stairway to Heaven",
    albumName: "Led Zeppelin IV",
    albumImage: "/album2.jpg",
    similarity: 0.88,
  },
  {
    title: "Imagine",
    albumName: "Imagine",
    albumImage: "/album3.jpg",
    similarity: 0.82,
  },
  {
    title: "Billie Jean",
    albumName: "Thriller",
    albumImage: "/album4.jpg",
    similarity: 0.9,
  },
  {
    title: "Like a Rolling Stone",
    albumName: "Highway 61 Revisited",
    albumImage: "/album5.jpg",
    similarity: 0.85,
  },
  {
    title: "Smells Like Teen Spirit",
    albumName: "Nevermind",
    albumImage: "/album6.jpg",
    similarity: 0.79,
  },
  {
    title: "Sweet Child O' Mine",
    albumName: "Appetite for Destruction",
    albumImage: "/album7.jpg",
    similarity: 0.87,
  },
  {
    title: "Losing My Religion",
    albumName: "Out of Time",
    albumImage: "/album8.jpg",
    similarity: 0.8,
  },
  {
    title: "Purple Rain",
    albumName: "Purple Rain",
    albumImage: "/album9.jpg",
    similarity: 0.92,
  },
  {
    title: "Hotel California",
    albumName: "Hotel California",
    albumImage: "/album10.jpg",
    similarity: 0.89,
  },
  {
    title: "Wonderwall",
    albumName: "Morning Glory",
    albumImage: "/album11.jpg",
    similarity: 0.75,
  },
  {
    title: "Riders on the Storm",
    albumName: "L.A. Woman",
    albumImage: "/album12.jpg",
    similarity: 0.83,
  },
  {
    title: "Zombie",
    albumName: "No Need to Argue",
    albumImage: "/album13.jpg",
    similarity: 0.77,
  },
  {
    title: "Sweet Dreams",
    albumName: "Sweet Dreams",
    albumImage: "/album14.jpg",
    similarity: 0.86,
  },
  {
    title: "Creep",
    albumName: "Pablo Honey",
    albumImage: "/album15.jpg",
    similarity: 0.81,
  },
  {
    title: "Black or White",
    albumName: "Dangerous",
    albumImage: "/album16.jpg",
    similarity: 0.93,
  },
  {
    title: "Born to Run",
    albumName: "Born to Run",
    albumImage: "/album17.jpg",
    similarity: 0.84,
  },
  {
    title: "Sweet Home Alabama",
    albumName: "Second Helping",
    albumImage: "/album18.jpg",
    similarity: 0.78,
  },
  {
    title: "Californication",
    albumName: "Californication",
    albumImage: "/album19.jpg",
    similarity: 0.91,
  },
  {
    title: "With or Without You",
    albumName: "The Joshua Tree",
    albumImage: "/album20.jpg",
    similarity: 0.86,
  },
];

export default function Page() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentMode, setCurrentMode] = useState<"Album" | "Music">("Album");
  const [message, setMessage] = useState<string | null>(null);
  const [datasets] = useState<any[]>(MOCKUP_DATA);

  const itemsPerPage = 8;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const itemsToDisplay = datasets.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(datasets.length / itemsPerPage);

  const [audioFileName, setAudioFileName] = useState<string>("-");
  const [imageFileName, setImageFileName] = useState<string>("-");
  const [mapperFileName, setMapperFileName] = useState<string>("-");
  const [queryImageFileName, setQueryImageFileName] = useState<string | null>(
    null
  );
  const [queryAudioFileName, setQueryAudioFileName] = useState<string | null>(
    null
  );
  // const [datasets, setDatasets] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isDatasetLoaded, setIsDatasetLoaded] = useState<boolean>(false);

  const checkDatasetStatus = () => {
    const isComplete =
      audioFileName !== "-" && imageFileName !== "-" && mapperFileName !== "-";
    setIsDatasetLoaded(isComplete);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    const maxPage = Math.ceil(
      (searchResults.length > 0 ? searchResults.length : datasets.length) / 10
    );
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
          const initialData = Object.entries(result).map(
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
        similarity: item.similarity,
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
        similarity: item.similarity,
      }));
      console.log(formattedResults);
      setSearchResults(formattedResults);
    } catch (error) {
      console.error(error);
      setErrorMessage("Error searching similar music");
    }
  };

  // const displayItems = searchResults.length > 0 ? searchResults : datasets;

  return (
    <div className="h-screen flex">
      {/* Side Bar */}
      <div className="w-1/4 bg-zinc-900 p-8">
        <div className="justify-center items-center flex gap-x-4">
          <h1 className="text-2xl font-bold text-center text-slate-200 mb-5">
            Sound The Sheep
          </h1>
          {/* <FaVolumeUp className="text-3xl text-[#FFFFFF]" /> */}
        </div>

        {/* Upload Query */}
        <div className="flex flex-col justify-center items-center gap-4">
          <div className="bg-slate-200 w-full h-36 rounded-md p-3 relative flex flex-col items-center justify-center">
            {currentMode === "Album" ? (
              queryImageFileName ? (
                <>
                  <img
                    src={`http://localhost:5000/test/query_image/${queryImageFileName}`}
                    // src="/test/query_image/0ecuaq.jpg"
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
            className="w-full bg-[#1DB954] text-black border-none py-2 px-4 rounded-lg cursor-pointer font- transition-all duration-300 hover:bg-[#1ed760] hover:shadow-[0_4px_15px_rgba(29,185,84,0.5)]"
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

        {/* Pesan Kesalahan */}
        <div
          className={`flex flex-col justify-center p-3 mt-8 h-[75px] rounded-lg text-red-600 text-center ${
            errorMessage ? "border-2 border-slate-50" : "border-0"
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
        {/* Button */}
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
            <button className="w-full bg-[#1DB954] text-black border-none py-2 px-4 rounded-lg cursor-pointer font-medium transition-all duration-300 hover:bg-[#1ed760] hover:shadow-[0_4px_15px_rgba(29,185,84,0.5)]">
              Reset
            </button>
          </div>
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

        {/* Result */}
        <div className="grid grid-cols-4 gap-x-8 gap-y-4">
          {itemsToDisplay.map((item, index) => (
            <Card
              key={index}
              title={item.title}
              albumName={item.albumName}
              albumImage={item.albumImage}
              similarity={item.similarity}
              rank={index + 1}
            />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-0 text-sm">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="bg-[#1DB954] text-black border-none py-2 px-4 rounded-lg cursor-pointer font-medium transition-all duration-300 hover:bg-[#1ed760] hover:shadow-[0_4px_15px_rgba(29,185,84,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-white">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="bg-[#1DB954] text-black border-none py-2 px-4 rounded-lg cursor-pointer font-medium transition-all duration-300 hover:bg-[#1ed760] hover:shadow-[0_4px_15px_rgba(29,185,84,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
