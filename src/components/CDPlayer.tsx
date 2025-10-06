import { useState, useRef, useEffect } from "react";
import "./CDPlayer.scss";
import audioFilesData from "../audioFiles.json";

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
  </svg>
);

const PreviousIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
  </svg>
);

const NextIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 18l8.5-6L6 6v12zm10-12v12h2V6h-2z" />
  </svg>
);

const audioFiles = audioFilesData as Array<{ path: string; name: string }>;

export function CDPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [totalTracks] = useState(audioFiles.length);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current && audioFiles.length > 0) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  const playPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    const next = (currentTrack + 1) % audioFiles.length;
    setCurrentTrack(next);
    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  };

  const previousTrack = () => {
    const prev = currentTrack === 0 ? audioFiles.length - 1 : currentTrack - 1;
    setCurrentTrack(prev);
    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  };

  const handleTrackEnd = () => {
    const next = (currentTrack + 1) % audioFiles.length;
    setCurrentTrack(next);
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.play();
    }
  };

  return (
    <div className="cd-player">
      <div className="cd-player-outer">
        <div className="cd-player-inner">
          <div className="player-title">
            dakka to dakka
          </div>

          <div className="display-screen">
            <div className="track-info">
              <div className="track-number">
                {audioFiles[currentTrack].name}
              </div>
              <div className="date-display">11:25AM Aug 22, 2025</div>
            </div>
            <div className="page-counter">
              {currentTrack + 1}/{totalTracks}
            </div>
          </div>

          <div className="cd-disc">
            <div className={`cd-spin ${isPlaying ? "spinning" : ""}`}>
              <div className="cd-center"></div>
              <div className="cd-reflection"></div>
            </div>
          </div>

          <div className="controls">
            <button
              onClick={previousTrack}
              className="control-btn prev-btn"
              aria-label="Previous track"
            >
              <PreviousIcon />
            </button>
            <button
              onClick={playPause}
              className="control-btn play-btn"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button
              onClick={nextTrack}
              className="control-btn next-btn"
              aria-label="Next track"
            >
              <NextIcon />
            </button>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={audioFiles[currentTrack].path}
        onEnded={handleTrackEnd}
      />
    </div>
  );
}
