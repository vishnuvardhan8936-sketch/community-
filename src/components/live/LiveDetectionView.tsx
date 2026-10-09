import React from 'react';
import { CameraCanvas } from './CameraCanvas';
import { DetectionControls } from './DetectionControls';
import { ActiveObjectsList } from './ActiveObjectsList';
import { useDetection } from '../../context/DetectionContext';
import { ShieldCheck } from 'lucide-react';

export const LiveDetectionView: React.FC = () => {
  const { isCameraActive, fps, latencyMs } = useDetection();

  return (
    <div className="animate-fade-in">
      <div className="view-heading">
        <div>
          <h2>Real-Time Laptop Webcam Inference</h2>
          <p>Continuous edge object detection via WebGL hardware acceleration & COCO-SSD</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="badge badge-green">
            <ShieldCheck size={14} />
            <span>Secure In-Browser Execution</span>
          </div>
        </div>
      </div>

      <div className="camera-workspace">
        {/* Left Column: Video & Canvas */}
        <div>
          <div style={{ position: 'relative' }}>
            <CameraCanvas />

            {/* Live Telemetry Floating Badge on Video */}
            {isCameraActive && (
              <div className="camera-telemetry-badge">
                <div className="camera-telemetry-item">
                  <span className="live-indicator" />
                  <span style={{ color: '#16a34a' }}>STREAM LIVE</span>
                </div>
                <div className="camera-telemetry-item">
                  <span style={{ color: 'var(--text-muted)' }}>FPS:</span>
                  <span style={{ color: '#2563eb' }}>{fps}</span>
                </div>
                <div className="camera-telemetry-item">
                  <span style={{ color: 'var(--text-muted)' }}>INFERENCE:</span>
                  <span style={{ color: '#0d9488' }}>{latencyMs}ms</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Objects & Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ActiveObjectsList />
          <DetectionControls />
        </div>
      </div>
    </div>
  );
};
