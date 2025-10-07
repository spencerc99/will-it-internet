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

const audioFiles = audioFilesData as Array<{ path: string; name: string; date?: string }>;

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
  };

  const selectTrack = (index: number) => {
    setCurrentTrack(index);
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Error playing audio:", err);
        setIsPlaying(false);
      });
    }
  };

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(err => {
        console.error("Error playing audio:", err);
        setIsPlaying(false);
      });
    }
  }, [currentTrack, isPlaying]);


  return (
    <div className="cd-player">
      <div className="cd-player-outer">
        <div className="cd-player-inner">
          <div className="player-title">
            dakka to dakka
          </div>

          <div className="display-screen">
            <div className="now-playing-header">
              <div className="track-info">
                <div className="track-number">
                  {audioFiles[currentTrack].name}
                </div>
                <div className="date-display">
                  {audioFiles[currentTrack].date || "Unknown date"}
                </div>
              </div>
              <div className="page-counter">
                {currentTrack + 1}/{totalTracks}
              </div>
            </div>

            <div className="track-list">
              {audioFiles.map((track, index) => (
                <div
                  key={index}
                  className={`track-item ${index === currentTrack ? 'active' : ''}`}
                  onClick={() => selectTrack(index)}
                >
                  <span className="track-index">{index + 1}</span>
                  <div className="track-details">
                    <div className="track-name-container">
                      <span className="track-name">
                        {track.name}
                      </span>
                      {track.date && (
                        <span className="track-date">
                          {(() => {
                            const match = track.date.match(/(\d+):(\d+)(AM|PM)\s+(\w+)\s+(\d+),\s+(\d+)/);
                            if (match) {
                              const [_, hour, min, ampm, month, day, year] = match;
                              const months: Record<string, string> = {
                                'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
                                'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
                                'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
                              };
                              return `${months[month]}/${day.padStart(2, '0')}/${year.slice(-2)}`;
                            }
                            return track.date;
                          })()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
