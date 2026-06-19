export interface SourceData {
  source_name: string;
  url: string;
}

interface SourceProps {
  data: SourceData;
  onDelete: (url: string) => void;
}

export default function Source({ data, onDelete }: SourceProps) {
  const { source_name, url } = data;

  return (
    <div className="source-card">
      <h2 className="source-name">{source_name}</h2>
      <a className="source-url" href={url} target="_blank" rel="noopener noreferrer">
        {url}
      </a>
      <button className="source-delete-btn" onClick={() => onDelete(url)}>
        删除
      </button>
    </div>
  );
}
