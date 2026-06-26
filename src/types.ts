export interface SourceData {
  source_name: string;
  url: string;
}

export interface PredictionData {
  id: number;
  text: string;
  done: number;
  updated_at: string;
  created_at: string;
}
