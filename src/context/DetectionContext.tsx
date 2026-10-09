import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { DetectionLog, DetectedObject, DetectorSettings } from '../types/detection';
import { detectorService } from '../services/detector';
import { storageService } from '../services/storage';
import { soundService } from '../services/sound';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface DetectionContextType {
  // Model state
  isModelLoaded: boolean;
  isModelLoading: boolean;
  modelError: string | null;
  loadModel: () => Promise<void>;

  // Camera & Stream state
  cameraStream: MediaStream | null;
  isCameraActive: boolean;
  isDetectionPaused: boolean;
  cameraError: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  pauseDetection: () => void;
  resumeDetection: () => void;

  // Real-time inference stats
  activeDetections: DetectedObject[];
  setActiveDetections: React.Dispatch<React.SetStateAction<DetectedObject[]>>;
  fps: number;
  setFps: React.Dispatch<React.SetStateAction<number>>;
  latencyMs: number;
  setLatencyMs: React.Dispatch<React.SetStateAction<number>>;

  // Logging & Session
  logs: DetectionLog[];
  currentSessionId: string;
  sessionStartTime: string;
  resetSession: () => void;
  clearAllLogs: () => void;
  processDetections: (objects: DetectedObject[], source: 'webcam' | 'upload' | 'sample') => void;

  // Settings
  settings: DetectorSettings;
  updateSettings: (newSettings: Partial<DetectorSettings>) => void;

  // UI / Toast
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;
}

const DetectionContext = createContext<DetectionContextType | undefined>(undefined);

function generateSessionId(): string {
  return 'SES-' + Math.random().toString(36).substring(2, 7).toUpperCase() + '-' + Date.now().toString().slice(-4);
}

