import React from 'react';
import { VolumeOffIcon } from './Icons';

interface MusicToggleProps {
  playing: boolean;
  onToggle: () => void;
}

const MusicToggle: React.FC<MusicToggleProps> = ({ playing, onToggle }) => {
  return (
    <button
      className="music-toggle"
      onClick={onToggle}
      aria-label={playing ? 'Pausar música' : 'Reproducir música'}
    >
      {playing ? (
        <div className="music-bars">
          <div className="music-bar" />
          <div className="music-bar" />
          <div className="music-bar" />
          <div className="music-bar" />
        </div>
      ) : (
        <VolumeOffIcon />
      )}
    </button>
  );
};

export default MusicToggle;
