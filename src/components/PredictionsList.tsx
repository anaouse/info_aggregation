import type { PredictionData } from "@/types";
import PredictionItem from "@/components/PredictionItem";

interface PredictionsListProps {
  predictions: PredictionData[];
  onUpdate: (updated: PredictionData) => void;
}

export default function PredictionsList({ predictions, onUpdate }: PredictionsListProps) {
  return (
    <div className="predictions-list">
      {predictions.map((p) => (
        <PredictionItem key={p.id} data={p} onUpdate={onUpdate} />
      ))}
    </div>
  );
}
