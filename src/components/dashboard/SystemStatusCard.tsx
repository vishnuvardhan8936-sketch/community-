import React from 'react';
import { useDetection } from '../../context/DetectionContext';
import { Camera, Cpu, Zap, HardDrive } from 'lucide-react';

export const SystemStatusCard: React.FC = () => {
  const {
    isModelLoaded,
    isCameraActive,
    cameraError,
    fps,
    latencyMs,
    logs,
    currentSessionId,
  } = useDetection();

  return (
    <div className="card-panel">
      <div className="card-panel-header">
        <h3 className="card-panel-title">
          <Cpu size={18} color="#2563eb" />
          <span>System & Hardware Readiness</span>
        </h3>
        <span className="badge badge-blue">Edge Engine</span>
      </div>
      <div className="card-panel-body" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {/* Camera Status */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '8px',
                backgroundColor: isCameraActive ? '#eff6ff' : '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isCameraActive ? '#2563eb' : '#64748b',
                flexShrink: 0,
              }}
            >
              <Camera size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>WEBCAM SENSOR</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.15rem' }}>
                {isCameraActive ? 'Active & Streaming' : cameraError ? 'Access Denied / Offline' : 'Standby'}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                {isCameraActive ? `${fps} FPS Target` : 'Click Start Camera to initialize'}
              </div>
            </div>
          </div>

          {/* Model Detector Status */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '8px',
                backgroundColor: isModelLoaded ? '#f0fdf4' : '#fffbeb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isModelLoaded ? '#16a34a' : '#d97706',
                flexShrink: 0,
              }}
            >
              <Cpu size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>CV DETECTOR</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.15rem' }}>
                {isModelLoaded ? 'COCO-SSD (Loaded)' : 'Loading Weights...'}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                80 Classes • MobileNetV2
              </div>
            </div>
          </div>

          {/* Latency & Processing */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '8px',
                backgroundColor: '#f0fdfa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0d9488',
                flexShrink: 0,
              }}
            >
              <Zap size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>INFERENCE LATENCY</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.15rem' }}>
                {isCameraActive && latencyMs > 0 ? `${latencyMs} ms / frame` : '< 45 ms typical'}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                Hardware Accelerated (WebGL)
              </div>
            </div>
          </div>

          {/* Local Storage & Session */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '8px',
                backgroundColor: '#f5f3ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7c3aed',
                flexShrink: 0,
              }}
            >
              <HardDrive size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>AUDIT STORAGE</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.15rem' }}>
                {logs.length} Logged Events
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                Session: {currentSessionId}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
