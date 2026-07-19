import { useMemo, useState } from "react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";

export default function MusicPlaylist() {
  const { playlist, currentIndex, playSongAt, toggleFavorite, isFavorite } = useMusicPlayer();
  const [keyword, setKeyword] = useState("");

  const filteredSongs = useMemo(
    () => playlist
      .map((song, index) => ({ song, index }))
      .filter(({ song }) => song.name.toLowerCase().includes(keyword.trim().toLowerCase())),
    [playlist, keyword],
  );

  const handlePlaySong = (index: number) => {
    setKeyword("");
    playSongAt(index);
  };

  return (
    <section className="music-playlist">
      <div className="music-playlist-heading">
        <h2>当前播放列表</h2>
        <input
          type="search"
          placeholder="按歌曲名称搜索"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
      </div>
      {playlist.length === 0 ? (
        <div className="music-playlist-empty">播放列表为空，请从下方选择专辑。</div>
      ) : filteredSongs.length === 0 ? (
        <div className="music-playlist-empty">没有匹配的歌曲。</div>
      ) : (
        <div className="music-playlist-items">
          {filteredSongs.map(({ song, index }) => (
            <div
              key={song.path}
              className={index === currentIndex ? "music-playlist-item active" : "music-playlist-item"}
            >
              <button className="music-playlist-play" onClick={() => handlePlaySong(index)}>
                <span className="music-playlist-index">{index + 1}</span>
                <span className="music-playlist-song">
                  <span>{song.name}</span>
                  <small>{song.album_name}</small>
                </span>
              </button>
              <button
                className={isFavorite(song) ? "music-playlist-favorite active" : "music-playlist-favorite"}
                onClick={() => toggleFavorite(song)}
                aria-label={isFavorite(song) ? "取消最爱" : "加入最爱"}
                title={isFavorite(song) ? "取消最爱" : "加入最爱"}
              >
                {isFavorite(song) ? "♥" : "♡"}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
