import type { SourceData } from "@/types";

interface SourceItemProps {
  data: SourceData;
  onDelete: (url: string) => void;
}

export default function SourceItem({ data, onDelete }: SourceItemProps) {
  const { source_name, url } = data;

  return (
    <div className="source-item">
      <span className="source-item-name">{source_name}</span>
      <a
        className="source-item-url"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {url}
      </a>
      <button className="source-item-delete-btn" onClick={() => onDelete(url)}>
        删除
      </button>
    </div>
  );
}
