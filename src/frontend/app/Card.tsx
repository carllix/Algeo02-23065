import React from "react";
import MidiPlayer from "./MidiPlayer";

interface CardProps {
  title: string;
  audioName:string;
  albumName: string;
  albumImage: string;
  similarity: number;
  rank: number;
}

export default function Card({
  title,
  albumName,
  albumImage,
  similarity,
  rank,
  audioName,
}: CardProps) {
  return (
    <div className="bg-zinc-900 rounded-md p-4 text-white flex flex-col transform transition-all duration-300 hover:shadow-lg hover:bg-zinc-800">
      {/* Similarity and Rank */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs">
          Similarity: {(similarity * 100).toFixed(0)}%
        </span>
        <div className="bg-[#1DB954] size-4 rounded-full flex items-center justify-center text-zinc-900 text-xs font-semibold">
          {rank}
        </div>
      </div>

      {/* Album Image */}
      <div className="flex flex-col items-center">
        <img
          src={`http://localhost:5000/test/images/${albumImage}`}
          alt={albumName}
          className="size-20 object-cover rounded-md mb-2"
        />
        <h2 className="text-center text-xs">{albumName}</h2>
        <div>
          <MidiPlayer audioUrl={`http://localhost:5000/test/audio/${audioName}`}/>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1">
        <h1 className="text-xs font-semibold text-[#1DB954]">{title}</h1>
        <div className="text-xs text-zinc-400">
          <p>Album: {albumName}</p>
          <p>Artis: {albumName}</p>
        </div>
      </div>
    </div>
  );
}
