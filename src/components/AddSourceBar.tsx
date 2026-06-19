interface AddSourceBarProps {
  name: string;
  url: string;
  onNameChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onAdd: () => void;
}

export default function AddSourceBar({
  name,
  url,
  onNameChange,
  onUrlChange,
  onAdd,
}: AddSourceBarProps) {
  return (
    <div className="add-source-bar">
      <input
        type="text"
        placeholder="信息源名称"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
      />
      <input
        type="text"
        placeholder="URL"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
      />
      <button onClick={onAdd}>添加</button>
    </div>
  );
}
