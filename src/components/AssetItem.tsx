interface AssetItemProps {
  name: string;
  amount: number;
  index: number;
  onDelete: (index: number) => void;
  onChange: (index: number, name: string, amount: number) => void;
}

export default function AssetItem({ name, amount, index, onDelete, onChange }: AssetItemProps) {
  return (
    <div className="asset-item">
      <input
        type="text"
        className="asset-item-name"
        placeholder="资产名称"
        value={name}
        onChange={(e) => onChange(index, e.target.value, amount)}
      />
      <input
        type="number"
        className="asset-item-amount"
        placeholder="数量"
        value={amount || ""}
        onChange={(e) => onChange(index, name, parseFloat(e.target.value) || 0)}
      />
      <button
        className="asset-item-delete"
        onClick={() => onDelete(index)}
      >
        删除
      </button>
    </div>
  );
}
