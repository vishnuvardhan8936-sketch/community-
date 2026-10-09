import React, { useState } from 'react';
import { useDetection } from '../../context/DetectionContext';
import {
  Play,
  Pause,
  Square,
  Sliders,
  Filter,
  Camera
} from 'lucide-react';
import { COCO_CLASSES } from '../../services/cocoClasses';

export const DetectionControls: React.FC = () => {
  const {
    isCameraActive,
    isDetectionPaused,
    startCamera,
    stopCamera,
    pauseDetection,
    resumeDetection,
    settings,
    updateSettings,
    isModelLoaded,
    availableCameras,
    selectedCameraId,
    setSelectedCameraId,
  } = useDetection();

  const [classSearch, setClassSearch] = useState('');
  const [showClassDropdown, setShowClassDropdown] = useState(false);

  const filteredClasses = COCO_CLASSES.filter(c =>
    c.toLowerCase().includes(classSearch.toLowerCase())
  );

  const toggleClass = (className: string) => {
    let updated: string[];
    if (settings.classFilters.includes(className)) {
      updated = settings.classFilters.filter(c => c !== className);
    } else {
      updated = [...settings.classFilters, className];
    }
    updateSettings({ classFilters: updated });
  };

  const clearAllFilters = () => {
    updateSettings({ classFilters: [] });
  };

  return (
    <div className="card-panel">
      <div className="card-panel-header">
        <h3 className="card-panel-title">
          <Sliders size={18} color="#2563eb" />
          <span>Inference Controls</span>
        </h3>
        <span className="badge badge-gray">Real-time parameters</span>
      </div>

      <div className="card-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Camera Device Selector if available */}
        {availableCameras.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Active Camera Sensor
              </label>
              <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
                {availableCameras.length} Detected
              </span>
            </div>
            <select
              className="select-control"
              style={{ width: '100%', fontSize: '0.82rem' }}
              value={selectedCameraId}
              onChange={e => {
                setSelectedCameraId(e.target.value);
                if (isCameraActive) {
                  stopCamera();
                  setTimeout(() => {
                    startCamera();
                  }, 250);
                }
              }}
            >
              {availableCameras.map((device, idx) => {
                const label = device.label || `Camera Device ${idx + 1}`;
                const isPhone = /phone|droid|iriun|camo|mobile|virtual|link/i.test(label);
                const isLaptop = /integrated|built-in|internal|facetime|webcam|front|chicony|realtek|hd camera/i.test(label);
                const prefix = isLaptop ? '💻 Laptop Webcam: ' : isPhone ? '📱 Phone / Remote: ' : '📷 Video Source: ';
                return (
                  <option key={device.deviceId || idx} value={device.deviceId}>
                    {prefix + label}
                  </option>
                );
              })}
            </select>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.3rem' }}>
              Defaults to your built-in laptop camera. Select a different source anytime.
            </span>
          </div>
        )}

        {/* Stream Actions */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {!isCameraActive ? (
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={startCamera}
              disabled={!isModelLoaded}
            >
              <Camera size={16} />
              <span>Start Camera</span>
            </button>
          ) : (
            <>
              {isDetectionPaused ? (
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, borderColor: '#10b981', color: '#166534' }}
                  onClick={resumeDetection}
                >
                  <Play size={15} />
                  <span>Resume Inference</span>
                </button>
              ) : (
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, borderColor: '#f59e0b', color: '#92400e' }}
                  onClick={pauseDetection}
                >
                  <Pause size={15} />
                  <span>Pause Inference</span>
                </button>
              )}
              <button
                className="btn btn-danger btn-sm"
                onClick={stopCamera}
                title="Stop webcam and release device tracks"
              >
                <Square size={14} />
                <span>Stop Stream</span>
              </button>
            </>
          )}
        </div>

        {/* Confidence Threshold Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Confidence Threshold
            </label>
            <span style={{ fontSize: '0.82rem', fontFamily: 'JetBrains Mono', fontWeight: 700, color: '#2563eb' }}>
              {Math.round(settings.minConfidence * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="95"
            step="5"
            value={Math.round(settings.minConfidence * 100)}
            onChange={e => updateSettings({ minConfidence: Number(e.target.value) / 100 })}
            style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <span>20% (More detections)</span>
            <span>95% (High precision)</span>
          </div>
        </div>

        {/* Maximum Objects Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Maximum Objects per Frame
            </label>
            <span style={{ fontSize: '0.82rem', fontFamily: 'JetBrains Mono', fontWeight: 700, color: '#2563eb' }}>
              {settings.maxObjects}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="25"
            step="1"
            value={settings.maxObjects}
            onChange={e => updateSettings({ maxObjects: Number(e.target.value) })}
            style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
          />
        </div>

        {/* Display Toggles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Visual Overlays
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={settings.showBoxes}
              onChange={e => updateSettings({ showBoxes: e.target.checked })}
              style={{ accentColor: '#2563eb' }}
            />
            <span>Draw Bounding Boxes</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={settings.showLabels}
              onChange={e => updateSettings({ showLabels: e.target.checked })}
              style={{ accentColor: '#2563eb' }}
            />
            <span>Show Class Labels</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={settings.showConfidence}
              onChange={e => updateSettings({ showConfidence: e.target.checked })}
              style={{ accentColor: '#2563eb' }}
            />
            <span>Show Confidence Percentage</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={settings.enableSoundAlerts}
              onChange={e => updateSettings({ enableSoundAlerts: e.target.checked })}
              style={{ accentColor: '#2563eb' }}
            />
            <span>Audio Chime on New Detections</span>
          </label>
        </div>

        {/* Class Filter Dropdown / Selector */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Filter size={14} color="#0d9488" />
              <span>Filter Allowed Classes</span>
            </label>
            {settings.classFilters.length > 0 && (
              <button
                onClick={clearAllFilters}
                style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600 }}
              >
                Reset ({settings.classFilters.length})
              </button>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <button
              className="select-control"
              style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              onClick={() => setShowClassDropdown(!showClassDropdown)}
            >
              <span>
                {settings.classFilters.length === 0
                  ? 'All 80 COCO Classes Allowed'
                  : `${settings.classFilters.length} classes active`}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>▼</span>
            </button>

            {showClassDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '105%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.75rem',
                  zIndex: 30,
                  maxHeight: 260,
                  overflowY: 'auto',
                }}
              >
                <input
                  type="text"
                  placeholder="Search classes (e.g., person, bottle)..."
                  value={classSearch}
                  onChange={e => setClassSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.4rem 0.6rem',
                    fontSize: '0.82rem',
                    border: '1px solid var(--border-light)',
                    borderRadius: '4px',
                    marginBottom: '0.5rem',
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {filteredClasses.map(cls => {
                    const isChecked = settings.classFilters.includes(cls);
                    return (
                      <label
                        key={cls}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          padding: '0.2rem 0.4rem',
                          borderRadius: '4px',
                          backgroundColor: isChecked ? '#eff6ff' : 'transparent',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleClass(cls)}
                          style={{ accentColor: '#2563eb' }}
                        />
                        <span style={{ textTransform: 'capitalize' }}>{cls}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
