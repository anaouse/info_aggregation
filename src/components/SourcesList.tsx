import { useState } from "react";
import type { SourceData } from "@/types";
import SourceItem from "@/components/SourceItem";
import ConfirmWindow from "@/components/ConfirmWindow";

interface SourcesListProps {
  sources: SourceData[];
  onDelete: (url: string) => void;
}

export default function SourcesList({ sources, onDelete }: SourcesListProps) {
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  const handleDeleteClick = (url: string) => {
    setPendingUrl(url);
    setConfirmVisible(true);
  };

  const handleConfirm = () => {
    if (pendingUrl) {
      onDelete(pendingUrl);
    }
    setConfirmVisible(false);
    setPendingUrl(null);
  };

  const handleCancel = () => {
    setConfirmVisible(false);
    setPendingUrl(null);
  };

  return (
    <>
      <div className="sources-list">
        {sources.map((source) => (
          <SourceItem
            key={source.url}
            data={source}
            onDelete={handleDeleteClick}
          />
        ))}
      </div>
      <ConfirmWindow
        visible={confirmVisible}
        message="确定要删除该信息源吗？"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
