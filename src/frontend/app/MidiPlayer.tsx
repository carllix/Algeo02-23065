import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { Midi } from '@tonejs/midi';


interface MidiPlayerProps {
  audioUrl: string;
}

const MidiPlayer: React.FC<MidiPlayerProps> = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [synths, setSynths] = useState<Tone.PolySynth[]>([]);

  // Cleanup synths when component unmounts
  useEffect(() => {
    return () => {
      synths.forEach((synth) => synth.dispose());
    };
  }, [synths]);

  const handlePlay = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isPlaying) {
        await Tone.start();
        
        const response = await fetch(audioUrl);
        if (!response.ok) {
          throw new Error(`Failed to load MIDI file: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const midi = new Midi(arrayBuffer);
        const now = Tone.now() + 0.5;

        // Create synths and schedule notes for each track
        const newSynths: Tone.PolySynth[] = [];
        
        midi.tracks.forEach((track) => {
          const synth = new Tone.PolySynth(Tone.Synth, {
            envelope: {
              attack: 0.02,
              decay: 0.1,
              sustain: 0.3,
              release: 1
            }
          }).toDestination();

          newSynths.push(synth);

          // Schedule all notes
          track.notes.forEach((note) => {
            synth.triggerAttackRelease(
              note.name,
              note.duration,
              note.time + now,
              note.velocity
            );
          });
        });

        setSynths(newSynths);
        setIsPlaying(true);
      } else {
        // Stop playback and dispose synths
        synths.forEach((synth) => {
          synth.disconnect();
        });
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

  return (
    <div className="midi-controls">
      <button 
        onClick={handlePlay}
        disabled={isLoading}
        className={`play-btn bg-blue-500 text-white px-4 py-2 rounded
          ${isLoading ? 'opacity-50' : 'hover:bg-blue-600'}`}
      >
        {isLoading ? 'Loading...' : isPlaying ? '⏹ Stop' : '▶ Play'}
      </button>
      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}
    </div>
  );
};

export default MidiPlayer;