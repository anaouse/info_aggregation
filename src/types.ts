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

export interface AssetItem {
  name: string;
  amount: number;
}

export interface AssetSnapshot {
  id: number;
  assets_snapshot_date: string;
  assets: AssetItem[];
  total: number | null;
  created_at: string;
  updated_at: string;
}

export interface AnimeScanRequest {
  rootPath: string;
}

export interface AnimeInfo {
  name: string;
  folder_path: string;
  cover_path: string;
  video_count: number;
}

export interface AnimeScanResponse {
  animes: AnimeInfo[];
}
