import type { SubtitleFile } from "@/types";

interface SubtitleSelectorProps {
  subtitles: SubtitleFile[];
  activePath?: string | null;
  onSelect: (subtitle: SubtitleFile) => void;
  onClose: () => void;
}

export default function SubtitleSelector({
  subtitles,
  activePath,
  onSelect,
  onClose,
}: SubtitleSelectorProps) {
  const handleSelect = (subtitle: SubtitleFile) => {
    onSelect(subtitle);
    onClose();
  };

  return (
    <div className="subtitle-selector-overlay" onClick={onClose}>
      <div className="subtitle-selector" onClick={(e) => e.stopPropagation()}>
        <div className="subtitle-selector-header">
          <h3 className="subtitle-selector-title">字幕</h3>
          <button
            className="subtitle-selector-close"
            onClick={onClose}
            aria-label="Close subtitle selector"
          >
            ✕
          </button>
        </div>

        <div className="subtitle-selector-list">
          {subtitles.length === 0 ? (
            <div className="subtitle-selector-empty">未找到字幕文件</div>
          ) : (
            subtitles.map((subtitle, index) => (
              <div
                key={subtitle.path}
                className={`subtitle-selector-item${
                  subtitle.path === activePath ? " active" : ""
                }`}
                onClick={() => handleSelect(subtitle)}
              >
                <span className="subtitle-selector-item-number">{index + 1}</span>
                <span className="subtitle-selector-item-name">{subtitle.name}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
