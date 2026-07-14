import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { PlaylistSong } from "@/types";

const API_BASE = "http://localhost:1233";

type PlaybackMode = "sequential" | "shuffle";

interface MusicPlayerContextValue {
  playlist: PlaylistSong[];
  currentIndex: number;
  currentSong: PlaylistSong | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackMode: PlaybackMode;
  playAlbum: (songs: PlaylistSong[]) => void;
  playSongAt: (index: number) => void;
  togglePlay: () => void;
  playPrevious: () => void;
  playNext: () => void;
  seekTo: (time: number) => void;
  setPlaybackMode: (mode: PlaybackMode) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null);

interface MusicPlayerProviderProps {
  children: ReactNode;
}

function shuffleSongs(songs: PlaylistSong[]): PlaylistSong[] {
  const shuffled = [...songs];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function MusicPlayerProvider({ children }: MusicPlayerProviderProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playlist, setPlaylist] = useState<PlaylistSong[]>([]);
  const [originalPlaylist, setOriginalPlaylist] = useState<PlaylistSong[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackMode, setPlaybackModeState] = useState<PlaybackMode>("sequential");

  const currentSong = currentIndex >= 0 ? playlist[currentIndex] ?? null : null;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) {
      return;
    }

    audio.src = `${API_BASE}/api/music/audio?path=${encodeURIComponent(currentSong.path)}`;
    audio.load();
    setCurrentTime(0);
    setDuration(0);

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
  }, [currentSong?.path]);

  const playAlbum = (songs: PlaylistSong[]) => {
    if (songs.length === 0) {
      return;
    }
    const nextPlaylist = playbackMode === "shuffle" ? shuffleSongs(songs) : songs;
    setOriginalPlaylist(songs);
    setPlaylist(nextPlaylist);
    setCurrentIndex(0);
    setIsPlaying(true);
  };

  const playSongAt = (index: number) => {
    if (!playlist[index]) {
      return;
    }
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !currentSong) {
      return;
    }
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  };

  const playPrevious = () => {
    if (playlist.length === 0) {
      return;
    }
    setCurrentIndex((index) => (index <= 0 ? playlist.length - 1 : index - 1));
    setIsPlaying(true);
  };

  const playNext = () => {
    if (playlist.length === 0) {
      return;
    }
    setCurrentIndex((index) => (index >= playlist.length - 1 ? 0 : index + 1));
    setIsPlaying(true);
  };

  const seekTo = (time: number) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const setPlaybackMode = (mode: PlaybackMode) => {
    if (mode === playbackMode) {
      return;
    }
    setPlaybackModeState(mode);

    if (mode === "shuffle" && currentSong) {
      setPlaylist([currentSong, ...shuffleSongs(playlist.filter((_, index) => index !== currentIndex))]);
      setCurrentIndex(0);
      return;
    }

    if (mode === "sequential" && currentSong) {
      const restoredIndex = originalPlaylist.findIndex((song) => song.path === currentSong.path);
      setPlaylist(originalPlaylist);
      setCurrentIndex(restoredIndex);
    }
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        playlist,
        currentIndex,
        currentSong,
        isPlaying,
        currentTime,
        duration,
        playbackMode,
        playAlbum,
        playSongAt,
        togglePlay,
        playPrevious,
        playNext,
        seekTo,
        setPlaybackMode,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={playNext}
      />
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error("useMusicPlayer must be used within MusicPlayerProvider");
  }
  return context;
}
