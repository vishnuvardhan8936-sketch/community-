import React from 'react';
import { useDetection } from '../../context/DetectionContext';
import { getClassColor } from '../../services/cocoClasses';
import { Sparkles, Camera, Shield } from 'lucide-react';

export const ActiveObjectsList: React.FC = () => {
  const {
    activeDetections,
    isCameraActive,
    fps,
    latencyMs,
    showToast,
  } = useDetection();

  const handleCaptureSnapshot = () => {
    // Explicit user action to download frame capture
    const video = document.querySelector('video') as HTMLVideoElement | null;
    const overlayCanvas = document.querySelector('.overlay-canvas') as HTMLCanvasElement | null;

    if (!video || !isCameraActive || video.videoWidth === 0) {
      showToast('Camera feed must be active to capture a snapshot.', 'warning');
      return;
    }

    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;
    const ctx = captureCanvas.getContext('2d');

    if (!ctx) return;

    // Draw video frame
    ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);

    // Draw overlay canvas if present
    if (overlayCanvas) {
      ctx.drawImage(overlayCanvas, 0, 0, captureCanvas.width, captureCanvas.height);
    }

    // Add watermark
    ctx.font = '600 14px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(`VisionPulse AI • ${new Date().toLocaleString()}`, 16, captureCanvas.height - 16);

    const dataUrl = captureCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `detection_capture_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();

    showToast('Snapshot captured and downloaded to your device.', 'success');
  };

  return (
    <div className="card-panel">
      <div className="card-panel-header">
        <h3 className="card-panel-title">
          <Sparkles size={18} color="#2563eb" />
          <span>Active Detections</span>
        </h3>
        <span className="badge badge-blue">
          {activeDetections.length} {activeDetections.length === 1 ? 'Object' : 'Objects'}
        </span>
      </div>

      <div className="card-panel-body" style={{ padding: '1.25rem' }}>
        {/* Telemetry quick bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.6rem 0.8rem',
            backgroundColor: '#f8fafc',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.78rem',
            fontFamily: 'JetBrains Mono',
          }}
        >
          <div>
            <span style={{ color: 'var(--text-muted)' }}>FPS: </span>
            <span style={{ fontWeight: 700, color: isCameraActive ? '#16a34a' : 'var(--text-muted)' }}>
              {isCameraActive ? fps : 0}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Latency: </span>
            <span style={{ fontWeight: 700, color: '#0d9488' }}>
              {isCameraActive ? `${latencyMs}ms` : '--'}
            </span>
          </div>
        </div>

        {/* Live Objects Pills */}
        {activeDetections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '0.84rem' }}>
              {isCameraActive
                ? 'No objects currently detected above confidence threshold.'
                : 'Turn on camera to see live detected objects here.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 220, overflowY: 'auto' }}>
            {activeDetections.map((obj, i) => {
              const color = getClassColor(obj.class);
              return (
                <div
                  key={`${obj.class}-${i}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: '#ffffff',
                    border: `1px solid ${color}40`,
                    borderLeft: `4px solid ${color}`,
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-main)', textTransform: 'capitalize' }}>
                      {obj.class}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', fontFamily: 'JetBrains Mono', fontWeight: 600, color }}>
                      {Math.round(obj.score * 100)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Snapshot Capture Action */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
          <button
            className="btn btn-secondary btn-sm"
            style={{ width: '100%' }}
            onClick={handleCaptureSnapshot}
            disabled={!isCameraActive}
            title="Download frame with bounding boxes"
          >
            <Camera size={14} />
            <span>Capture Frame Snapshot</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <Shield size={12} color="#0d9488" />
            <span>Privacy guaranteed: Saved directly to your device only</span>
          </div>
        </div>
      </div>
    </div>
  );
};
