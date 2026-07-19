import { useMusicPlayer } from "@/contexts/MusicPlayerContext";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export default function MusicPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackMode,
    togglePlay,
    playPrevious,
    playNext,
    seekTo,
    setVolume,
    setPlaybackMode,
    playFavorites,
  } = useMusicPlayer();

  return (
    <section className="music-player">
      <div className="music-player-song-info">
        <div className="music-player-song-name">{currentSong?.name || "尚未选择歌曲"}</div>
        <div className="music-player-album-name">{currentSong ? `来自专辑：${currentSong.album_name}` : "请选择一个专辑播放"}</div>
      </div>
      <div className="music-player-actions">
        <div className="music-player-controls">
          <button onClick={playPrevious} disabled={!currentSong} aria-label="上一首">⏮</button>
          <button onClick={togglePlay} disabled={!currentSong} aria-label={isPlaying ? "暂停" : "播放"}>
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button onClick={playNext} disabled={!currentSong} aria-label="下一首">⏭</button>
          <button
            className={playbackMode === "shuffle" ? "music-player-mode active" : "music-player-mode"}
            onClick={() => setPlaybackMode(playbackMode === "shuffle" ? "sequential" : "shuffle")}
          >
            {playbackMode === "shuffle" ? "随机播放" : "顺序播放"}
          </button>
          <button className="music-player-heart-mode" onClick={playFavorites}>心动模式</button>
        </div>
        <div className="music-player-volume">
          <span>音量</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            aria-label="音量"
            onChange={(event) => setVolume(Number(event.target.value))}
          />
          <span>{Math.round(volume * 100)}%</span>
        </div>
      </div>
      <div className="music-player-progress">
        <span>{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={Math.min(currentTime, duration || 0)}
          disabled={!currentSong || !duration}
          onChange={(event) => seekTo(Number(event.target.value))}
        />
        <span>{formatTime(duration)}</span>
      </div>
    </section>
  );
}
