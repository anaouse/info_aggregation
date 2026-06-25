import { useRef, type KeyboardEvent } from "react";

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
  const nameRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    const cursorPos = target.selectionStart ?? 0;

    if (e.key === "Enter") {
      onAdd();
      return;
    }

    if (e.key === "ArrowRight" && cursorPos === target.value.length) {
      // 末尾按右箭头：名称 → URL 开头，URL → 名称开头
      if (target === nameRef.current) {
        urlRef.current?.focus();
        urlRef.current?.setSelectionRange(0, 0);
      } else {
        nameRef.current?.focus();
        nameRef.current?.setSelectionRange(0, 0);
      }
      return;
    }

    if (e.key === "ArrowLeft" && cursorPos === 0) {
      // 开头按左箭头：名称 → URL 末尾，URL → 名称末尾
      if (target === nameRef.current) {
        urlRef.current?.focus();
        urlRef.current?.setSelectionRange(urlRef.current.value.length, urlRef.current.value.length);
      } else {
        nameRef.current?.focus();
        nameRef.current?.setSelectionRange(nameRef.current.value.length, nameRef.current.value.length);
      }
      return;
    }
  };

  return (
    <div className="add-source-bar">
      <input
        ref={nameRef}
        type="text"
        placeholder="信息源名称"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <input
        ref={urlRef}
        type="text"
        placeholder="URL"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button onClick={onAdd}>添加</button>
    </div>
  );
}
