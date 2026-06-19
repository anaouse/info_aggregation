interface ConfirmWindowProps {
  visible: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmWindow({
  visible,
  message,
  onConfirm,
  onCancel,
}: ConfirmWindowProps) {
  if (!visible) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-window" onClick={(e) => e.stopPropagation()}>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="confirm-cancel-btn" onClick={onCancel}>
            取消
          </button>
          <button className="confirm-danger-btn" onClick={onConfirm}>
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
}
