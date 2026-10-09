export interface DetectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectedObject {
  id: string;
  class: string;
  score: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
  color?: string;
}

export interface DetectionLog {
  id: string;
  label: string;
  confidence: number; // 0 to 1
  timestamp: string; // ISO string
  sessionId: string;
  source: 'webcam' | 'upload' | 'sample';
  bbox?: [number, number, number, number];
  snapshot?: string; // Optional thumbnail data URL
}

export interface SessionStats {
  sessionId: string;
  startTime: string;
  endTime?: string;
  totalDetections: number;
  uniqueClasses: string[];
  avgConfidence: number;
}

export interface DetectorSettings {
  minConfidence: number; // e.g. 0.50
  maxObjects: number; // e.g. 20
  classFilters: string[]; // enabled class names (empty means all)
  showBoxes: boolean;
  showLabels: boolean;
  showConfidence: boolean;
  cooldownSeconds: number; // deduplication cooldown per class in seconds
  enableSoundAlerts: boolean;
  cameraResolution: 'default' | '720p' | '1080p';
  facingMode: 'user' | 'environment';
}

export type ViewTab = 'dashboard' | 'live' | 'logs' | 'analytics' | 'image-test' | 'settings';
