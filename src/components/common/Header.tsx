import React from 'react';
import { useDetection } from '../../context/DetectionContext';
import { Camera, RotateCcw, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ViewTab } from '../../types/detection';

interface HeaderProps {
  currentTab: ViewTab;
  onNavigateTab: (tab: ViewTab) => void;
}

const TAB_TITLES: Record<ViewTab, string> = {
  dashboard: 'Executive Dashboard',
  live: 'Real-Time Camera Detection',
  logs: 'Structured Detection Logs',
  analytics: 'Computer Vision Analytics',
  'image-test': 'Image Upload & Model Testing',
  settings: 'System Configuration & About',
};

export const Header: React.FC<HeaderProps> = ({ currentTab, onNavigateTab }) => {
  const {
    isModelLoaded,
    isModelLoading,
    modelError,
    isCameraActive,
    currentSessionId,
    resetSession,
  } = useDetection();

  return (
    <header className="top-header">
      <div className="header-left">
        <h2 className="header-title">{TAB_TITLES[currentTab]}</h2>
      </div>

      <div className="header-right">
        {/* Model Ready Badge */}
        {isModelLoading ? (
          <div className="header-status-pill warning">
            <Cpu size={14} className="animate-spin" />
            <span>Loading Weights...</span>
          </div>
        ) : modelError ? (
          <div className="header-status-pill warning" title={modelError}>
            <AlertCircle size={14} color="#ef4444" />
            <span>Model Error</span>
          </div>
        ) : isModelLoaded ? (
          <div className="header-status-pill">
            <CheckCircle2 size={14} color="#16a34a" />
            <span>COCO-SSD Ready</span>
          </div>
        ) : null}

        {/* Live Camera Status */}
        {isCameraActive ? (
          <div className="header-status-pill" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe', color: '#1d4ed8' }}>
            <span className="live-indicator" />
            <span>Feed Active</span>
          </div>
        ) : (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigateTab('live')}
            title="Switch to camera view"
          >
            <Camera size={14} />
            <span>Open Camera</span>
          </button>
        )}

        {/* Session ID Badge */}
        <div className="header-session-tag" title="Active Logging Session ID">
          <span>{currentSessionId}</span>
        </div>

        {/* Session Reset Button */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={resetSession}
          title="Start a new session ID"
        >
          <RotateCcw size={13} />
          <span>New Session</span>
        </button>
      </div>
    </header>
  );
};
