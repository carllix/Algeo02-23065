import React, { useState, useEffect } from "react";
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
  const [isSeeking, setIsSeeking] = useState(false);

  let timer: NodeJS.Timeout | null = null;

  useEffect(() => {
    return () => {
      synths.forEach((synth) => synth.dispose());
      clearInterval(timer);
      Tone.Transport.stop();
      Tone.Transport.cancel();
    };
  }, [synths]);

  const handlePlayPause = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isPlaying) {
        await Tone.start();

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

          Tone.Transport.stop();
          Tone.Transport.cancel();

          midi.tracks.forEach((track) => {
            const synth = new Tone.PolySynth(Tone.Synth, {
              envelope: {
                attack: 0.02,
                decay: 0.1,
                sustain: 0.3,
                release: 1,
              },
            }).toDestination();

            setSynths((prevSynths) => [...prevSynths, synth]);

            track.notes.forEach((note) => {
              Tone.Transport.schedule((time) => {
                synth.triggerAttackRelease(
                  note.name,
                  note.duration,
                  time,
                  note.velocity
                );
              }, note.time);
            });
          });
        }

        Tone.Transport.start("+0.1");
        setIsPlaying(true);

        timer = setInterval(() => {
          if (!isSeeking) {
            setCurrentTime(Tone.Transport.seconds);
          }
        }, 500);
      } else {
        Tone.Transport.pause();
        setIsPlaying(false);
        if (timer) clearInterval(timer);
      }
    } catch (error) {
      console.error("Error in playback:", error);
      setError(error instanceof Error ? error.message : "Failed to play MIDI");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeek = (time: number) => {
    setIsSeeking(true);
    setCurrentTime(time);
    Tone.Transport.seconds = time;
    setTimeout(() => setIsSeeking(false), 100);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="midi-controls flex flex-col items-center space-y-4">
      <input
        type="range"
        min="0"
        max={duration}
        value={currentTime}
        onChange={(e) => handleSeek(Number(e.target.value))}
        className="progress-bar w-full"
        style={{ height: "5px", background: "#ddd", borderRadius: "5px", marginBottom: "10px" }}
      />
      <div className="time-display text-sm flex justify-between w-full px-4">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      <div className="playback-control flex items-center justify-center space-x-2">
        <button
          onClick={() => handleSeek(0)}
          className="prev-btn text-gray-700"
          style={{ border: "none", background: "none", fontSize: "1.5rem" }}
        >
          ⏮
        </button>
        <button
          onClick={handlePlayPause}
          disabled={isLoading}
          className="play-btn text-blue-500"
          style={{ border: "none", background: "none", fontSize: "2rem" }}
        >
          {isLoading ? "..." : isPlaying ? "⏸" : "▶"}
        </button>
        <button
          onClick={() => handleSeek(duration)}
          className="next-btn text-gray-700"
          style={{ border: "none", background: "none", fontSize: "1.5rem" }}
        >
          ⏭
        </button>
      </div>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  );
};

export default MidiPlayer;
