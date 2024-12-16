import React, { useState, useEffect, useRef } from "react";
import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
import { MdSkipPrevious ,MdSkipNext,MdPlayArrow,MdPause,MdRefresh } from 'react-icons/md';

interface MidiPlayerProps {
  audioUrl: string;
}

const MidiPlayer: React.FC<MidiPlayerProps> = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [synths, setSynths] = useState<Tone.PolySynth[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    return () => {
      synths.forEach((synth) => synth.dispose());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [synths]);


  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev < duration) {
            return prev + 1;
          } else {
            clearInterval(timerRef.current!);
            setIsPlaying(false);
            return prev;
          }
        });
      }, 1000);
    } else if (!isPlaying && timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, duration]);

  const handlePlayPause = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isPlaying) {
        await Tone.start();

        const now = Tone.now();

        if (synths.length === 0) {
          const response = await fetch(audioUrl);
          if (!response.ok) {
            throw new Error(`Failed to load MIDI file: ${response.statusText}`);
          }

          const arrayBuffer = await response.arrayBuffer();
          const midi = new Midi(arrayBuffer);

          const totalDuration = Math.max(
            ...midi.tracks.map((track) =>
              track.notes.length > 0
                ? track.notes[track.notes.length - 1].time +
                  track.notes[track.notes.length - 1].duration
                : 0
            )
          );
          setDuration(totalDuration);

          const newSynths: Tone.PolySynth[] = [];

          midi.tracks.forEach((track) => {
            const synth = new Tone.PolySynth(Tone.Synth, {
              envelope: {
                attack: 0.02,
                decay: 0.1,
                sustain: 0.3,
                release: 1,
              },
            }).toDestination();

            newSynths.push(synth);

            track.notes.forEach((note) => {
              if (note.time >= currentTime) {
                synth.triggerAttackRelease(
                  note.name,
                  note.duration,
                  note.time + now - currentTime,
                  note.velocity
                );
              }
            });
          });

          setSynths(newSynths);
        }

        setIsPlaying(true);
      } else {
        synths.forEach((synth) => synth.disconnect());
        setSynths([]);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error in playback:", error);
      setError(error instanceof Error ? error.message : "Failed to play MIDI");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrev = () => {
    setCurrentTime(0);
    if (isPlaying) {
      handlePlayPause(); 
    }
  };

  const handleNext = () => {
    setCurrentTime((prev) => Math.min(prev + 20, duration));
    if (isPlaying) {
      handlePlayPause(); 
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="w-full max-w-[150px] mx-auto text-center">
      <input
        type="range"
        min="0"
        max={duration}
        value={currentTime}
        onChange={(e) => setCurrentTime(Number(e.target.value))}
        className="progress-bar"
        style={{
          height: "2px",
          background: "#ddd",
          borderRadius: "2px",
          marginBottom: "0px",
        }}
      />
      <div className="flex justify-between text-xs">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      <div className="flex justify-center items-center gap-0">
        <button
          onClick={handlePrev}
          className="prev-btn"
          style={{ border: "none", background: "none", fontSize: "0.75rem" }}
        >
         <MdSkipPrevious className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={handlePlayPause}
          disabled={isLoading}
          className="play-btn"
          style={{ border: "none", background: "none", fontSize: "0.75rem" }}
        >
            {isLoading ? (
            <MdRefresh className="h-8 w-8 text-white animate-spin" />  
          ) : isPlaying ? (
            <MdPause className="h-8 w-8 text-white" />  
          ) : (
            <MdPlayArrow className="h-8 w-8 text-white" />  
          )}
        </button>
        <button
          onClick={handleNext}
          className="next-btn"
          style={{ border: "none", background: "none", fontSize: "0.75rem" }}
        >
         <MdSkipNext className="h-6 w-6 text-white" />
        </button>
      </div>
      {error && <div className="text-xs">{error}</div>}
    </div>
  );
};

export default MidiPlayer;