export const DetectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);

  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isDetectionPaused, setIsDetectionPaused] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [activeDetections, setActiveDetections] = useState<DetectedObject[]>([]);
  const [fps, setFps] = useState(0);
  const [latencyMs, setLatencyMs] = useState(0);

  const [settings, setSettings] = useState<DetectorSettings>(() => storageService.getSettings());
  const [logs, setLogs] = useState<DetectionLog[]>(() => storageService.getLogs());

  const [currentSessionId, setCurrentSessionId] = useState<string>(generateSessionId);
  const [sessionStartTime] = useState<string>(() => new Date().toISOString());

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Deduplication tracker: mapping class label -> last logged timestamp (ms)
  const lastLoggedTimesRef = useRef<Map<string, number>>(new Map());

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const loadModel = useCallback(async () => {
    if (isModelLoaded) return;
    try {
      setIsModelLoading(true);
      setModelError(null);
      await detectorService.loadModel();
      setIsModelLoaded(true);
      showToast('Computer vision model (COCO-SSD MobileNetV2) loaded successfully', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load detection model';
      setModelError(msg);
      showToast(`Model load failed: ${msg}`, 'error');
    } finally {
      setIsModelLoading(false);
    }
  }, [isModelLoaded, showToast]);

  // Preload model on mount
  useEffect(() => {
    loadModel();
  }, [loadModel]);

  // Persist logs to localStorage when logs state changes
  useEffect(() => {
    storageService.saveLogs(logs);
  }, [logs]);

  // Save settings when modified
  const updateSettings = useCallback((newSettings: Partial<DetectorSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      storageService.saveSettings(updated);
      return updated;
    });
    showToast('Detector preferences updated', 'info');
  }, [showToast]);

  const clearAllLogs = useCallback(() => {
    setLogs([]);
    storageService.clearLogs();
    lastLoggedTimesRef.current.clear();
    showToast('Detection event history cleared', 'info');
  }, [showToast]);

  const resetSession = useCallback(() => {
    const newId = generateSessionId();
    setCurrentSessionId(newId);
    lastLoggedTimesRef.current.clear();
    showToast(`Started new logging session: ${newId}`, 'info');
  }, [showToast]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }

      // Configure video constraints based on settings
      let videoConstraints: MediaTrackConstraints = {
        facingMode: settings.facingMode,
      };

      if (settings.cameraResolution === '1080p') {
        videoConstraints = { ...videoConstraints, width: { ideal: 1920 }, height: { ideal: 1080 } };
      } else if (settings.cameraResolution === '720p') {
        videoConstraints = { ...videoConstraints, width: { ideal: 1280 }, height: { ideal: 720 } };
      } else {
        videoConstraints = { ...videoConstraints, width: { ideal: 640 }, height: { ideal: 480 } };
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false,
      });

      setCameraStream(stream);
      setIsCameraActive(true);
      setIsDetectionPaused(false);
      showToast('Camera stream active. Realtime inference running.', 'success');
    } catch (err: unknown) {
      let errorMsg = 'Failed to access camera';
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMsg = 'Camera permission was denied. Please allow camera access in your browser address bar.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          errorMsg = 'No camera device found on your system. You can test detection via the Image Upload tab!';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          errorMsg = 'Camera is already in use by another application or tab.';
        } else if (err.name === 'OverconstrainedError') {
          errorMsg = 'Requested camera resolution is not supported by your hardware.';
        }
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      setCameraError(errorMsg);
      setIsCameraActive(false);
      showToast(errorMsg, 'error');
    }
  }, [cameraStream, settings.cameraResolution, settings.facingMode, showToast]);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => {
        track.stop();
      });
      setCameraStream(null);
    }
    setIsCameraActive(false);
    setIsDetectionPaused(false);
    setActiveDetections([]);
    setFps(0);
    setLatencyMs(0);
    showToast('Camera stopped and video tracks released.', 'info');
  }, [cameraStream, showToast]);

  const pauseDetection = useCallback(() => {
    setIsDetectionPaused(true);
    showToast('Realtime inference paused.', 'info');
  }, [showToast]);

  const resumeDetection = useCallback(() => {
    setIsDetectionPaused(false);
    showToast('Realtime inference resumed.', 'info');
  }, [showToast]);

  // Deduplication and structured logging processor
  const processDetections = useCallback((
    objects: DetectedObject[],
    source: 'webcam' | 'upload' | 'sample'
  ) => {
    const now = Date.now();
    const cooldownMs = settings.cooldownSeconds * 1000;
    const newLogsToAppend: DetectionLog[] = [];

    objects.forEach(obj => {
      // Check confidence threshold
      if (obj.score < settings.minConfidence) return;

      // Check class filter if configured
      if (settings.classFilters.length > 0 && !settings.classFilters.includes(obj.class)) {
        return;
      }

      // Check per-class cooldown for webcam source to prevent duplicate flood
      if (source === 'webcam') {
        const lastLoggedTime = lastLoggedTimesRef.current.get(obj.class) || 0;
        if (now - lastLoggedTime < cooldownMs) {
          return; // Skip logging duplicate within cooldown period
        }
        lastLoggedTimesRef.current.set(obj.class, now);
      }

      const logItem: DetectionLog = {
        id: 'EVT-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + now.toString().slice(-4),
        label: obj.class,
        confidence: Number(obj.score.toFixed(3)),
        timestamp: new Date().toISOString(),
        sessionId: currentSessionId,
        source,
        bbox: obj.bbox,
      };

      newLogsToAppend.push(logItem);

      if (settings.enableSoundAlerts) {
        soundService.playDetectionBeep();
      }
    });

    if (newLogsToAppend.length > 0) {
      setLogs(prev => [...newLogsToAppend, ...prev]);
    }
  }, [settings, currentSessionId]);

  // Clean up media tracks on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  return (
    <DetectionContext.Provider
      value={{
        isModelLoaded,
        isModelLoading,
        modelError,
        loadModel,

        cameraStream,
        isCameraActive,
        isDetectionPaused,
        cameraError,
        startCamera,
        stopCamera,
        pauseDetection,
        resumeDetection,

        activeDetections,
        setActiveDetections,
        fps,
        setFps,
        latencyMs,
        setLatencyMs,

        logs,
        currentSessionId,
        sessionStartTime,
        resetSession,
        clearAllLogs,
        processDetections,

        settings,
        updateSettings,

        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </DetectionContext.Provider>
  );
};

export const useDetection = (): DetectionContextType => {
  const context = useContext(DetectionContext);
  if (!context) {
    throw new Error('useDetection must be used within a DetectionProvider');
  }
  return context;
};
