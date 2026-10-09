import type { DetectionLog, DetectorSettings } from '../types/detection';

const LOGS_STORAGE_KEY = 'visionpulse_detection_logs_v1';
const SETTINGS_STORAGE_KEY = 'visionpulse_settings_v1';

export const DEFAULT_SETTINGS: DetectorSettings = {
  minConfidence: 0.5,
  maxObjects: 15,
  classFilters: [],
  showBoxes: true,
  showLabels: true,
  showConfidence: true,
  cooldownSeconds: 2.5,
  enableSoundAlerts: false,
  cameraResolution: 'default',
  facingMode: 'user',
};

export const storageService = {
  getLogs(): DetectionLog[] {
    try {
      const data = localStorage.getItem(LOGS_STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load detection logs from localStorage', e);
      return [];
    }
  },

  saveLogs(logs: DetectionLog[]): void {
    try {
      // Store up to 2000 most recent logs to prevent local storage quota overflow
      const trimmed = logs.slice(0, 2000);
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.error('Failed to save detection logs to localStorage', e);
    }
  },

  clearLogs(): void {
    try {
      localStorage.removeItem(LOGS_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear logs from localStorage', e);
    }
  },

  getSettings(): DetectorSettings {
    try {
      const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: DetectorSettings): void {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  },

  exportLogsToCSV(logs: DetectionLog[], filename = 'detection_logs.csv'): void {
    if (logs.length === 0) {
      alert('No logs available to export.');
      return;
    }

    const headers = ['Event ID', 'Object Class', 'Confidence %', 'Timestamp', 'Session ID', 'Source', 'Bounding Box [x,y,w,h]'];
    const rows = logs.map(log => {
      const bboxStr = log.bbox ? `"[${log.bbox.map(n => Math.round(n)).join(', ')}]"` : '""';
      return [
        `"${log.id}"`,
        `"${log.label}"`,
        `"${(log.confidence * 100).toFixed(1)}%"`,
        `"${new Date(log.timestamp).toISOString()}"`,
        `"${log.sessionId}"`,
        `"${log.source}"`,
        bboxStr
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  exportSessionReport(logs: DetectionLog[], sessionId: string): void {
    const sessionLogs = logs.filter(l => l.sessionId === sessionId);
    const uniqueClasses = Array.from(new Set(sessionLogs.map(l => l.label)));
    const avgConfidence = sessionLogs.length > 0
      ? (sessionLogs.reduce((acc, curr) => acc + curr.confidence, 0) / sessionLogs.length * 100).toFixed(1)
      : '0.0';

    const classDistribution: Record<string, number> = {};
    sessionLogs.forEach(l => {
      classDistribution[l.label] = (classDistribution[l.label] || 0) + 1;
    });

    const report = {
      reportTitle: 'VisionPulse Realtime Object Detection Session Report',
      generatedAt: new Date().toISOString(),
      sessionId,
      summary: {
        totalDetections: sessionLogs.length,
        uniqueCategoriesCount: uniqueClasses.length,
        uniqueCategoriesList: uniqueClasses,
        averageConfidencePercentage: `${avgConfidence}%`,
      },
      categoryFrequencies: classDistribution,
      rawEventsCount: sessionLogs.length,
      sampleEvents: sessionLogs.slice(0, 50),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `session_report_${sessionId}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
