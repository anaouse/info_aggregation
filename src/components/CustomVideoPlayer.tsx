import { useEffect, useRef, useState } from "react";
import type { VideoFile } from "@/types";
import EpisodeSelector from "./EpisodeSelector";

interface CustomVideoPlayerProps {
  videoUrl: string | null;
  videos: VideoFile[];
  currentPath: string | null;
  onVideoSelect: (video: VideoFile) => void;
  autoPlay?: boolean;
}

export default function CustomVideoPlayer({
  videoUrl,
  videos,
  currentPath,
  onVideoSelect,
  autoPlay = false,
}: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number>();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true); // Start with controls visible
  const [showEpisodeSelector, setShowEpisodeSelector] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  // Seek video
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    videoRef.current.currentTime = percentage * duration;
  };

  // Skip forward/backward
  const skip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(duration, videoRef.current.currentTime + seconds)
    );
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Auto-hide controls after 3 seconds
  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showEpisodeSelector) return; // Disable shortcuts when selector is open
      
      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skip(-5);
          break;
        case "ArrowRight":
          e.preventDefault();
          skip(5);
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, duration, showEpisodeSelector]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [videoUrl]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Auto-hide controls timeout cleanup
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Reset controls timeout when playing state changes
  useEffect(() => {
    resetControlsTimeout();
  }, [isPlaying]);

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="custom-video-player"
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {videoUrl ? (
        <>
          <video
            ref={videoRef}
            src={videoUrl}
            className="custom-video-player-video"
            autoPlay={autoPlay}
            onClick={togglePlay}
          />

          {/* Controls */}
          <div className={`custom-video-player-controls${showControls ? " show" : ""}`}>
            {/* Progress bar */}
            <div
              ref={progressBarRef}
              className="custom-video-player-progress"
              onClick={handleProgressClick}
            >
              <div
                className="custom-video-player-progress-filled"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Control buttons */}
            <div className="custom-video-player-buttons">
              {/* Left side: play/pause, skip buttons, time */}
              <div className="custom-video-player-buttons-left">
                <button
                  className="custom-video-player-btn"
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? "⏸" : "▶"}
                </button>

                <button
                  className="custom-video-player-btn"
                  onClick={() => skip(-5)}
                  aria-label="Rewind 5 seconds"
                >
                  ← 5s
                </button>

                <button
                  className="custom-video-player-btn"
                  onClick={() => skip(5)}
                  aria-label="Forward 5 seconds"
                >
                  5s →
                </button>

                <span className="custom-video-player-time">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Right side: episode selector, fullscreen */}
              <div className="custom-video-player-buttons-right">
                <button
                  className="custom-video-player-btn custom-video-player-btn-episodes"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEpisodeSelector(true);
                  }}
                  aria-label="Select episode"
                >
                  选集
                </button>

                <button
                  className="custom-video-player-btn"
                  onClick={toggleFullscreen}
                  aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? "⛶" : "⛶"}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="custom-video-player-placeholder">
          <p>请选择视频</p>
          <button
            className="custom-video-player-placeholder-btn"
            onClick={() => setShowEpisodeSelector(true)}
          >
            打开选集
          </button>
        </div>
      )}

      {/* Episode selector: always rendered so it works even before a video is selected */}
      {showEpisodeSelector && (
        <EpisodeSelector
          videos={videos}
          currentPath={currentPath}
          onSelect={onVideoSelect}
          onClose={() => setShowEpisodeSelector(false)}
        />
      )}
    </div>
  );
}
