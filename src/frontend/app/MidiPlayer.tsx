import React, { useState, useEffect, useRef } from "react";
import * as Tone from "tone";
import { Midi } from "@tonejs/midi";

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      synths.forEach((synth) => synth.dispose());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [synths]);

  // Effect to update progress bar when playing
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
          // const response = await fetch(audioUrl);
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
      handlePlayPause(); // Restart playback
    }
  };

  const handleNext = () => {
    setCurrentTime((prev) => Math.min(prev + 20, duration));
    if (isPlaying) {
      handlePlayPause(); // Restart playback
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="midi-controls">
      <input
        type="range"
        min="0"
        max={duration}
        value={currentTime}
        onChange={(e) => setCurrentTime(Number(e.target.value))}
        className="progress-bar"
        style={{ height: "5px", background: "#ddd", borderRadius: "5px", marginBottom: "10px" }}
      />
      <div className="time-display">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      <div className="playback-control">
        <button
          onClick={handlePrev}
          className="prev-btn"
          style={{ border: "none", background: "none", fontSize: "1.5rem" }}
        >
          ⏮
        </button>
        <button
          onClick={handlePlayPause}
          disabled={isLoading}
          className="play-btn"
          style={{ border: "none", background: "none", fontSize: "2rem" }}
        >
          {isLoading ? "..." : isPlaying ? "⏸" : "▶"}
        </button>
        <button
          onClick= {handleNext}
          className="next-btn"
          style={{ border: "none", background: "none", fontSize: "1.5rem" }}
        >
          ⏭
        </button>
      </div>
      {error && <div className="">{error}</div>}
    </div>
  );
};

export default MidiPlayer;
